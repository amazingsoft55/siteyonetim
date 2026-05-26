import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import { announcements } from "@/db/schema";
import { announcementToClient } from "@/lib/announcement-ui";

export const runtime = "nodejs";

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

async function forbiddenScope() {
  return NextResponse.json({ error: "Site bilgisi yok." }, { status: 400 });
}
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return forbidden();

  const d = acquireDatabase();
  if (!d.ok) return databaseUnavailable();

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

  const d = acquireDatabase();
  if (!d.ok) return databaseUnavailable();

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

  const d = acquireDatabase();
  if (!d.ok) return databaseUnavailable();

  try {
    await d.db
      .delete(announcements)
      .where(and(eq(announcements.id, id), eq(announcements.siteId, session.siteId)));
    return NextResponse.json({ success: true });
  } catch (e) {
    return jsonSqlError(e, "Duyuru silinemedi.");
  }
}
