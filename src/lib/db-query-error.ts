import { NextResponse } from "next/server";

/**
 * D1 / SQLite hatayı yapılandırılabilir yanıta çevirir (tarayıcı ve Cloudflare Logs’ta teşhis).
 */
export function jsonSqlError(
  cause: unknown,
  fallback =
    "Veritabanı sorgusu başarısız. Uzak D1 üzerinde şema uyumunu doğrulayın (bkz. drizzle/full-schema.sql).",
): NextResponse {
  const detail = cause instanceof Error ? cause.message : String(cause);
  const schemaLikelyStale = /no such table|no such column/i.test(detail);

  const error = schemaLikelyStale
    ? "Veritabanı şeması güncel değil veya eksik tablo/sütun var. Çalıştırın: npx wrangler d1 execute siteyonetim-db --remote --file=./drizzle/full-schema.sql"
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
