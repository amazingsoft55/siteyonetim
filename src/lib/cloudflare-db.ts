import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import type { D1Database } from "@cloudflare/workers-types";
import { getDb } from "@/db";
import { resolveD1DisplayMeta } from "@/lib/d1-config";

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

/** API route’larda 503: müşteri ve teşhis için ayrıntılı gövde (UI /kurulum’a yönlendirebilir). */
export function jsonDbUnavailable(error: "no-binding" | "no-context"): NextResponse {
  if (error === "no-binding") {
    return NextResponse.json(
      {
        error:
          "D1 bu Worker ortamında bağlı değil (env.DB). Dağıtımı bu projedeki wrangler.toml ile yapın; Cloudflare’de Worker → Ayarlar → Bağlamalar’da D1’in adı tam olarak \"DB\" olmalı. database_id veritabanı panonuzdakiyle aynı olmalı.",
        code: "NO_DB_BINDING",
        d1: resolveD1DisplayMeta(),
        kurulumUrl: "/kurulum",
        setupStatusUrl: "/api/setup/status",
      },
      { status: 503 },
    );
  }
  return NextResponse.json(
    {
      error:
        "Cloudflare D1 istek bağlamı oluşmadı. Uygulama D1’i yalnızca Cloudflare Workers (next-on-pages çıktısı) üzerinde veya yerelde `npm run dev` ile (SKIP_DEV_PLATFORM tanımlı olmamalı) kullanır. Vercel, düz Node veya `next start` ile D1 çalışmaz.",
      code: "NO_CLOUDFLARE_CONTEXT",
      d1: resolveD1DisplayMeta(),
      kurulumUrl: "/kurulum",
      setupStatusUrl: "/api/setup/status",
    },
    { status: 503 },
  );
}
