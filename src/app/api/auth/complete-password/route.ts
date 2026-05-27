import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { verifyJwt, signJwt } from "@/lib/auth";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import { users } from "@/db/schema";


const MIN_LEN = 8;

type Body = { newPassword?: unknown; confirmPassword?: unknown };

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get("token")?.value;
  if (!rawToken) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  const payload = await verifyJwt(rawToken);
  if (!payload || typeof payload.id !== "string" || payload.mcp !== true) {
    return NextResponse.json(
      { error: "Bu işlem için önce geçici şifre ile giriş yapılmış olmalıdır." },
      { status: 403 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Geçersiz gövde." }, { status: 400 });
  }

  const pw = typeof body.newPassword === "string" ? body.newPassword : "";
  const pw2 = typeof body.confirmPassword === "string" ? body.confirmPassword : "";
  if (!pw || pw.length < MIN_LEN) {
    return NextResponse.json({ error: `Şifre en az ${MIN_LEN} karakter olmalıdır.` }, { status: 400 });
  }
  if (pw !== pw2) {
    return NextResponse.json({ error: "Şifreler eşleşmiyor." }, { status: 400 });
  }

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  try {
    const row = await d.db.select().from(users).where(eq(users.id, payload.id)).limit(1);
    const u = row[0];
    if (!u) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    const hash = await bcrypt.hash(pw, 10);
    await d.db
      .update(users)
      .set({ passwordHash: hash, mustChangePassword: false })
      .where(eq(users.id, u.id));

    const token = await signJwt({
      id: u.id,
      role: u.role,
      name: u.name,
      siteId: u.siteId,
      apartmentNo: u.apartmentNo,
      mcp: false,
    });

    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({ ok: true, role: u.role });
  } catch (e) {
    return jsonSqlError(e, "Şifre güncellenemedi.");
  }
}
