import { NextResponse } from "next/server";
import { count } from "drizzle-orm";
import { tryGetDb } from "@/lib/cloudflare-db";
import { sites, users, adminSupportTickets } from "@/db/schema";

export const runtime = "edge";

/** İlk kurulum ve teşhis: auth gerektirmez. */
export async function GET() {
  const ctx = tryGetDb();
  if (!ctx.ok) {
    const code =
      ctx.error === "no-binding" ?
        "NO_DB_BINDING"
      : "NO_CLOUDFLARE_CONTEXT";
    return NextResponse.json(
      {
        ok: false,
        code,
        message:
          code === "NO_CLOUDFLARE_CONTEXT" ?
            "Geliştirme ortamında Cloudflare bağlamı yok."
          : "D1 bağlaması (env.DB) bulunamı.",
        steps: [
          "next.config.mjs içinde NODE_ENV=development iken setupDevPlatform çalışır (SKIP_DEV_PLATFORM=1 ile kapatabilirsiniz).",
          "wrangler.toml içinde binding adı tam olarak DB olmalı.",
          `Şema: wrangler d1 execute siteyonetim-db --local --file=./drizzle/full-schema.sql`,
          "Örnek veri: Tarayıcıda GET /api/seed ardından /login → superadmin / admin123",
        ],
      },
      { status: 503 },
    );
  }

  let sitesCount = 0;
  let usersCount = 0;

  try {
    const sc = await ctx.db.select({ c: count() }).from(sites);
    sitesCount = sc[0]?.c ?? 0;
    const uc = await ctx.db.select({ c: count() }).from(users);
    usersCount = uc[0]?.c ?? 0;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        code: "SCHEMA_MISSING",
        message: "`sites` / `users` tabloları okunamadı.",
        hint: "drizzle/full-schema.sql dosyasını D1 üzerinde çalıştırın.",
      },
      { status: 500 },
    );
  }

  let hasSupportTicketsTable = false;
  try {
    await ctx.db.select().from(adminSupportTickets).limit(1);
    hasSupportTicketsTable = true;
  } catch {
    hasSupportTicketsTable = false;
  }

  const needsSeed = sitesCount === 0 || usersCount === 0;

  return NextResponse.json({
    ok: true,
    code:
      needsSeed ? "NEEDS_SEED"
      : !hasSupportTicketsTable ?
        "NEEDS_OPTIONAL_SUPPORT_MIGRATION"
      : "READY",
    database: "connected",
    sitesCount,
    usersCount,
    needsSeed,
    hasSupportTicketsTable,
    ...(needsSeed ? { nextStep: "/api/seed (GET) adresini tarayıcıda açın." } : {}),
    ...(hasSupportTicketsTable ? {}
    : {
        optionalNote:
          "Destek talepleri için drizzle/0002_admin_support_tickets.sql veya full-schema.sql içeriğini zaten çalıştırdıysanız bekleyebilir.",
      }),
  });
}
