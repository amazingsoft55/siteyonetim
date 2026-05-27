import { resolveSqliteDbPath } from "@/lib/database-path";

/** Teşhis endpoint’leri ve loglar için depolama özetleri (D1 bağlıysa dosya yolu yoktur). */
export type StorageMeta =
  | { engine: "d1"; binding: string; hint: string }
  | { engine: "sqlite"; filePath: string };

export async function getStorageMeta(): Promise<StorageMeta> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as Record<string, unknown> | undefined;
    if (env?.DB)
      return {
        engine: "d1",
        binding: "DB",
        hint: "Cloudflare D1 — bağlama DB. Şema drizzle/full-schema.sql ile yüklenir.",
      };
  } catch {
    /* saf Node yerel SSR */
  }
  return { engine: "sqlite", filePath: resolveSqliteDbPath() };
}
