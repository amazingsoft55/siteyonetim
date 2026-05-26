import { NextResponse } from "next/server";
import type { D1Database } from "@cloudflare/workers-types";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getDb } from "@/db";
import { users, sites } from "@/db/schema";
import * as bcrypt from "bcryptjs";

export const runtime = "edge";

/**
 * Tek seferlik kurulum: boş DB'de ilk site + süper yönetici.
 * Sabit kullanıcı/şifre yok — değerler yalnızca sunucu ortamından okunur.
 */
export async function GET() {
  try {
    let dbBinding: D1Database | undefined;
    try {
      const { env } = getRequestContext() as { env: { DB?: D1Database } };
      dbBinding = env.DB;
    } catch {
      return NextResponse.json(
        {
          error:
            "D1 bağlantısı yok. Yerelde `npm run dev` ile geliştirme için projede Cloudflare geliştirme platformunun etkin olduğundan emin olun (/kurulum).",
          code: "NO_CLOUDFLARE_CONTEXT",
          kurulumUrl: "/kurulum",
        },
        { status: 503 },
      );
    }

    const db = getDb(dbBinding);

    const existingSites = await db.select().from(sites).limit(1);
    if (existingSites.length > 0) {
      return NextResponse.json({
        message: "Veritabanı zaten kurulu.",
        hint: "Giriş için D1 kayıtlı kullanıcı adı ve şifrenizi kullanın. Yeni site ve kullanıcılar süper yönetici panelinden eklenir.",
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
          error: "İlk kurulum için ortam değişkenleri eksik veya şifre çok kısa.",
          required: [
            "INITIAL_SUPER_ADMIN_LOGIN — oturum (e‑posta veya telefon), D1 kullanıcı satırına yazılır",
            "INITIAL_SUPER_ADMIN_PASSWORD — en az 8 karakter, yalnızca sunucuda",
            "INITIAL_SITE_NAME — ilk site adı",
          ],
          optional: ["INITIAL_SITE_ADDRESS", "INITIAL_SUPER_ADMIN_NAME", "INITIAL_SUPER_ADMIN_MUST_CHANGE_PASSWORD=1 (ilk girişte /sifre-belirle)"],
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
        "Kurulum tamamlandı: ilk site ve süper yönetici D1'e kaydedildi. Giriş için tanımladığınız INITIAL_SUPER_ADMIN_LOGIN ve şifre ile /login üzerinden oturum açın. Şifre yanıtta ve loglarda yer almaz.",
      siteId,
      userId,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Seeding başarısız", details: msg }, { status: 500 });
  }
}
