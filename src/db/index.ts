import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { resolveSqliteDbPath } from "@/lib/database-path";
import * as schema from "./schema";

let _db: BetterSQLite3Database<typeof schema> | null = null;

/**
 * Tüm API route’ları için tek SQLite bağlantısı (Node.js ortamında).
 * `DATABASE_PATH` yoksa `data/siteyonetim.db` kullanılır; klasör yoksa oluşturulur.
 */
export function getDb() {
  if (_db) return _db;
  const filePath = resolveSqliteDbPath();
  const dir = path.dirname(filePath);
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch {
    /* yoksa açılışta better-sqlite3 hata verir */
  }
  const sqlite = new Database(filePath);
  try {
    sqlite.pragma("journal_mode = WAL");
  } catch {
    /* bazı ortamlar desteklemeyebilir */
  }
  try {
    sqlite.pragma("foreign_keys = ON");
  } catch {
    /* güvenlik: ilişkilere uymayı zorlar */
  }
  try {
    sqlite.pragma("busy_timeout = 10000");
  } catch {
    /* eşzamanlı yazış */
  }
  _db = drizzle(sqlite, { schema });
  return _db;
}

export function getBetterSqlitePath(): string {
  return resolveSqliteDbPath();
}
