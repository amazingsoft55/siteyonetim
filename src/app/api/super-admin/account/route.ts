import { NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import {
  codeExpiresAt,
  generateSixDigitCode,
  isCodeExpired,
  looksLikeEmail,
  normalizeLogin,
} from "@/lib/account-verification";
import { sendAccountVerificationEmail } from "@/lib/send-email";
import { emailVerificationCodes, users } from "@/db/schema";

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  try {
    const row = await d.db.select().from(users).where(eq(users.id, session.id)).limit(1);
    if (!row[0]) {
      return NextResponse.json({ error: "Hesap bulunamadı." }, { status: 404 });
    }
    const u = row[0];
    const count = u.accountChangesCount ?? 0;
    return NextResponse.json({
      id: u.id,
      name: u.name,
      emailOrPhone: u.emailOrPhone,
      accountChangesCount: count,
      requiresVerificationForCredentials: count >= 1,
      canReceiveEmailCode: looksLikeEmail(u.emailOrPhone),
      freeChangeRemaining: count === 0,
    });
  } catch (e) {
    return jsonSqlError(e, "Hesap bilgisi alınamadı.");
  }
}

type PatchBody = {
  name?: unknown;
  emailOrPhone?: unknown;
  newPassword?: unknown;
  confirmPassword?: unknown;
  verificationCode?: unknown;
};

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  let raw: PatchBody;
  try {
    raw = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  try {
    const existing = await d.db.select().from(users).where(eq(users.id, session.id)).limit(1);
    if (!existing[0]) {
      return NextResponse.json({ error: "Hesap bulunamadı." }, { status: 404 });
    }
    const curr = existing[0];
    const changeCount = curr.accountChangesCount ?? 0;

    let nextName = curr.name;
    if (typeof raw.name === "string" && raw.name.trim().length > 0) {
      nextName = raw.name.trim();
    }

    const nextLogin =
      typeof raw.emailOrPhone === "string" ?
        normalizeLogin(raw.emailOrPhone)
      : curr.emailOrPhone;

    const emailChanging = nextLogin !== curr.emailOrPhone;
    const newPass =
      typeof raw.newPassword === "string" && raw.newPassword.length > 0 ? raw.newPassword : "";
    const confirmPass = typeof raw.confirmPassword === "string" ? raw.confirmPassword : "";
    const passwordChanging = newPass.length > 0;
    const credentialChange = emailChanging || passwordChanging;

    if (passwordChanging) {
      if (newPass.length < 6) {
        return NextResponse.json({ error: "Şifre en az 6 karakter olmalı." }, { status: 400 });
      }
      if (newPass !== confirmPass) {
        return NextResponse.json({ error: "Yeni şifreler eşleşmiyor." }, { status: 400 });
      }
    }

    if (emailChanging && nextLogin.length === 0) {
      return NextResponse.json({ error: "E-posta veya telefon boş olamaz." }, { status: 400 });
    }

    if (emailChanging) {
      const other = await d.db
        .select()
        .from(users)
        .where(eq(users.emailOrPhone, nextLogin))
        .limit(1);
      if (other[0] && other[0].id !== session.id) {
        return NextResponse.json(
          { error: "Bu e‑posta/telefon başka bir hesapta kullanılıyor." },
          { status: 409 },
        );
      }
    }

    if (credentialChange && changeCount >= 1) {
      const codeRaw = typeof raw.verificationCode === "string" ? raw.verificationCode.trim() : "";
      if (!codeRaw) {
        return NextResponse.json(
          {
            error:
              "E-posta veya şifre değişikliği için mevcut e-posta adresinize gönderilen doğrulama kodu gereklidir.",
            code: "VERIFICATION_REQUIRED",
          },
          { status: 403 },
        );
      }
      if (!looksLikeEmail(curr.emailOrPhone)) {
        return NextResponse.json(
          {
            error:
              "Doğrulama kodu yalnızca e-posta ile giriş yapan hesaplarda kullanılabilir. Önce geçerli bir e-posta tanımlayın.",
          },
          { status: 400 },
        );
      }

      const codes = await d.db
        .select()
        .from(emailVerificationCodes)
        .where(
          and(
            eq(emailVerificationCodes.userId, session.id),
            eq(emailVerificationCodes.purpose, "account_change"),
          ),
        )
        .orderBy(desc(emailVerificationCodes.createdAt))
        .limit(5);

      let verified = false;
      let usedCodeId: string | null = null;
      for (const c of codes) {
        if (isCodeExpired(c.expiresAt)) continue;
        if (await bcrypt.compare(codeRaw, c.codeHash)) {
          verified = true;
          usedCodeId = c.id;
          break;
        }
      }
      if (!verified) {
        return NextResponse.json({ error: "Doğrulama kodu geçersiz veya süresi dolmuş." }, { status: 403 });
      }
      if (usedCodeId) {
        await d.db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.id, usedCodeId));
      }
    }

    let nextHash = curr.passwordHash;
    if (passwordChanging) {
      nextHash = await bcrypt.hash(newPass, 10);
    }

    let nextChangeCount = changeCount;
    if (credentialChange && changeCount === 0) {
      nextChangeCount = 1;
    }

    await d.db
      .update(users)
      .set({
        name: nextName,
        emailOrPhone: nextLogin,
        passwordHash: nextHash,
        mustChangePassword: false,
        accountChangesCount: nextChangeCount,
      })
      .where(eq(users.id, session.id));

    return NextResponse.json({
      success: true,
      notice: credentialChange ?
        "Bilgileriniz güncellendi. E-posta veya şifre değiştiyse tekrar giriş yapın."
      : "Bilgileriniz güncellendi.",
      accountChangesCount: nextChangeCount,
      requiresVerificationForCredentials: nextChangeCount >= 1,
    });
  } catch (e) {
    return jsonSqlError(e, "Hesap güncellenemedi.");
  }
}
