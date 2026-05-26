import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { tryGetDb } from "@/lib/cloudflare-db";
import { userPresence } from "@/db/schema";

export const runtime = "edge";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const d = tryGetDb();
  if (!d.ok) {
    return NextResponse.json({ error: "Veritabanı bağlamı yok." }, { status: 503 });
  }

  let pathStr = "/";
  try {
    const raw = (await request.json()) as { path?: unknown };
    if (typeof raw.path === "string" && raw.path.length > 0 && raw.path.length < 512) {
      pathStr = raw.path;
    }
  } catch {
    /* body yok */
  }

  const now = new Date().toISOString();

  try {
    await d.db
      .insert(userPresence)
      .values({ userId: session.id, lastPath: pathStr, lastPingAt: now })
      .onConflictDoUpdate({
        target: userPresence.userId,
        set: { lastPath: pathStr, lastPingAt: now },
      });
  } catch {
    return NextResponse.json({ error: "Presence kaydı başarısız." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
