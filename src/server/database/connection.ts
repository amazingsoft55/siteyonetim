/** Sunucu veritabanı bağlantısı (`better-sqlite3` + Drizzle). */
export { getDb, getBetterSqlitePath } from "@/db";

export type PlatformDatabase = ReturnType<typeof import("@/db").getDb>;
