import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";

import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { platformPublicContact } from "@/db/schema";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const d = acquireDatabase();
  if (!d.ok) return databaseUnavailable();

  const rows = await d.db.select().from(platformPublicContact).orderBy(desc(platformPublicContact.createdAt));
  return NextResponse.json(rows);
}
