import { NextResponse } from "next/server";
import { and, eq, inArray, sql } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import { users, payments } from "@/db/schema";


function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

/** Site sakinleri (USER) + ödenmemiş aidat toplamı */
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN" || !session.siteId) return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  try {
    const usr = await d.db
      .select({
        id: users.id,
        name: users.name,
        apartmentNo: users.apartmentNo,
      })
      .from(users)
      .where(and(eq(users.siteId, session.siteId), eq(users.role, "USER")));

    if (usr.length === 0) return NextResponse.json([]);

    const ids = usr.map((u) => u.id);
    const aggregates = await d.db
      .select({
        userId: payments.userId,
        total: sql<number>`coalesce(sum(${payments.amount}), 0)`.mapWith(Number),
      })
      .from(payments)
      .where(and(inArray(payments.userId, ids), eq(payments.status, "UNPAID")))
      .groupBy(payments.userId);

    const sumByUser = new Map<string, number>();
    for (const row of aggregates) {
      sumByUser.set(row.userId, row.total);
    }

    const out = usr.map((u) => {
      const borc = Math.round((sumByUser.get(u.id) ?? 0) * 100) / 100;
      return {
        id: u.id,
        name: u.name,
        blok: "—",
        daire: u.apartmentNo?.trim() ? u.apartmentNo : "—",
        borc,
        durum: borc > 0 ? "Borçlu" : "Düzenli",
      };
    });

    return NextResponse.json(out);
  } catch (e) {
    return jsonSqlError(e, "Sakin özeti alınamadı.");
  }
}
