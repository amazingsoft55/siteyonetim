import { NextResponse } from "next/server";
import { resolveSqliteDbPath } from "@/lib/database-path";
import { getDb, type PlatformDatabase } from "./connection";

/** Başarı/başarısız bağlantı sarmalı — route içinde dallanmak için kullanılır. */
export type DatabaseAccessResult =
  | { ok: true; db: PlatformDatabase }
  | { ok: false; cause: "open-failed" };

/**
 * Route handler’ların ortak kalıbı:
 * ```
 * const d = acquireDatabase(); if (!d.ok) return unavailableResponse(); ... d.db
 * ```
 */
export function acquireDatabase(): DatabaseAccessResult {
  try {
    return { ok: true, db: getDb() };
  } catch {
    return { ok: false, cause: "open-failed" };
  }
}

/**
 * Dosya SQLite açılmadığında (native modül eksikği, yanlış yol vb.) yapısal 503 gövdesi.
 */
export function databaseUnavailable(): NextResponse {
  const sqliteFilePath = resolveSqliteDbPath();
  return NextResponse.json(
    {
      error:
        "Veritabanı servisi kullanılamıyor (SQLite dosyası açılamadı). Yolu kontrol edin, `npm run db:apply` ile şemayı uygulayın; Windows ortamında `better-sqlite3` için gerekli derleme araçlarının kurulu olduğundan emin olun.",
      code: "DATABASE_UNAVAILABLE",
      sqliteFilePath,
      kurulumUrl: "/kurulum",
      docsUrl: "/kurulum",
      setupStatusUrl: "/api/setup/status",
      healthUrl: "/api/setup/status",
    },
    { status: 503 },
  );
}
