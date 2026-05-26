import { NextResponse } from "next/server";

/**
 * SQLite hatalarını yapılandırılabilir API yanıtına çevirir.
 */
export function jsonSqlError(
  cause: unknown,
  fallback =
    "Veritabanı sorgusu başarısız. Şema için `npm run db:apply` veya drizzle/full-schema.sql dosyasına bakın.",
): NextResponse {
  const detail = cause instanceof Error ? cause.message : String(cause);
  const schemaLikelyStale =
    /no such table|no such column/i.test(detail) ||
    /\bSQLite error:?\s*no such\b/i.test(detail) ||
    /\bSQLITE_ERROR\b.*no such\b/i.test(detail);

  const error = schemaLikelyStale
    ? "Veritabanı şeması güncel değil veya eksik tablo/sütun var. Çalıştırın: npm run db:apply (kaynak: drizzle/full-schema.sql)"
    : fallback;

  return NextResponse.json(
    {
      error,
      code: schemaLikelyStale ? ("SCHEMA_OUTDATED" as const) : ("DB_QUERY_FAILED" as const),
      detail,
      kurulumUrl: "/kurulum",
    },
    { status: schemaLikelyStale ? 503 : 500 },
  );
}
