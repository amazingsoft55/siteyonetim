import { NextResponse } from "next/server";
import { getPlatformDb } from "@/db/platform";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { signJwt } from "@/lib/auth";
import { cookies } from "next/headers";
import { databaseUnavailable } from "@/server/database/access";
import type { PlatformDatabase } from "@/db/platform";
import { createNotification } from "@/lib/notify";
import { sendBrandedEmail } from "@/lib/send-email";
import { buildBrandedEmailHtml } from "@/lib/email-template";
import { looksLikeEmail } from "@/lib/password-reset";
import { getPublicSiteUrl } from "@/lib/site-url";

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

    let db: PlatformDatabase;
    try {
      db = await getPlatformDb();
    } catch {
      return await databaseUnavailable();
    }

    const loginColumns = {
      id: users.id,
      name: users.name,
      emailOrPhone: users.emailOrPhone,
      passwordHash: users.passwordHash,
      role: users.role,
      siteId: users.siteId,
      apartmentNo: users.apartmentNo,
      mustChangePassword: users.mustChangePassword,
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
      /* kolon/tablonun eksik olduğu ortamları yumuşatmak için */
    }

    const mustChangePassword = user.mustChangePassword === true;

    const token = await signJwt({
      id: user.id,
      role: user.role,
      name: user.name,
      siteId: user.siteId,
      apartmentNo: user.apartmentNo,
      mcp: mustChangePassword,
    });

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    // Hoşgeldin bildirimi + email (her girişte — sadece USER rolüne)
    if (user.role === "USER") {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";
      createNotification(db, {
        userId: user.id,
        title: `${greeting}, ${user.name}!`,
        body: "Site yönetim platformuna hoş geldiniz. Aidatlarınızı görüntüleyebilir, duyuruları takip edebilir ve taleplerinizi iletebilirsiniz.",
        type: "WELCOME",
        href: "/dashboard",
      });

      // İlk girişte hoşgeldin emaili
      if (looksLikeEmail(user.emailOrPhone)) {
        const siteUrl = getPublicSiteUrl();
        const emailResult = await sendBrandedEmail({
          to: user.emailOrPhone,
          subject: `${greeting}, ${user.name}! — Hoş Geldiniz`,
          html: buildBrandedEmailHtml({
            title: `${greeting}!`,
            intro: `Sitemize başarıyla giriş yaptınız. Portal üzerinden aidatlarınızı görüntüleyebilir, duyuruları takip edebilir ve taleplerinizi iletebilirsiniz.`,
            ctaHref: `${siteUrl}/dashboard`,
            ctaLabel: "Panele Git",
          }),
        });
        if (!emailResult.ok) {
          console.error(`[login] Hoşgeldin emaili gönderilemedi: ${user.emailOrPhone} — ${emailResult.error}`);
        }
      }
    }

    return NextResponse.json({
      message: "Giriş başarılı",
      mustChangePassword,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        siteId: user.siteId,
        apartmentNo: user.apartmentNo,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Sunucu hatası", details: msg }, { status: 500 });
  }
}
