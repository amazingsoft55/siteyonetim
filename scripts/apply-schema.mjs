import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function resolveSqliteDbPath() {
  const fromEnv = process.env.DATABASE_PATH?.trim();
  if (!fromEnv) return path.join(root, "data", "siteyonetim.db");
  return path.isAbsolute(fromEnv) ? fromEnv : path.join(root, fromEnv);
}

const dbPath = resolveSqliteDbPath();
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
try {
  sqlite.pragma("journal_mode = WAL");
} catch {}
try {
  sqlite.pragma("foreign_keys = ON");
} catch {}
try {
  sqlite.pragma("busy_timeout = 10000");
} catch {}

const sqlPath = path.join(root, "drizzle", "full-schema.sql");
const sql = fs.readFileSync(sqlPath, "utf8");
sqlite.exec(sql);
sqlite.close();

console.log("Tamam:", dbPath);
