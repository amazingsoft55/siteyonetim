import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { pageVisitsDaily } from "@/db/schema";


const ALLOWED = new Set(["/", "/iletisim", "/destek", "/hakkimizda"]);

type Body = { pathname?: unknown };

export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (/bot|crawl|spider|preview|lighthouse|pagespeed/i.test(ua)) {
    return NextResponse.json({ ok: true, skipped: "bot" });
  }

  let pathname = "/";
  try {
    const raw = (await request.json()) as Body;
    if (typeof raw.pathname === "string") {
      const p = raw.pathname.trim();
      if (ALLOWED.has(p)) pathname = p;
      else return NextResponse.json({ error: "Geçersiz yol" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Geçersiz gövde" }, { status: 400 });
  }

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  const day = new Date().toISOString().slice(0, 10);

  try {
    await d.db
      .insert(pageVisitsDaily)
      .values({ day, pathname, cnt: 1 })
      .onConflictDoUpdate({
        target: [pageVisitsDaily.day, pageVisitsDaily.pathname],
        set: { cnt: sql`${pageVisitsDaily.cnt} + 1` },
      });
  } catch {
    return NextResponse.json({ error: "Sayım kaydedilemedi" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
