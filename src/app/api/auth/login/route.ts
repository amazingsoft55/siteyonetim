import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import type { D1Database } from "@cloudflare/workers-types";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { signJwt } from "@/lib/auth";
import { cookies } from "next/headers";

export const runtime = "edge";

type LoginBody = {
  usernameOrPhone?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  try {
    const raw = (await request.json()) as LoginBody;
    const usernameOrPhone =
      typeof raw.usernameOrPhone === "string" ? raw.usernameOrPhone.trim() : "";
    const password = typeof raw.password === "string" ? raw.password : "";

    if (!usernameOrPhone || !password) {
      return NextResponse.json({ error: "Lütfen kullanıcı adı ve şifre girin." }, { status: 400 });
    }

    let dbBinding: D1Database | undefined;
    try {
      const { env } = getRequestContext() as { env: { DB?: D1Database } };
      dbBinding = env.DB;
    } catch {
      return NextResponse.json(
        {
          error:
            "Veritabanına bağlanılamıyor. Geliştirmede next.config.mjs içinde setupDevPlatform gerekir; D1 şeması ve ilk kullanıcı için /kurulum rehberine bakın.",
          code: "NO_CLOUDFLARE_CONTEXT",
          kurulumUrl: "/kurulum",
          setupStatusUrl: "/api/setup/status",
        },
        { status: 503 },
      );
    }

    const db = getDb(dbBinding);

    const loginColumns = {
      id: users.id,
      name: users.name,
      emailOrPhone: users.emailOrPhone,
      passwordHash: users.passwordHash,
      role: users.role,
      siteId: users.siteId,
      apartmentNo: users.apartmentNo,
    };

    const userList = await db.select(loginColumns).from(users).where(eq(users.emailOrPhone, usernameOrPhone)).limit(1);
    const user = userList[0];

    if (!user) {
      return NextResponse.json({ error: "Hatalı giriş bilgileri." }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json({ error: "Hatalı giriş bilgileri." }, { status: 401 });
    }

    const nowIso = new Date().toISOString();
    try {
      await db.update(users).set({ lastLoginAt: nowIso }).where(eq(users.id, user.id));
    } catch {
      /* Kolon/tablonun eski şemada olmaması girişi engellemesin; migrasyon için /kurulum */
    }

    // JWT oluştur
    const token = await signJwt({
      id: user.id,
      role: user.role,
      name: user.name,
      siteId: user.siteId,
      apartmentNo: user.apartmentNo,
    });

    // Cookie olarak ayarla (Next.js 15+: cookies() async)
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 gün
    });

    return NextResponse.json({
      message: "Giriş başarılı",
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        siteId: user.siteId
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Sunucu hatası", details: error.message }, { status: 500 });
  }
}
