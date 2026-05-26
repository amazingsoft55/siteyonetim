import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";

import { getSession } from "@/lib/session";
import { tryGetDb, jsonDbUnavailable } from "@/lib/cloudflare-db";
import { platformPublicContact } from "@/db/schema";

export const runtime = "edge";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const d = tryGetDb();
  if (!d.ok) return jsonDbUnavailable(d.error);

  const rows = await d.db.select().from(platformPublicContact).orderBy(desc(platformPublicContact.createdAt));
  return NextResponse.json(rows);
}
