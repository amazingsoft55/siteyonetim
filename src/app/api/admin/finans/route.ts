import { NextResponse } from "next/server";
import { and, eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import { transactions, payments } from "@/db/schema";

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN" || !session.siteId) return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  try {
    const list = await d.db
      .select()
      .from(transactions)
      .where(eq(transactions.siteId, session.siteId))
      .orderBy(desc(transactions.date));

    // Also get collected payments total to compute comprehensive balance
    const collectedPayments = await d.db
      .select({ amount: payments.amount })
      .from(payments)
      .where(and(eq(payments.siteId, session.siteId), eq(payments.status, "PAID")));

    const totalPaidDues = collectedPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

    const totalManualIncome = list
      .filter((t) => t.type === "INCOME")
      .reduce((acc, t) => acc + (t.amount || 0), 0);

    const totalExpense = list
      .filter((t) => t.type === "EXPENSE")
      .reduce((acc, t) => acc + (t.amount || 0), 0);

    const netBalance = totalPaidDues + totalManualIncome - totalExpense;

    return NextResponse.json({
      transactions: list,
      summary: {
        totalPaidDues,
        totalManualIncome,
        totalIncome: totalPaidDues + totalManualIncome,
        totalExpense,
        netBalance,
      },
    });
  } catch (e) {
    return jsonSqlError(e, "Finansal veriler alınamadı.");
  }
}

type CreateBody = {
  type?: "INCOME" | "EXPENSE";
  category?: string;
  title?: string;
  description?: string;
  amount?: number | string;
  date?: string;
  paymentMethod?: "BANK" | "CASH" | "CARD";
  receiptNo?: string;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN" || !session.siteId) return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  try {
    const raw = (await request.json()) as CreateBody;
    const type = raw.type === "EXPENSE" ? "EXPENSE" : "INCOME";
    const category = typeof raw.category === "string" && raw.category.trim() ? raw.category.trim() : "Genel";
    const title = typeof raw.title === "string" ? raw.title.trim() : "";
    const description = typeof raw.description === "string" ? raw.description.trim() : "";
    const amount = Number(raw.amount);
    const date = typeof raw.date === "string" && raw.date.trim() ? raw.date.trim() : new Date().toISOString().split("T")[0];
    const paymentMethod = raw.paymentMethod || "BANK";
    const receiptNo = typeof raw.receiptNo === "string" ? raw.receiptNo.trim() : undefined;

    if (!title) {
      return NextResponse.json({ error: "Başlık zorunludur." }, { status: 400 });
    }

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Geçerli bir tutar girin." }, { status: 400 });
    }

    const id = crypto.randomUUID();

    await d.db.insert(transactions).values({
      id,
      siteId: session.siteId,
      type,
      category,
      title,
      description: description || null,
      amount,
      date,
      paymentMethod,
      receiptNo: receiptNo || null,
    });

    return NextResponse.json({
      ok: true,
      message: `${type === "INCOME" ? "Gelir" : "Gider"} kaydı başarıyla eklendi.`,
      id,
    });
  } catch (e) {
    return jsonSqlError(e, "İşlem kaydedilemedi.");
  }
}
