import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import { requests as residentRequests, users } from "@/db/schema";
import { dbRequestToClient, uiStatusToDb, type ClientRequestItem } from "@/lib/request-ui";
import { createNotification } from "@/lib/notify";
import { requireFeature } from "@/lib/feature-guard";


function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

async function forbiddenScope() {
  return NextResponse.json({ error: "Site kapsamı belirlenemedi." }, { status: 400 });
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  const featureCheck = await requireFeature(d.db, session.siteId, "requests");
  if (featureCheck) return featureCheck;

  const { searchParams } = new URL(request.url);
  const siteHint = searchParams.get("siteId");

  try {
    const order = desc(residentRequests.createdAt);

    if (session.role === "SUPER_ADMIN") {
      const sid = siteHint?.trim();
      if (!sid) {
        return NextResponse.json([]);
      }
      const rows = await d.db
        .select()
        .from(residentRequests)
        .where(eq(residentRequests.siteId, sid))
        .orderBy(order);
      return NextResponse.json(rows.map(dbRequestToClient) satisfies ClientRequestItem[]);
    }

    if (session.role === "ADMIN") {
      if (!session.siteId) return forbiddenScope();
      const rows = await d.db
        .select()
        .from(residentRequests)
        .where(eq(residentRequests.siteId, session.siteId))
        .orderBy(order);
      return NextResponse.json(rows.map(dbRequestToClient));
    }

    if (session.role === "USER") {
      const rows = await d.db
        .select()
        .from(residentRequests)
        .where(eq(residentRequests.userId, session.id))
        .orderBy(order);
      return NextResponse.json(rows.map(dbRequestToClient));
    }

    return forbidden();
  } catch (e) {
    return jsonSqlError(e, "Talepler yüklenemedi.");
  }
}

type PostBody = {
  title?: unknown;
  category?: unknown;
  description?: unknown;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "USER") return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  const featureCheck = await requireFeature(d.db, session.siteId, "requests");
  if (featureCheck) return featureCheck;

  if (!session.siteId) return forbiddenScope();

  let raw: PostBody;
  try {
    raw = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const subject = typeof raw.title === "string" ? raw.title.trim() : "";
  const description = typeof raw.description === "string" ? raw.description.trim() : "";
  const category =
    typeof raw.category === "string" && raw.category.trim().length > 0 ? raw.category.trim() : "Genel";

  if (!subject || !description) {
    return NextResponse.json({ error: "Başlık ve açıklama gereklidir." }, { status: 400 });
  }

  const id =
    typeof crypto !== "undefined" && crypto.randomUUID ?
      crypto.randomUUID()
    : `req-${Date.now()}`;

  try {
    await d.db.insert(residentRequests).values({
      id,
      userId: session.id,
      siteId: session.siteId,
      subject,
      description,
      category,
      status: "OPEN",
    });

    const row = await d.db.select().from(residentRequests).where(eq(residentRequests.id, id)).limit(1);
    const mapped = row[0] ? dbRequestToClient(row[0]) : null;

    // Site yöneticisine bildirim gönder
    try {
      const admins = await d.db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.siteId, session.siteId), eq(users.role, "ADMIN")));
      for (const admin of admins) {
        await createNotification(d.db, {
          userId: admin.id,
          title: `Yeni Talep: ${subject}`,
          body: `${session.name ?? "Bir sakin"} "${category}" kategorisinde yeni bir talep oluşturdu.`,
          type: "REQUEST",
          href: "/admin/requests",
        });
      }
    } catch {
      /* bildirim hatası ana işlemi bozmasın */
    }

    return NextResponse.json({ success: true, request: mapped });
  } catch (e) {
    return jsonSqlError(e, "Talep eklenemedi.");
  }
}

type PutBody = {
  id?: unknown;
  status?: unknown;
};

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN" || !session.siteId) return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  let raw: PutBody;
  try {
    raw = (await request.json()) as PutBody;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  const uiStatus =
    typeof raw.status === "string" ?
      raw.status.trim()
    : "";
  const allowed = ["Bekliyor", "İşlemde", "Çözüldü"];

  if (!id || !allowed.includes(uiStatus)) {
    return NextResponse.json({ error: "Geçersiz kimlik veya durum." }, { status: 400 });
  }

  try {
    const existing = await d.db
      .select()
      .from(residentRequests)
      .where(and(eq(residentRequests.id, id), eq(residentRequests.siteId, session.siteId)))
      .limit(1);

    if (!existing.length) {
      return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
    }

    await d.db
      .update(residentRequests)
      .set({ status: uiStatusToDb(uiStatus) })
      .where(eq(residentRequests.id, id));

    const row = await d.db.select().from(residentRequests).where(eq(residentRequests.id, id)).limit(1);

    // Talep sahibine durum değişikliği bildirimi
    if (row[0]) {
      const statusLabel = uiStatus === "Bekliyor" ? "Beklemede" : uiStatus === "İşlemde" ? "İşlemde" : "Çözüldü";
      createNotification(d.db, {
        userId: row[0].userId,
        title: `Talep Durumu Güncellendi`,
        body: `"${row[0].subject}" talebinin durumu "${statusLabel}" olarak güncellendi.`,
        type: "REQUEST",
        href: "/dashboard/requests",
      });
    }

    return NextResponse.json({
      success: true,
      request: row[0] ? dbRequestToClient(row[0]) : null,
    });
  } catch (e) {
    return jsonSqlError(e, "Durum güncellenemedi.");
  }
}
