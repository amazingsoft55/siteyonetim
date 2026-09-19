import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import { transactions } from "@/db/schema";

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN" || !session.siteId) return forbidden();

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Kayıt ID eksik" }, { status: 400 });

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  try {
    await d.db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.siteId, session.siteId)));

    return NextResponse.json({ ok: true, message: "Kayıt silindi." });
  } catch (e) {
    return jsonSqlError(e, "Kayıt silinemedi.");
  }
}
