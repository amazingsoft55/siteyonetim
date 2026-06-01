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
  const greeting = recipientName?.trim() ? `Merhaba <strong>${recipientName.trim()}</strong>,` : "Merhaba,";

  const html = buildBrandedEmailHtml({
    title: "Şifre Sıfırlama",
    intro: `${greeting} hesabınız için şifre sıfırlama isteği alındı. Aşağıdaki düğmeye tıklayarak yeni şifrenizi belirleyebilirsiniz.`,
    bodyHtml: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin:0 0 20px">
        <tr><td style="padding:16px 18px">
          <p style="margin:0;font-size:13px;color:#991b1b"><strong>Güvenlik Uyarısı:</strong> Bu bağlantı yaklaşık <strong>1 saat</strong> geçerlidir. Eğer bu isteği siz yapmadıysanız, lütfen bu e-postayı görmezden gelin.</p>
        </td></tr>
      </table>
    `,
    ctaHref: url,
    ctaLabel: "Yeni Şifre Belirle",
    footerNote: "Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz. Hesabınız güvendedir.",
    accentColor: "#dc2626",
  });

  return sendBrandedEmail({ to, subject: "Şifre Sıfırlama — Site Yönetimi", html });
}

/** Süper yönetici hesap değişikliği doğrulama kodu */
export async function sendAccountVerificationEmail(to: string, code: string): Promise<SendResult> {
  const html = buildBrandedEmailHtml({
    title: "Doğrulama Kodu",
    intro: "Hesabınızda e-posta veya şifre değişikliği için doğrulama kodunuz aşağıdadır:",
    bodyHtml: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0fdf4;border:2px dashed #22c55e;border-radius:12px;margin:0 0 16px">
        <tr><td style="padding:24px;text-align:center">
          <p style="margin:0 0 8px;font-size:11px;color:#16a34a;font-weight:700;text-transform:uppercase;letter-spacing:1px">Doğrulama Kodu</p>
          <p style="margin:0;font-size:30px;font-weight:700;letter-spacing:6px;color:#15803d;font-family:'Courier New',monospace">${code}</p>
        </td></tr>
      </table>
      <p style="margin:0;font-size:12px;color:#777;text-align:center">Kod yaklaşık <strong>15 dakika</strong> geçerlidir.</p>
    `,
    footerNote: "Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.",
    accentColor: "#22c55e",
  });

  return sendBrandedEmail({ to, subject: "Doğrulama Kodu — Site Yönetimi", html });
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
  const truncated = announcementContent.length > 300 ? announcementContent.slice(0, 300) + "..." : announcementContent;

  const html = buildBrandedEmailHtml({
    title: `Yeni Duyuru`,
    intro: `Merhaba <strong>${recipientName || "Değerli Sakin"}</strong>, yeni bir duyuru yayınlandı.`,
    bodyHtml: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fafafa;border:1px solid #eee;border-radius:12px;margin:0 0 20px">
        <tr><td style="padding:20px">
          <p style="margin:0 0 10px;display:inline-block;background:#ede9fe;color:#7c3aed;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px">${category}</p>
          <h2 style="margin:12px 0 8px;font-size:16px;font-weight:700;color:#1a1a2e;line-height:1.4">${announcementTitle}</h2>
          <p style="margin:0;font-size:14px;line-height:1.7;color:#555">${truncated}</p>
        </td></tr>
      </table>
      <p style="margin:0 0 16px;font-size:12px;color:#999;text-align:center">Duyurunun tüm içeriğini ve görsellerini görüntülemek için panele giriş yapın.</p>
    `,
    ctaHref: `${base}/dashboard/announcements`,
    ctaLabel: "Duyuruları Görüntüle",
    footerNote: "Bu e-posta site yönetimi tarafından gönderilen bir duyuru bildirimdir.",
    accentColor: "#7c3aed",
  });

  return sendBrandedEmail({ to, subject: `Yeni Duyuru: ${announcementTitle} — Site Yönetimi`, html });
}
