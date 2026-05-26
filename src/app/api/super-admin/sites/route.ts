import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import { sites } from "@/db/schema";

export const runtime = "nodejs";

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") return forbidden();

    const d = acquireDatabase();
    if (!d.ok) return databaseUnavailable();

    try {
      const list = await d.db.select().from(sites);
      return NextResponse.json(list);
    } catch (e) {
      return jsonSqlError(e, "Siteler listelenemedi.");
    }
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("[api/super-admin/sites GET]", detail);
    return NextResponse.json(
      {
        error: "Siteler listelenemedi (beklenmeyen sunucu hatası).",
        code: "UNHANDLED",
        detail,
        kurulumUrl: "/kurulum",
      },
      { status: 500 },
    );
  }
}

type SiteBody = { name?: unknown; address?: unknown };

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") return forbidden();

  const d = acquireDatabase();
  if (!d.ok) return databaseUnavailable();

  let raw: SiteBody;
  try {
    raw = (await request.json()) as SiteBody;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const address =
    typeof raw.address === "string" && raw.address.trim().length > 0 ? raw.address.trim() : null;

  if (!name) {
    return NextResponse.json({ error: "Site adı gereklidir." }, { status: 400 });
  }

  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `site-${Date.now()}`;

  try {
    await d.db.insert(sites).values({ id, name, address });
    const row = await d.db.select().from(sites).where(eq(sites.id, id)).limit(1);
    return NextResponse.json(row[0]);
  } catch (e) {
    return jsonSqlError(e, "Site kaydedilemedi.");
  }
}
