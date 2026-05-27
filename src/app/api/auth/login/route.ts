import { NextResponse } from "next/server";
import { getPlatformDb } from "@/db/platform";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { signJwt } from "@/lib/auth";
import { cookies } from "next/headers";
import { databaseUnavailable } from "@/server/database/access";
import type { PlatformDatabase } from "@/db/platform";

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
