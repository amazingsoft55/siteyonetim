import { NextResponse } from "next/server";
import { getPlatformDb } from "@/db/platform";
import { users, sites } from "@/db/schema";
import * as bcrypt from "bcryptjs";

/**
 * Opsiyonel: tabloda hiç site yokken ilk site + süper yöneticiyi ortam değişkenleriyle oluşturur (D1 uyumlu).
 * Üretimde çoğu kurulum doğrudan SQL veya panele güvenir; bu endpoint’i sıkı sınır ile koruyun.
 */
export async function GET() {
  try {
    const db = await getPlatformDb();

    const existingSites = await db.select().from(sites).limit(1);
    if (existingSites.length > 0) {
      return NextResponse.json({
        message: "Veritabanında zaten site kaydı var. Yeni site ve kullanıcılar süper yönetici panelinden oluşturulur.",
      });
    }

    const login = process.env.INITIAL_SUPER_ADMIN_LOGIN?.trim() ?? "";
    const pass = process.env.INITIAL_SUPER_ADMIN_PASSWORD ?? "";
    const siteName = process.env.INITIAL_SITE_NAME?.trim() ?? "";
    const siteAddress = process.env.INITIAL_SITE_ADDRESS?.trim() || null;
    const adminName = process.env.INITIAL_SUPER_ADMIN_NAME?.trim() || "Sistem yöneticisi";

    const missing: string[] = [];
    if (!login) missing.push("INITIAL_SUPER_ADMIN_LOGIN");
    if (!pass || pass.length < 8) missing.push("INITIAL_SUPER_ADMIN_PASSWORD (en az 8 karakter)");
    if (!siteName) missing.push("INITIAL_SITE_NAME");

    if (missing.length > 0) {
      return NextResponse.json(
        {
          error:
            "Tablolar boş; ortam değişkenleri eksik veya şifre kısa. Şemayı `drizzle/full-schema.sql` ile uygulayın; ilk kayıtlar süper yönetici panelinden veya uygun güvenilir import ile oluşturulmalıdır. Boş başlangıç için bu endpoint kullanılacaksa .env’de INITIAL_* alanlarını doldurun.",
          required: [
            "INITIAL_SUPER_ADMIN_LOGIN — oturum (e‑posta veya telefon)",
            "INITIAL_SUPER_ADMIN_PASSWORD — en az 8 karakter",
            "INITIAL_SITE_NAME — ilk site adı",
          ],
          optional: [
            "INITIAL_SITE_ADDRESS",
            "INITIAL_SUPER_ADMIN_NAME",
            "INITIAL_SUPER_ADMIN_MUST_CHANGE_PASSWORD=1",
          ],
          missingEnvHints: missing,
          kurulumUrl: "/kurulum",
        },
        { status: 400 },
      );
    }

    const siteId = crypto.randomUUID();
    const userId = crypto.randomUUID();

    await db.insert(sites).values({
      id: siteId,
      name: siteName,
      address: siteAddress ?? undefined,
    });

    const passwordHash = await bcrypt.hash(pass, 10);
    const promptFirstLogin = /^1|true|yes$/i.test(process.env.INITIAL_SUPER_ADMIN_MUST_CHANGE_PASSWORD?.trim() ?? "");

    await db.insert(users).values({
      id: userId,
      name: adminName,
      emailOrPhone: login,
      passwordHash,
      role: "SUPER_ADMIN",
      mustChangePassword: promptFirstLogin,
    });

    return NextResponse.json({
      message:
        "Kurulum tamamlandı: ilk site ve süper yönetici kaydedildi. Giriş: tanımladığınız INITIAL_SUPER_ADMIN_LOGIN ve şifre (yanıtta dönmez).",
      siteId,
      userId,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Seeding başarısız", details: msg }, { status: 500 });
  }
}
