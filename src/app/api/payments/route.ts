import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export const runtime = "edge";

export async function GET() {
  try {
    const db = await readDb();
    return NextResponse.json(db.payments);
  } catch (err) {
    return NextResponse.json({ error: "Ödemeler yüklenemedi." }, { status: 500 });
  }
}

type PaymentPostBody = {
  amount?: unknown;
  period?: unknown;
  type?: unknown;
  cardName?: unknown;
};

export async function POST(request: Request) {
  try {
    const db = await readDb();
    const raw = (await request.json()) as PaymentPostBody;
    const { amount, period, type } = raw;

    const paymentAmount = Number(amount) || 1250;
    const paymentPeriod =
      typeof period === "string" && period.trim().length > 0 ? period : "Mayıs 2026";
    const paymentType =
      typeof type === "string" && type.trim().length > 0 ? type : "Kredi Kartı";

    // 1. Create payment transaction record
    const newPayment = {
      id: `PAY-${Math.floor(10000 + Math.random() * 90000)}`,
      period: paymentPeriod,
      amount: paymentAmount,
      date: new Date().toLocaleDateString("tr-TR"),
      status: "Başarılı",
      type: paymentType
    };

    // Prepend payment record
    db.payments = [newPayment, ...db.payments];

    // 2. Reset Ahmet Yılmaz's (id: 1) debt to 0 in residents table
    const ahmetIndex = db.residents.findIndex(r => r.id === 1);
    if (ahmetIndex !== -1) {
      db.residents[ahmetIndex].borc = 0;
      db.residents[ahmetIndex].durum = "Düzenli";
    }

    await writeDb(db);

    return NextResponse.json({ success: true, payment: newPayment });
  } catch (err) {
    return NextResponse.json({ error: "Ödeme işlemi başarısız oldu." }, { status: 500 });
  }
}
