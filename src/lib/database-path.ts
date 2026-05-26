import path from "node:path";

/** Yerel/taşımış SQLite dosya yolu. Varsayılan: proje kökünde data/siteyonetim.db */
export function resolveSqliteDbPath(baseDir?: string): string {
  const root = baseDir ?? process.cwd();
  const fromEnv = process.env.DATABASE_PATH?.trim();
  if (!fromEnv) return path.join(root, "data", "siteyonetim.db");
  return path.isAbsolute(fromEnv) ? fromEnv : path.join(root, fromEnv);
}
