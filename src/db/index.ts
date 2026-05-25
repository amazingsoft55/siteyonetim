import { drizzle } from "drizzle-orm/d1";
import type { D1Database } from "@cloudflare/workers-types";
import * as schema from "./schema";

/** Yalnızca Cloudflare D1 (`env.DB`). Edge / Workers’ta better-sqlite3 kullanılmaz. */
export function getDb(d1: D1Database | undefined | null) {
  if (!d1) {
    throw new Error(
      "D1 bağlantısı yok. Cloudflare’da D1 binding’i ekleyin veya yerelde `wrangler pages dev` kullanın.",
    );
  }
  return drizzle(d1, { schema });
}
