import { getRequestContext } from "@cloudflare/next-on-pages";

/**
 * Cloudflare D1 tanımlayıcıları — `wrangler.toml` içindeki `[[d1_databases]]` ile uyumlu kalmalı.
 * Gerçek bağlantı yalnızca Worker ortamında `env.DB` (binding). Buradaki ID isimleri teşhis ve API yanıtları içindir.
 */
export const D1_DATABASE_UUID_REPO = "c8b48f81-826f-4e7e-a1f9-580afa5321b5";

export const D1_DATABASE_NAME_REPO = "siteyonetim-db";

/** Worker env veya süreç env; yoksa repodaki varsayılan (panodaki DB ile eşleşmeli). */
export function resolveD1DisplayMeta(): {
  bindingName: "DB";
  databaseId: string;
  databaseName: string;
} {
  let fromWorkerId: string | undefined;
  let fromWorkerName: string | undefined;

  try {
    const { env } = getRequestContext() as { env: Record<string, unknown> };
    if (typeof env.D1_DATABASE_ID === "string" && env.D1_DATABASE_ID.trim()) {
      fromWorkerId = env.D1_DATABASE_ID.trim();
    }
    if (typeof env.D1_DATABASE_NAME === "string" && env.D1_DATABASE_NAME.trim()) {
      fromWorkerName = env.D1_DATABASE_NAME.trim();
    }
  } catch {
    /* next dev / istek dışı */
  }

  const databaseId = fromWorkerId ?? process.env.D1_DATABASE_ID?.trim() ?? D1_DATABASE_UUID_REPO;
  const databaseName =
    fromWorkerName ?? process.env.D1_DATABASE_NAME?.trim() ?? D1_DATABASE_NAME_REPO;

  return { bindingName: "DB", databaseId, databaseName };
}
