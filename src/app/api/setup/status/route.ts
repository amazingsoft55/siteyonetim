import { NextResponse } from "next/server";
import { existsSync } from "node:fs";
import { count } from "drizzle-orm";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { resolveSqliteDbPath } from "@/lib/database-path";
import { getEmailProviderStatus } from "@/lib/email-config";
import { getStorageMeta } from "@/server/database/meta";
import { sites, users, adminSupportTickets } from "@/db/schema";

/** Sağlık kontrolü ve ilk kurulum metni: kimlik doğrulama gerektirmez. */
export async function GET() {
  const storage = await getStorageMeta();

  const ctx = await acquireDatabase();
  if (!ctx.ok) {
    const res = await databaseUnavailable();
    return res;
  }

  let sitesCount = 0;
  let usersCount = 0;

  try {
    const sc = await ctx.db.select({ c: count() }).from(sites);
    sitesCount = sc[0]?.c ?? 0;
    const uc = await ctx.db.select({ c: count() }).from(users);
    usersCount = uc[0]?.c ?? 0;
  } catch {
    const sqliteFilePath = storage.engine === "sqlite" ? resolveSqliteDbPath() : undefined;
    return NextResponse.json(
      {
        ok: false,
        code: "SCHEMA_MISSING",
        storage,
        sqliteFilePath,
        message: "`sites` veya `users` tabloları okunamadı.",
        hint:
          storage.engine === "d1" ?
            "`npm run db:d1:remote` ile tam şema dosyasını D1'e uygulayın (`drizzle/full-schema.sql`)."
          : "`npm run db:apply` ile `drizzle/full-schema.sql` dosyasını uygulayın.",
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
  const sqliteFilePath = storage.engine === "sqlite" ? resolveSqliteDbPath() : undefined;
  const email = getEmailProviderStatus();

  return NextResponse.json({
    ok: true,
    storage,
    emailConfigured: email.configured,
    emailProvider: email.provider,
    ...(email.configured ? {} : { emailMissing: email.missing }),
    ...(storage.engine === "sqlite" ?
      {
        sqliteFilePath,
        fileExistsOnDisk: sqliteFilePath ? existsSync(sqliteFilePath) : false,
      }
    : { fileExistsOnDisk: null }),
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
          storage.engine === "d1" ?
            "Panel kullanıcılarını D1'e eklemek için önce ilk süper yöneticiyi oluşturun: Cloudflare konsolundan tabloya INSERT veya (önerilir) ilk bir kez boştan `/api/seed` + `.env` veya güvenilir SQL importu."
          : "`npm run db:apply` veya `.env` ile `/api/seed` (tablolar boşsa) veya panelden ilk kullanıcıları oluşturun.",
      }
    : {}),
    ...(hasSupportTicketsTable ? {}
    : {
        optionalNote:
          "Şema güncellenmiş ise `npm run db:apply` (yerel) veya `npm run db:d1:remote` ile migration tekrarı yapılabilir.",
      }),
  });
}
