import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "@/lib/notify";

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

/** Bildirimleri listele */
export async function GET() {
  const session = await getSession();
  if (!session) return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  const items = await getNotifications(d.db, session.id, 30);
  const unreadCount = await getUnreadCount(d.db, session.id);

  return NextResponse.json({
    notifications: items.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      type: n.type,
      href: n.href,
      read: n.readAt !== null,
      createdAt: n.createdAt,
    })),
    unreadCount,
  });
}

type PatchBody = { id?: unknown; action?: unknown };

/** Bildirimi okundu işaretle veya tümünü okundu işaretle */
export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  let raw: PatchBody;
  try {
    raw = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  if (raw.action === "readAll") {
    await markAllAsRead(d.db, session.id);
    return NextResponse.json({ success: true });
  }

  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  if (!id) {
    return NextResponse.json({ error: "Bildirim kimliği gereklidir." }, { status: 400 });
  }

  await markAsRead(d.db, id, session.id);
  return NextResponse.json({ success: true });
}
