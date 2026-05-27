/// <reference types="@cloudflare/workers-types" />
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

/**
 * Cloudflare D1 ve dosya SQLite aynı Drizzle şeması ile çalışır; Worker tarafında
 * `drizzle-orm/d1` örneği bu tipe uyum için daraltılır.
 */
export type PlatformDatabase = BetterSQLite3Database<typeof schema>;

let sqliteMemo: BetterSQLite3Database<typeof schema> | null = null;

/**
 * Cloudflare Workers: `wrangler.toml` ile `binding = "DB"` D1 sağlar.
 * Yerelde (`next dev` / Node): bağlama yoksa `better-sqlite3` dosya SQLite’a düşülür.
 */
export async function getPlatformDb(): Promise<PlatformDatabase> {
  try {
    const mod = await import("@opennextjs/cloudflare");
    const ctx = await mod.getCloudflareContext({ async: true });
    const env = ctx.env as Record<string, unknown> | undefined;
    const rawDb = env?.DB;
    if (rawDb) {
      const { drizzle } = await import("drizzle-orm/d1");
      return drizzle(rawDb as D1Database, { schema }) as unknown as BetterSQLite3Database<typeof schema>;
    }
  } catch {
    /* Yerel SSR / saf Node: bağlam yok */
  }

  if (!sqliteMemo) {
    const internal = await import("./sqlite-internal");
    sqliteMemo = internal.getBetterSqliteDrizzle();
  }
  return sqliteMemo;
}
