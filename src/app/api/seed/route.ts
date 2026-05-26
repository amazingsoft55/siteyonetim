import { NextResponse } from "next/server";
import type { D1Database } from "@cloudflare/workers-types";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getDb } from "@/db";
import { users, sites } from "@/db/schema";
import * as bcrypt from "bcryptjs";

export const runtime = "edge";

/** Tek seferlik kurulum: 1 demo site + süper admin. Diğer tüm kullanıcılar panele eklenir. */
export async function GET() {
  try {
    let dbBinding: D1Database | undefined;
    try {
      const { env } = getRequestContext() as { env: { DB?: D1Database } };
      dbBinding = env.DB;
    } catch {
      return NextResponse.json(
        { error: "Seed için Cloudflare D1 bağlamı gerekli (yerelde wrangler pages dev)." },
        { status: 503 },
      );
    }

    const db = getDb(dbBinding);

    const existingSites = await db.select().from(sites).limit(1);
    if (existingSites.length > 0) {
      return NextResponse.json({
        message: "Veritabanı zaten kurulu.",
        hint: 'Süper admin panelinden site ve kullanıcı ekleyebilirsiniz. Giriş: /login (ör. süper kullanıcı: "superadmin" / Şifre: kurulum sırasında belirlendi)',
      });
    }

    const siteId = "site-1";
    await db.insert(sites).values({
      id: siteId,
      name: "Gül Apartmanı",
      address: "Çankaya, Ankara",
    });

    const superAdminPassword = await bcrypt.hash("admin123", 10);
    await db.insert(users).values({
      id: "superadmin",
      name: "Sistem Süper Yöneticisi",
      emailOrPhone: "superadmin",
      passwordHash: superAdminPassword,
      role: "SUPER_ADMIN",
    });

    return NextResponse.json({
      message:
        'Kurulum tamamlandı: 1 örnek site + süper yönetici. Giriş: kullanıcı "superadmin" / şifre "admin123" (anında değiştirin). Yöneticiler ve sakin kullanıcılar: Süper Admin → Kullanıcılar.',
      siteId,
      superAdminLogin: "superadmin",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Seeding başarısız", details: msg }, { status: 500 });
  }
}
