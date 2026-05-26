import { getRequestContext } from "@cloudflare/next-on-pages";
import type { D1Database } from "@cloudflare/workers-types";
import { getDb } from "@/db";

export type DrizzleDb = ReturnType<typeof getDb>;

export function tryGetDb():
  | { ok: true; db: DrizzleDb }
  | { ok: false; error: "no-binding" | "no-context" } {
  try {
    const { env } = getRequestContext() as { env: { DB?: D1Database } };
    if (!env.DB) return { ok: false, error: "no-binding" };
    return { ok: true, db: getDb(env.DB) };
  } catch {
    return { ok: false, error: "no-context" };
  }
}
