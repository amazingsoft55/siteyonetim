import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { resolveSqliteDbPath } from "@/lib/database-path";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var _globalSqliteDb: BetterSQLite3Database<typeof schema> | undefined;
}

export function getBetterSqliteDrizzle(): BetterSQLite3Database<typeof schema> {
  if (process.env.NODE_ENV === "production") {
    return createDrizzleInstance();
  }

  if (!globalThis._globalSqliteDb) {
    globalThis._globalSqliteDb = createDrizzleInstance();
  }
  return globalThis._globalSqliteDb;
}

function createDrizzleInstance(): BetterSQLite3Database<typeof schema> {
  const filePath = resolveSqliteDbPath();
  const dir = path.dirname(filePath);

  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (error) {
    console.error("Database directory setup failed:", error instanceof Error ? error.message : String(error));
  }

  const sqlite = new Database(filePath);

  const runPragma = (query: string, description: string) => {
    try {
      sqlite.pragma(query);
    } catch (err) {
      console.warn(`Database pragma initialization failed (${description}):`, err instanceof Error ? err.message : String(err));
    }
  };

  runPragma("journal_mode = WAL", "WAL Mode");
  runPragma("foreign_keys = ON", "Foreign Keys Constraint");
  runPragma("busy_timeout = 10000", "Busy Timeout");

  return drizzle(sqlite, { schema });
}

export function getBetterSqlitePath(): string {
  return resolveSqliteDbPath();
}
