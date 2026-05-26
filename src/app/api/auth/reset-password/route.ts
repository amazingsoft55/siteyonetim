import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { tryGetDb, jsonDbUnavailable } from "@/lib/cloudflare-db";
import { jsonSqlError } from "@/lib/db-query-error";
import { users, passwordResetTokens } from "@/db/schema";

export const runtime = "edge";

const MIN_LEN = 8;

type Body = { token?: unknown; password?: unknown; confirmPassword?: unknown };

export async function POST(request: Request) {
  let raw: Body;
  try {
    raw = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

  const token = typeof raw.token === "string" ? raw.token.trim() : "";
  const pw = typeof raw.password === "string" ? raw.password : "";
  const pw2 = typeof raw.confirmPassword === "string" ? raw.confirmPassword : "";

  if (!token || token.length < 20) {
    return NextResponse.json({ error: "Geçersiz veya süresi dolmuş bağlantı." }, { status: 400 });
  }
  if (!pw || pw.length < MIN_LEN) {
    return NextResponse.json({ error: `Şifre en az ${MIN_LEN} karakter olmalıdır.` }, { status: 400 });
  }
  if (pw !== pw2) {
    return NextResponse.json({ error: "Şifreler eşleşmiyor." }, { status: 400 });
  }

  const d = tryGetDb();
  if (!d.ok) return jsonDbUnavailable(d.error);

  const now = new Date().toISOString();

  try {
    const tkRows = await d.db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))
      .limit(1);

    const trow = tkRows[0];
    if (!trow || trow.expiresAt <= now) {
      return NextResponse.json({ error: "Bağlantı geçersiz veya süresi dolmuş. Yeni istek gönderin." }, { status: 400 });
    }

    const uRows = await d.db
      .select()
      .from(users)
      .where(and(eq(users.id, trow.userId), eq(users.role, "SUPER_ADMIN")))
      .limit(1);

    const u = uRows[0];
    if (!u) {
      return NextResponse.json({ error: "Hesap bulunamadı." }, { status: 400 });
    }

    const hash = await bcrypt.hash(pw, 10);
    await d.db
      .update(users)
      .set({ passwordHash: hash, mustChangePassword: false })
      .where(eq(users.id, u.id));

    await d.db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, u.id));

    return NextResponse.json({ ok: true, message: "Şifreniz güncellendi. Giriş yapabilirsiniz." });
  } catch (e) {
    return jsonSqlError(e, "Şifre sıfırlanamadı.");
  }
}
