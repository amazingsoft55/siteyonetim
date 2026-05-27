import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import { deleteSiteCascade } from "@/lib/user-cascade-delete";
import { sites } from "@/db/schema";

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") return forbidden();

  const { id: siteId } = await ctx.params;
  if (!siteId?.trim()) {
    return NextResponse.json({ error: "Site kimliği eksik" }, { status: 400 });
  }

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  const row = await d.db.select().from(sites).where(eq(sites.id, siteId)).limit(1);
  if (!row[0]) {
    return NextResponse.json({ error: "Site bulunamadı." }, { status: 404 });
  }

  try {
    await deleteSiteCascade(d.db, siteId);
    return NextResponse.json({ success: true });
  } catch (e) {
    return jsonSqlError(e, "Site silinemedi.");
  }
}
