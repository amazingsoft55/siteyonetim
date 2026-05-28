import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { emailNotConfiguredMessage, isEmailConfigured } from "@/lib/email-config";
import { buildBrandedEmailHtml } from "@/lib/email-template";
import { sendBrandedEmail } from "@/lib/send-email";
import { looksLikeEmail } from "@/lib/password-reset";
import { users } from "@/db/schema";

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

/** Süper yönetici: e-posta ayarlarını test eder. */
export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") return forbidden();

  if (!isEmailConfigured()) {
    return NextResponse.json({ error: emailNotConfiguredMessage() }, { status: 503 });
  }

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  const row = await d.db.select().from(users).where(eq(users.id, session.id)).limit(1);
  if (!row[0]) return NextResponse.json({ error: "Hesap bulunamadı." }, { status: 404 });

  const to = row[0].emailOrPhone.trim();
  if (!looksLikeEmail(to)) {
    return NextResponse.json(
      { error: "Hesabınızda geçerli bir e-posta yok; test maili gönderilemez." },
      { status: 400 },
    );
  }

  const html = buildBrandedEmailHtml({
    title: "E-posta testi",
    intro: "Bu mesaj Site Yönetimi e-posta ayarlarının çalıştığını doğrular.",
    bodyHtml: `<p style="margin:0;font-size:14px;color:#52525b">Gönderim zamanı: ${new Date().toISOString()}</p>`,
  });

  const sent = await sendBrandedEmail({
    to,
    subject: "E-posta testi — Site Yönetimi",
    html,
  });

  if (!sent.ok) {
    return NextResponse.json(
      { error: "Test e-postası gönderilemedi.", detail: sent.error },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true, sentTo: to });
}
