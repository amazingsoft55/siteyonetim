import { NextResponse } from "next/server";
import type { PlatformDatabase } from "@/db/platform";
import { getPlatformDb } from "@/db/platform";
import { getStorageMeta } from "@/server/database/meta";

/** Başarı/başarısız bağlantı sarmalı — route içinde dallanmak için kullanılır. */
export type DatabaseAccessResult =
  | { ok: true; db: PlatformDatabase }
  | { ok: false; cause: "open-failed" };

/**
 * ```
 * const d = await acquireDatabase(); if (!d.ok) return await databaseUnavailable(); ... d.db
 * ```
 */
export async function acquireDatabase(): Promise<DatabaseAccessResult> {
  try {
    const db = await getPlatformDb();
    return { ok: true, db };
  } catch {
    return { ok: false, cause: "open-failed" };
  }
}

/**
 * Drizzle’a ulaşılamadığında 503 gövdesi (D1 veya yerel SQLite ayrımı dahil).
 */
export async function databaseUnavailable(): Promise<NextResponse> {
  const meta = await getStorageMeta();
  const baseError =
    meta.engine === "d1" ?
      "Veritabanı servisi kullanılamıyor (Cloudflare D1). Worker’da binding adı tam olarak DB olmalı ve şema uygulanmış olmalıdır."
    : "Veritabanı servisi kullanılamıyor (dosya SQLite açılamadı). Yolu ve izinleri kontrol edin.";

  const steps =
    meta.engine === "d1" ?
      [
        "`wrangler.toml` içinde `[[d1_databases]]` binding = `DB` ve Cloudflare’deki veritabanı kimliğiniz.",
        "Şema: `npm run db:d1:remote` (veya `wrangler d1 execute siteyon --remote --file drizzle/full-schema.sql`).",
      ]
    : [
        "`npm install` tamam olduğundan emin olun (`better-sqlite3` native derlemesi gerekebilir).",
        "Şema: `npm run db:apply` (`drizzle/full-schema.sql`).",
        "İsteğe bağlı: `.env` içinde `DATABASE_PATH`.",
      ];

  return NextResponse.json(
    {
      error: baseError,
      code: "DATABASE_UNAVAILABLE",
      storage: meta,
      sqliteFilePath: meta.engine === "sqlite" ? meta.filePath : undefined,
      steps,
      kurulumUrl: "/kurulum",
      docsUrl: "/kurulum",
      setupStatusUrl: "/api/setup/status",
      healthUrl: "/api/setup/status",
    },
    { status: 503 },
  );
}
