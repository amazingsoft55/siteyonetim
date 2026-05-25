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

type SettingsPostBody = {
  aidat?: unknown;
  managerName?: unknown;
  iban?: unknown;
  bankName?: unknown;
  phone?: unknown;
};

export async function POST(request: Request) {
  try {
    const db = await readDb();
    const raw = (await request.json()) as SettingsPostBody;

    const strOrFallback = (v: unknown, fallback: string): string =>
      typeof v === "string" && v.trim().length > 0 ? v.trim() : fallback;

    db.settings = {
      aidat: raw.aidat !== undefined ? String(raw.aidat) : db.settings.aidat,
      managerName: strOrFallback(raw.managerName, db.settings.managerName),
      iban: strOrFallback(raw.iban, db.settings.iban),
      bankName: strOrFallback(raw.bankName, db.settings.bankName),
      phone: strOrFallback(raw.phone, db.settings.phone),
    };

    await writeDb(db);
    return NextResponse.json({ success: true, settings: db.settings });
  } catch (err) {
    return NextResponse.json({ error: "Ayarlar kaydedilemedi." }, { status: 500 });
  }
}
