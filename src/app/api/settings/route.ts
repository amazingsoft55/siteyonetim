import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import { siteSettings } from "@/db/schema";

type SiteSettingRow = InferSelectModel<typeof siteSettings>;


function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

function clientShape(row: SiteSettingRow | undefined) {
  return {
    aidat: row?.defaultAidat?.trim() || "0",
    managerName: row?.managerName?.trim() || "",
    iban: row?.iban?.trim() || "",
    bankName: row?.bankName?.trim() || "",
    phone: row?.phone?.trim() || "",
  };
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  let siteId: string | null = null;
  const { searchParams } = new URL(request.url);

  if (!["ADMIN", "USER", "SUPER_ADMIN"].includes(session.role)) {
    return forbidden();
  }

  if (session.role === "SUPER_ADMIN") {
    siteId = searchParams.get("siteId")?.trim() ?? null;
  } else {
    siteId = session.siteId ?? null;
  }

  if (!siteId) {
    return NextResponse.json(clientShape(undefined));
  }

  try {
    const row = await d.db.select().from(siteSettings).where(eq(siteSettings.siteId, siteId)).limit(1);
    return NextResponse.json(clientShape(row[0]));
  } catch (e) {
    return jsonSqlError(e, "Ayarlar yüklenemedi.");
  }
}

type Body = {
  aidat?: unknown;
  managerName?: unknown;
  iban?: unknown;
  bankName?: unknown;
  phone?: unknown;
  siteId?: unknown;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  let raw: Body;
  try {
    raw = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const siteId =
    session.role === "ADMIN" ? session.siteId
    : typeof raw.siteId === "string" ? raw.siteId.trim()
    : null;

  if (!siteId) {
    return NextResponse.json({ error: "siteId zorunludur." }, { status: 400 });
  }

  const defaults = clientShape(undefined);
  const merged = {
    defaultAidat: raw.aidat !== undefined ? String(raw.aidat) : defaults.aidat,
    managerName:
      typeof raw.managerName === "string" ? raw.managerName.trim() || defaults.managerName : defaults.managerName,
    iban: typeof raw.iban === "string" ? raw.iban.trim() || defaults.iban : defaults.iban,
    bankName:
      typeof raw.bankName === "string" ? raw.bankName.trim() || defaults.bankName : defaults.bankName,
    phone: typeof raw.phone === "string" ? raw.phone.trim() || defaults.phone : defaults.phone,
  };

  const nowIso = new Date().toISOString();

  try {
    const existing = await d.db.select().from(siteSettings).where(eq(siteSettings.siteId, siteId)).limit(1);
    if (existing.length === 0) {
      await d.db.insert(siteSettings).values({
        siteId,
        ...merged,
        updatedAt: nowIso,
      });
    } else {
      await d.db
        .update(siteSettings)
        .set({ ...merged, updatedAt: nowIso })
        .where(eq(siteSettings.siteId, siteId));
    }

    const row = await d.db.select().from(siteSettings).where(eq(siteSettings.siteId, siteId)).limit(1);
    return NextResponse.json({ success: true, settings: clientShape(row[0]) });
  } catch (e) {
    return jsonSqlError(e, "Ayarlar kaydedilemedi.");
  }
}
