import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { tryGetDb } from "@/lib/cloudflare-db";
import { pageVisitsDaily } from "@/db/schema";

export const runtime = "edge";

const ALLOWED = new Set(["/", "/iletisim", "/hakkimizda", "/kurulum"]);

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

  const d = tryGetDb();
  if (!d.ok) {
    return NextResponse.json({ error: "Veritabanı bağlamı yok." }, { status: 503 });
  }

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
