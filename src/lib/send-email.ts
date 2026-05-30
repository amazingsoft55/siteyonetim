import { buildBrandedEmailHtml } from "@/lib/email-template";
import { getPublicSiteUrl } from "@/lib/site-url";
import { isGmailConfigured, sendViaGmail } from "@/lib/gmail-send";

type SendResult = { ok: true } | { ok: false; error: string };

function emailFromAddress(): string {
  return (
    process.env.GMAIL_FROM?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    "Site Yönetimi <ccode4779@gmail.com>"
  );
}

function emailReplyTo(): string | undefined {
  const r = process.env.EMAIL_REPLY_TO?.trim();
  return r && r.includes("@") ? r : undefined;
}

async function sendViaResend(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    return { ok: false, error: "RESEND_API_KEY tanımlı değil." };
  }

  const payload: Record<string, unknown> = {
    from: emailFromAddress(),
    to: [input.to],
    subject: input.subject,
    html: input.html,
  };
  const replyTo = emailReplyTo();
  if (replyTo) payload.reply_to = replyTo;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => res.statusText);
    return { ok: false, error: t || `HTTP ${res.status}` };
  }
  return { ok: true };
}

async function sendViaSmtp(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const user = process.env.GMAIL_USER?.trim() || "ccode4779@gmail.com";
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();

  if (!pass) {
    return { ok: false, error: "GMAIL_APP_PASSWORD tanımlı değil." };
  }

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from: emailFromAddress(),
      to: input.to,
      subject: input.subject,
      html: input.html,
    });

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function sendBrandedEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  if (process.env.GMAIL_APP_PASSWORD?.trim()) {
    return sendViaSmtp(input);
  }
  if (isGmailConfigured()) {
    return sendViaGmail(input);
  }
  return sendViaResend(input);
}

/** Şifre sıfırlama bağlantısı — tüm roller (süper yönetici, yönetici, sakin). */
export async function sendPasswordResetEmail(
  to: string,
  resetPathWithToken: string,
  recipientName?: string,
): Promise<SendResult> {
  const base = getPublicSiteUrl().replace(/\/$/, "");
  const path = resetPathWithToken.startsWith("/") ? resetPathWithToken : `/${resetPathWithToken}`;
  const url = `${base}${path}`;
  const greeting = recipientName?.trim() ? `Merhaba ${recipientName.trim()},` : "Merhaba,";

  const html = buildBrandedEmailHtml({
    title: "Şifre sıfırlama",
    intro: `${greeting} hesabınız için şifre sıfırlama isteği alındı. Aşağıdaki düğmeyi kullanın (yaklaşık 1 saat geçerlidir).`,
    ctaHref: url,
    ctaLabel: "Yeni şifre belirle",
  });

  return sendBrandedEmail({ to, subject: "Şifre sıfırlama — Site Yönetimi", html });
}

/** Süper yönetici hesap değişikliği doğrulama kodu */
export async function sendAccountVerificationEmail(to: string, code: string): Promise<SendResult> {
  const html = buildBrandedEmailHtml({
    title: "Doğrulama kodu",
    intro: "Hesabınızda e-posta veya şifre değişikliği için doğrulama kodunuz:",
    bodyHtml: `<p style="margin:0;font-size:28px;font-weight:800;letter-spacing:6px;text-align:center;color:#4f46e5">${code}</p><p style="margin:12px 0 0;font-size:13px;color:#71717a;text-align:center">Kod yaklaşık 15 dakika geçerlidir.</p>`,
  });

  return sendBrandedEmail({ to, subject: "Doğrulama kodu — Site Yönetimi", html });
}

/** Duyuru bildirim e-postası — sakinlere ve yöneticilere gönderilir */
export async function sendAnnouncementEmail(
  to: string,
  recipientName: string,
  announcementTitle: string,
  announcementContent: string,
  category: string,
): Promise<SendResult> {
  const base = getPublicSiteUrl().replace(/\/$/, "");
  const truncated = announcementContent.length > 200 ? announcementContent.slice(0, 200) + "..." : announcementContent;

  const html = buildBrandedEmailHtml({
    title: `Yeni Duyuru: ${announcementTitle}`,
    intro: `Merhaba ${recipientName || "Değerli Sakin"},`,
    bodyHtml: `
      <p style="margin:0 0 8px;font-size:13px;color:#71717a">Kategori: <strong>${category}</strong></p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46">${truncated}</p>
    `,
    ctaHref: `${base}/dashboard/announcements`,
    ctaLabel: "Duyuruyu Görüntüle",
    footerNote: "Bu e-posta site yönetimi tarafından gönderilen bir duyuru bildirimdir.",
  });

  return sendBrandedEmail({ to, subject: `Yeni Duyuru: ${announcementTitle} — Site Yönetimi`, html });
}
