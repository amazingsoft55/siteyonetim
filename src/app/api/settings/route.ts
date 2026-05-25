import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export const runtime = "edge";

export async function GET() {
  try {
    const db = await readDb();
    return NextResponse.json(db.settings);
  } catch (err) {
    return NextResponse.json({ error: "Ayarlar yüklenemedi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = await readDb();
    const { aidat, managerName, iban, bankName, phone } = await request.json();

    db.settings = {
      aidat: aidat !== undefined ? aidat.toString() : db.settings.aidat,
      managerName: managerName || db.settings.managerName,
      iban: iban || db.settings.iban,
      bankName: bankName || db.settings.bankName,
      phone: phone || db.settings.phone
    };

    await writeDb(db);
    return NextResponse.json({ success: true, settings: db.settings });
  } catch (err) {
    return NextResponse.json({ error: "Ayarlar kaydedilemedi." }, { status: 500 });
  }
}
