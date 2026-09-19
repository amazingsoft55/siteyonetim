import {
  buildBrandedEmailHtml,
  buildPasswordResetEmailHtml,
  buildVerificationCodeEmailHtml,
  buildAnnouncementEmailHtml,
  buildWelcomeEmailHtml,
  buildPaymentReceiptEmailHtml,
  buildSupportTicketUpdateEmailHtml,
  type BrandedEmailOptions,
  type WelcomeEmailOptions,
  type PaymentReceiptOptions,
  type SupportTicketUpdateOptions,
} from "@/lib/email-template";
import { getPublicSiteUrl } from "@/lib/site-url";

export type SendResult = { ok: true } | { ok: false; error: string };

function emailFromAddress(): string {
  return (
    process.env.EMAIL_FROM?.trim() ||
    "Site Yönetimi <bildirim@siteyonetim.keskindev.com>"
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

/** Ham HTML e-postası gönderimi (Resend altyapısı ile) */
export async function sendBrandedEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  return sendViaResend(input);
}

/* ==========================================================================
   ÖZEL E-POSTA ŞABLONU GÖNDERİM FONKSİYONLARI
   ========================================================================== */

/** 1. Şifre Sıfırlama E-postası */
export async function sendPasswordResetEmail(
  to: string,
  resetPathWithToken: string,
  recipientName?: string,
  request?: Request,
): Promise<SendResult> {
  const base = getPublicSiteUrl(request).replace(/\/$/, "");
  const path = resetPathWithToken.startsWith("/") ? resetPathWithToken : `/${resetPathWithToken}`;
  const url = `${base}${path}`;

  const html = buildPasswordResetEmailHtml({
    recipientName,
    resetUrl: url,
    expiresInMinutes: 60,
  });

  return sendBrandedEmail({ to, subject: "Şifre Sıfırlama Talebi — Site Yönetimi", html });
}

/** 2. Güvenlik Doğrulama Kodu E-postası (2FA / Süper Yönetici Onayı) */
export async function sendAccountVerificationEmail(
  to: string,
  code: string,
  purpose: string = "hesap güvenlik doğrulama"
): Promise<SendResult> {
  const html = buildVerificationCodeEmailHtml({
    code,
    purpose,
    expiresInMinutes: 15,
  });

  return sendBrandedEmail({ to, subject: `Doğrulama Kodunuz: ${code} — Site Yönetimi`, html });
}

/** 3. Yeni Sakin / Yönetici Hoş Geldiniz E-postası */
export async function sendWelcomeEmail(
  to: string,
  opts: WelcomeEmailOptions
): Promise<SendResult> {
  const html = buildWelcomeEmailHtml(opts);
  return sendBrandedEmail({ to, subject: `Site Yönetimi'ne Hoş Geldiniz — ${opts.siteName}`, html });
}

/** 4. Yeni Duyuru Bildirimi E-postası */
export async function sendAnnouncementEmail(
  to: string,
  recipientName: string,
  announcementTitle: string,
  announcementContent: string,
  category: string,
): Promise<SendResult> {
  const base = getPublicSiteUrl().replace(/\/$/, "");
  const truncated = announcementContent.length > 300 ? announcementContent.slice(0, 300) + "..." : announcementContent;

  const html = buildAnnouncementEmailHtml({
    recipientName,
    title: announcementTitle,
    content: truncated,
    category,
    viewUrl: `${base}/dashboard/announcements`,
  });

  return sendBrandedEmail({ to, subject: `Duyuru: ${announcementTitle} — Site Yönetimi`, html });
}

/** 5. Aidat & Ödeme Makbuzu E-postası */
export async function sendPaymentReceiptEmail(
  to: string,
  opts: PaymentReceiptOptions
): Promise<SendResult> {
  const html = buildPaymentReceiptEmailHtml(opts);
  return sendBrandedEmail({ to, subject: `Ödeme Makbuzu: #${opts.receiptNo} (${opts.period}) — Site Yönetimi`, html });
}

/** 6. Talep & Arıza Durum Güncellemesi E-postası */
export async function sendSupportTicketUpdateEmail(
  to: string,
  opts: SupportTicketUpdateOptions
): Promise<SendResult> {
  const html = buildSupportTicketUpdateEmailHtml(opts);
  return sendBrandedEmail({ to, subject: `Talep Güncellendi: #${opts.ticketId} — Site Yönetimi`, html });
}
