import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import {
  codeExpiresAt,
  generateSixDigitCode,
  looksLikeEmail,
} from "@/lib/account-verification";
import { emailNotConfiguredMessage, isEmailConfigured } from "@/lib/email-config";
import { sendAccountVerificationEmail } from "@/lib/send-email";
import { emailVerificationCodes, users } from "@/db/schema";

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  try {
    const row = await d.db.select().from(users).where(eq(users.id, session.id)).limit(1);
    if (!row[0]) {
      return NextResponse.json({ error: "Hesap bulunamadı." }, { status: 404 });
    }

    if (!isEmailConfigured()) {
      return NextResponse.json({ error: emailNotConfiguredMessage() }, { status: 503 });
    }

    const u = row[0];
    const changeCount = u.accountChangesCount ?? 0;

    if (changeCount < 1) {
      return NextResponse.json(
        {
          error:
            "İlk e-posta veya şifre değişikliğiniz doğrulama kodu gerektirmez. Doğrudan kaydedebilirsiniz.",
        },
        { status: 400 },
      );
    }

    if (!looksLikeEmail(u.emailOrPhone)) {
      return NextResponse.json(
        {
          error:
            "Doğrulama kodu göndermek için hesabınızda kayıtlı geçerli bir e-posta adresi olmalıdır.",
        },
        { status: 400 },
      );
    }

    const code = generateSixDigitCode();
    const codeHash = await bcrypt.hash(code, 10);
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID ?
        crypto.randomUUID()
      : `evc-${Date.now()}`;

    await d.db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.userId, session.id));

    await d.db.insert(emailVerificationCodes).values({
      id,
      userId: session.id,
      codeHash,
      purpose: "account_change",
      expiresAt: codeExpiresAt(15),
    });

    const sent = await sendAccountVerificationEmail(u.emailOrPhone, code);
    if (!sent.ok) {
      return NextResponse.json(
        {
          error:
            "Doğrulama kodu e-postası gönderilemedi. RESEND_API_KEY ve EMAIL_FROM ayarlarını kontrol edin.",
          detail: sent.error,
        },
        { status: 502 },
      );
    }

    const masked = u.emailOrPhone.replace(/^(.{2}).*(@.*)$/, "$1***$2");
    return NextResponse.json({
      success: true,
      sentTo: masked,
      expiresInMinutes: 15,
    });
  } catch (e) {
    return jsonSqlError(e, "Doğrulama kodu gönderilemedi.");
  }
}
