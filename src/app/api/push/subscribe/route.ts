import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import { pushSubscriptions } from "@/db/schema";

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  let body: { endpoint?: string; p256dh?: string; auth?: string };
  try {
    body = (await request.json()) as { endpoint?: string; p256dh?: string; auth?: string };
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const { endpoint, p256dh, auth } = body;
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
  }

  try {
    // Aynı endpoint varsa güncelle
    const existing = await d.db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint))
      .limit(1);

    if (existing.length > 0) {
      await d.db
        .update(pushSubscriptions)
        .set({ userId: session.id, p256dh, auth, userAgent: request.headers.get("user-agent") || null })
        .where(eq(pushSubscriptions.endpoint, endpoint));
    } else {
      // Bu kullanıcıya ait eski abonelikleri temizle (sadece 1 tane kalsın)
      await d.db
        .delete(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, session.id));

      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `push-${Date.now()}`;

      await d.db.insert(pushSubscriptions).values({
        id,
        userId: session.id,
        endpoint,
        p256dh,
        auth,
        userAgent: request.headers.get("user-agent") || null,
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return jsonSqlError(e, "Abonelik kaydedilemedi.");
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");

  try {
    if (endpoint) {
      await d.db
        .delete(pushSubscriptions)
        .where(
          and(
            eq(pushSubscriptions.userId, session.id),
            eq(pushSubscriptions.endpoint, endpoint),
          ),
        );
    } else {
      await d.db
        .delete(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, session.id));
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return jsonSqlError(e, "Abonelik silinemedi.");
  }
}
