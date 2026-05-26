import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { tryGetDb, jsonDbUnavailable } from "@/lib/cloudflare-db";
import { sites } from "@/db/schema";

export const runtime = "edge";

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") return forbidden();

  const d = tryGetDb();
  if (!d.ok) return jsonDbUnavailable(d.error);

  const list = await d.db.select().from(sites);
  return NextResponse.json(list);
}

type SiteBody = { name?: unknown; address?: unknown };

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") return forbidden();

  const d = tryGetDb();
  if (!d.ok) return jsonDbUnavailable(d.error);

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

  await d.db.insert(sites).values({ id, name, address });
  const row = await d.db.select().from(sites).where(eq(sites.id, id)).limit(1);
  return NextResponse.json(row[0]);
}
