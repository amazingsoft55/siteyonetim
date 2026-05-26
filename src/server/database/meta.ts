import { resolveSqliteDbPath } from "@/lib/database-path";

/** Teşhis endpoint’leri ve loglar için depolama özetleri. */
export function getStorageMeta(): { engine: "sqlite"; filePath: string } {
  return { engine: "sqlite", filePath: resolveSqliteDbPath() };
}
