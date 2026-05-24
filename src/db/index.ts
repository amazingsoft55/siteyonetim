import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

let sqliteDb: any = null;

// Cloudflare ortamında env.DB üzerinden, lokal ortamda mock DB üzerinden çalışacak
export function getDb(envDB?: any) {
  if (envDB) {
    return drizzleD1(envDB, { schema });
  }

  // Lokal geliştirme için fallback
  if (!sqliteDb) {
    const sqlite = new Database(".wrangler/state/v3/d1/miniflare-D1DatabaseObject/c8b48f81-826f-4e7e-a1f9-580afa5321b5.sqlite");
    sqliteDb = drizzleSqlite(sqlite, { schema });
  }
  return sqliteDb;
}
