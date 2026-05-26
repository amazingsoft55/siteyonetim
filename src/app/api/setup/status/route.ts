import { NextResponse } from "next/server";
import { existsSync } from "node:fs";
import { count } from "drizzle-orm";
import { acquireDatabase } from "@/server/database/access";
import { resolveSqliteDbPath } from "@/lib/database-path";
import { getStorageMeta } from "@/server/database/meta";
import { sites, users, adminSupportTickets } from "@/db/schema";

export const runtime = "nodejs";

/** Sağlık kontrolü ve ilk kurulum metni: kimlik doğrulama gerektirmez. */
export async function GET() {
  const sqliteFilePath = resolveSqliteDbPath();
  const storage = getStorageMeta();

  const ctx = acquireDatabase();
  if (!ctx.ok) {
    return NextResponse.json(
      {
        ok: false,
        code: "DATABASE_UNAVAILABLE",
        storage,
        sqliteFilePath,
        fileExistsOnDisk: existsSync(sqliteFilePath),
        message: "SQLite dosyası açılamıyor veya yerel sürücü erişilemiyor.",
        steps: [
          "`npm install` tamam olduğundan emin olun (`better-sqlite3` native derlemesi gerekebilir).",
          "Şema ve deme yönetici için: `npm run db:apply` (`drizzle/full-schema.sql`).",
          "İsteğe bağlı: `.env` içinde `DATABASE_PATH` ile dosya konumunu ayarlayın.",
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
        storage,
        sqliteFilePath,
        message: "`sites` veya `users` tabloları okunamadı.",
        hint: "`npm run db:apply` çalıştırın.",
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
    storage,
    sqliteFilePath,
    fileExistsOnDisk: existsSync(sqliteFilePath),
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
    ...(needsSeed ?
      {
        nextStep:
          "`npm run db:apply` ile deme süper kullanıcı dahil şemayı yükleyin veya boş tabloda `.env` ile `/api/seed`.",
      }
    : {}),
    ...(hasSupportTicketsTable ? {}
    : {
        optionalNote:
          "Şema eksik tablolar içeriyorsa `drizzle/full-schema.sql` dosyasını yeniden `npm run db:apply` ile uygulayın.",
      }),
  });
}
