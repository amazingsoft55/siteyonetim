import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import { announcements, users } from "@/db/schema";
import { announcementToClient } from "@/lib/announcement-ui";
import { createBulkNotifications } from "@/lib/notify";
import { sendAnnouncementEmail } from "@/lib/send-email";
import { looksLikeEmail } from "@/lib/password-reset";
import { requireFeature } from "@/lib/feature-guard";


function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

async function forbiddenScope() {
  return NextResponse.json({ error: "Site bilgisi yok." }, { status: 400 });
}
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  const { searchParams } = new URL(request.url);
  const hint = searchParams.get("siteId");

  try {
    if (session.role === "SUPER_ADMIN") {
      const sid = hint?.trim();
      if (!sid) return NextResponse.json([]);
      const rows = await d.db
        .select()
        .from(announcements)
        .where(eq(announcements.siteId, sid))
        .orderBy(desc(announcements.createdAt));
      return NextResponse.json(rows.map(announcementToClient));
    }

    if (!session.siteId) return forbiddenScope();

    const rows = await d.db
      .select()
      .from(announcements)
      .where(eq(announcements.siteId, session.siteId))
      .orderBy(desc(announcements.createdAt));

    return NextResponse.json(rows.map(announcementToClient));
  } catch (e) {
    return jsonSqlError(e, "Duyurular yüklenemedi.");
  }
}

type PostBody = {
  title?: unknown;
  content?: unknown;
  category?: unknown;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return forbidden();
  if (!session.siteId) return forbiddenScope();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  let raw: PostBody;
  try {
    raw = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const content = typeof raw.content === "string" ? raw.content.trim() : "";
  const category =
    typeof raw.category === "string" && raw.category.trim().length > 0 ? raw.category.trim() : "Genel";

  if (!title || !content) {
    return NextResponse.json({ error: "Başlık ve içerik zorunludur." }, { status: 400 });
  }

  const id =
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `ann-${Date.now()}`;

  try {
    await d.db.insert(announcements).values({
      id,
      siteId: session.siteId,
      title,
      content,
      category,
    });

    const row = await d.db.select().from(announcements).where(eq(announcements.id, id)).limit(1);

    // Sitedeki tüm kullanıcılarına bildirim + email gönder
    try {
      const siteUsers = await d.db
        .select({ id: users.id, name: users.name, emailOrPhone: users.emailOrPhone })
        .from(users)
        .where(and(eq(users.siteId, session.siteId)));

      const userIds = siteUsers.map((u) => u.id);
      if (userIds.length > 0) {
        // Uygulama içi bildirim (tüm kullanıcılara)
        await createBulkNotifications(d.db, userIds, {
          title: `Yeni Duyuru: ${title}`,
          body: content.length > 100 ? content.slice(0, 100) + "..." : content,
          type: "ANNOUNCEMENT",
          href: "/dashboard/announcements",
        });

        // Email bildirimi (sadece geçerli email adresi olanlara, yayıncı hariç)
        const emailsToSend = siteUsers.filter(
          (u) => u.id !== session.id && looksLikeEmail(u.emailOrPhone),
        );
        console.log(`[announcements] ${emailsToSend.length} kullanıcıya email gönderilecek`);
        for (const u of emailsToSend) {
          const result = await sendAnnouncementEmail(u.emailOrPhone, u.name, title, content, category);
          if (!result.ok) {
            console.error(`[announcements] Email gönderilemedi: ${u.emailOrPhone} — ${result.error}`);
          } else {
            console.log(`[announcements] Email gönderildi: ${u.emailOrPhone}`);
          }
        }
      }
    } catch {
      /* bildirim hatası ana işlemi bozmasın */
    }

    return NextResponse.json({
      success: true,
      announcement: row[0] ? announcementToClient(row[0]) : null,
    });
  } catch (e) {
    return jsonSqlError(e, "Duyuru oluşturulamadı.");
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return forbidden();
  if (!session.siteId) return forbiddenScope();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();

  if (!id) {
    return NextResponse.json({ error: "Kimlik gereklidir." }, { status: 400 });
  }

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  try {
    await d.db
      .delete(announcements)
      .where(and(eq(announcements.id, id), eq(announcements.siteId, session.siteId)));
    return NextResponse.json({ success: true });
  } catch (e) {
    return jsonSqlError(e, "Duyuru silinemedi.");
  }
}
