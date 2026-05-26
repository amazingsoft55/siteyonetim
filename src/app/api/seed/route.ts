import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { users, sites } from "@/db/schema";
import * as bcrypt from "bcryptjs";

export const runtime = "nodejs";

/**
 * Opsiyonel: SQL seed uygulanmamış, boş tabloda ortamdan ilk site + süper yönetici.
 * Dosyalı kurulum için `drizzle/full-schema.sql` içindeki deme blokunu kullanın.
 */
export async function GET() {
  try {
    const db = getDb();

    const existingSites = await db.select().from(sites).limit(1);
    if (existingSites.length > 0) {
      return NextResponse.json({
        message:
          "Veritabanı zaten kurulu. Deme süper kullanıcı full-schema ile eklendiyseniz `yonetici@demo.local` / `Admin123!` ile deneyin.",
        hint: "Yeni site ve kullanıcılar süper yönetici panelinden eklenir.",
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
            "Tablolar boş; ortam değişkenleri eksik veya şifre kısa. Tam şema ve deme kullanıcı için: `npm run db:apply`.",
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
