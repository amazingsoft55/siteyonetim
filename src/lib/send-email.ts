import {
  buildBaseEmailWrapper,
  buildBrandedEmailHtml,
  buildPasswordResetEmailHtml,
  buildVerificationCodeEmailHtml,
  buildAnnouncementEmailHtml,
  buildWelcomeEmailHtml,
  buildPaymentReceiptEmailHtml,
  buildSupportTicketUpdateEmailHtml,
  buildAccountApprovedEmailHtml,
  buildAccountPendingAdminNotificationEmailHtml,
  type BrandedEmailOptions,
  type WelcomeEmailOptions,
  type PaymentReceiptOptions,
  type SupportTicketUpdateOptions,
  type AccountApprovedEmailOptions,
  type AccountPendingAdminNotificationOptions,
} from "@/lib/email-template";
import { getPublicSiteUrl } from "@/lib/site-url";

export type SendResult = { ok: true } | { ok: false; error: string };

export function emailFromAddress(type: "default" | "support" = "default"): string {
  if (type === "support") {
    return (
      process.env.EMAIL_FROM_SUPPORT?.trim() ||
      "Site Yönetimi <destek@siteyonetim.keskindev.com>"
    );
  }
  return (
    process.env.EMAIL_FROM?.trim() ||
    "Site Yönetimi <bildirim@siteyonetim.keskindev.com>"
  );
}

export function emailReplyTo(): string {
  const r = process.env.EMAIL_REPLY_TO?.trim();
  if (r && r.includes("@")) return r;
  return "destek@siteyonetim.keskindev.com";
}

async function getApiKey(type?: "default" | "support"): Promise<string | undefined> {
  let key: string | undefined;
  if (type === "support") {
    key =
      process.env.RESEND_SUPPORT_API_KEY?.trim() ||
      process.env.RESEND_API_KEY_SUPPORT?.trim() ||
      process.env.RESEND_API_KEY?.trim();
  } else {
    key =
      process.env.RESEND_API_KEY?.trim() ||
      process.env.RESEND_SUPPORT_API_KEY?.trim() ||
      process.env.RESEND_API_KEY_SUPPORT?.trim();
  }

  if (!key) {
    try {
      const mod = await import("@opennextjs/cloudflare");
      const ctx = await mod.getCloudflareContext({ async: true });
      const env = ctx.env as Record<string, string> | undefined;
      if (env) {
        if (type === "support") {
          key = env.RESEND_SUPPORT_API_KEY || env.RESEND_API_KEY_SUPPORT || env.RESEND_API_KEY;
        } else {
          key = env.RESEND_API_KEY || env.RESEND_SUPPORT_API_KEY || env.RESEND_API_KEY_SUPPORT;
        }
      }
    } catch {}
  }

  return key;
}

async function sendViaResend(input: {
  to: string;
  subject: string;
  html: string;
  fromType?: "default" | "support";
  from?: string;
}): Promise<SendResult> {
  const primaryKey = await getApiKey(input.fromType);
  const secondaryKey = await getApiKey(input.fromType === "support" ? "default" : "support");
  const keysToTry = [primaryKey, secondaryKey].filter((k): k is string => !!k && k.startsWith("re_"));

  if (keysToTry.length === 0) {
    console.error("E-posta gönderilemedi: Geçerli bir RESEND_API_KEY veya RESEND_SUPPORT_API_KEY tanımlı değil.");
    return { ok: false, error: "RESEND_API_KEY tanımlı değil. Lütfen .env.local veya Cloudflare ortam değişkenlerinizi kontrol edin." };
  }

  const from = input.from || emailFromAddress(input.fromType || "default");
  const payload: Record<string, unknown> = {
    from,
    to: [input.to.trim().toLowerCase()],
    subject: input.subject,
    html: input.html,
    reply_to: emailReplyTo(),
  };

  let lastError = "";

  // Anahtarları sırayla dene (401 invalid key durumunda ikincil anahtara geç)
  for (const key of keysToTry) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return { ok: true };
      }

      const text = await res.text().catch(() => res.statusText);
      try {
        const parsed = JSON.parse(text) as { message?: string; error?: string; name?: string };
        lastError = parsed.message || parsed.error || text;
      } catch {
        lastError = text || `HTTP ${res.status}`;
      }

      // Eğer 401 değilse (örn. domain doğrulanmamış 403 vb.) diğer anahtarı denemeye gerek yok
      if (res.status !== 401) {
        break;
      }
    } catch (netErr) {
      lastError = netErr instanceof Error ? netErr.message : "Bağlantı hatası";
    }
  }

  console.error(`[send-email] Resend API hatası (${from} -> ${input.to}): ${lastError}`);
  return { ok: false, error: lastError };
}

/** Ham HTML e-postası gönderimi (Resend altyapısı ile) */
export async function sendBrandedEmail(input: {
  to: string;
  subject: string;
  html: string;
  fromType?: "default" | "support";
  from?: string;
}): Promise<SendResult> {
  return sendViaResend(input);
}

/* ==========================================================================
   ÖZEL E-POSTA ŞABLONU GÖNDERİM FONKSİYONLARI
   ========================================================================== */

/** 1. Şifre Sıfırlama E-postası (Destek kanalı üzerinden gönderilir) */
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

  return sendBrandedEmail({
    to,
    subject: "Şifre Sıfırlama Talebi — Site Yönetimi",
    html,
    fromType: "support",
  });
}

/** 2. Güvenlik Doğrulama Kodu E-postası (2FA / Süper Yönetici Onayı — Destek kanalı) */
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

  return sendBrandedEmail({
    to,
    subject: `Doğrulama Kodunuz: ${code} — Site Yönetimi`,
    html,
    fromType: "support",
  });
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
  return sendBrandedEmail({
    to,
    subject: `Talep Güncellendi: #${opts.ticketId} — Site Yönetimi`,
    html,
    fromType: "support",
  });
}

/** 7. Hesap Onaylandı E-postası (Yönetici onaylayınca kullanıcıya iletilir) */
export async function sendAccountApprovedEmail(
  to: string,
  opts: AccountApprovedEmailOptions
): Promise<SendResult> {
  const html = buildAccountApprovedEmailHtml(opts);
  return sendBrandedEmail({ to, subject: `🎉 Hesabınız Onaylandı — ${opts.siteName}`, html });
}

/** 8. Yöneticiye Yeni Sakin Kayıt Bildirimi E-postası */
export async function sendAccountPendingAdminNotificationEmail(
  to: string,
  opts: AccountPendingAdminNotificationOptions
): Promise<SendResult> {
  const html = buildAccountPendingAdminNotificationEmailHtml(opts);
  return sendBrandedEmail({ to, subject: `🔔 Yeni Sakin Kayıt Başvurusu: ${opts.userName} — ${opts.siteName}`, html });
}

/** 9. Yeni İletişim / Destek Talebini destek@siteyonetim.keskindev.com'a İlet */
export async function sendContactFormNotificationToSupport(input: {
  source: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  ticketId?: string;
}): Promise<SendResult> {
  const supportEmail = process.env.EMAIL_SUPPORT?.trim() || "destek@siteyonetim.keskindev.com";
  const sourceLabel = input.source === "destek" ? "Destek Bileti" : "İletişim Formu";

  const contentHtml = `
    <div style="padding: 24px 0;">
      <h3 style="margin: 0 0 16px; font-size: 20px; font-weight: 800; color: #0f172a;">
        Yeni ${sourceLabel} Alındı
      </h3>
      <p style="margin: 0 0 20px; font-size: 14px; color: #475569; line-height: 1.6;">
        Web sitenizdeki <strong>${sourceLabel}</strong> üzerinden yeni bir mesaj gönderildi:
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 13px; color: #334155;">
          <tr>
            <td width="120" style="font-weight: bold; color: #64748b;">Gönderen:</td>
            <td style="font-weight: 600; color: #0f172a;">${input.name}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; color: #64748b;">E-Posta:</td>
            <td><a href="mailto:${input.email}" style="color: #4f46e5; text-decoration: none; font-weight: 600;">${input.email}</a></td>
          </tr>
          ${input.phone ? `
          <tr>
            <td style="font-weight: bold; color: #64748b;">Telefon:</td>
            <td style="font-weight: 600; color: #0f172a;">${input.phone}</td>
          </tr>` : ""}
          <tr>
            <td style="font-weight: bold; color: #64748b;">Konu:</td>
            <td style="font-weight: 600; color: #0f172a;">${input.subject}</td>
          </tr>
          ${input.ticketId ? `
          <tr>
            <td style="font-weight: bold; color: #64748b;">Kayıt No:</td>
            <td style="font-family: monospace; color: #64748b;">${input.ticketId}</td>
          </tr>` : ""}
        </table>
      </div>

      <div style="background-color: #ffffff; border-left: 4px solid #4f46e5; border-radius: 4px; padding: 16px 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <p style="margin: 0 0 8px; font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">Mesaj İçeriği:</p>
        <p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${input.message}</p>
      </div>

      <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
        💡 Bu e-postaya doğrudan "Yanıtla (Reply)" diyerek <strong>${input.email}</strong> adresine geri dönüş yapabilirsiniz.
      </p>
    </div>
  `;

  const html = buildBaseEmailWrapper({
    title: `[${sourceLabel}] ${input.subject}`,
    badge: sourceLabel.toUpperCase(),
    badgeColor: "#4f46e5",
    contentHtml,
  });

  const resendKey = getApiKey("support");
  if (!resendKey) return { ok: false, error: "RESEND_SUPPORT_API_KEY veya RESEND_API_KEY tanımlı değil." };

  const payload: Record<string, unknown> = {
    from: emailFromAddress("support"),
    to: [supportEmail],
    reply_to: input.email,
    subject: `[${sourceLabel}] ${input.subject} — ${input.name}`,
    html,
  };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
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

/** 10. Kullanıcıya "Mesajınız / Destek Talebiniz Alındı" Otomatik Yanıtı */
export async function sendContactFormAutoReplyToUser(input: {
  name: string;
  email: string;
  subject: string;
  source: string;
}): Promise<SendResult> {
  const sourceLabel = input.source === "destek" ? "Destek Talebiniz" : "İletişim Mesajınız";

  const contentHtml = `
    <div style="padding: 24px 0; text-align: center;">
      <div style="display: inline-block; width: 48px; height: 48px; background-color: #ecfdf5; border-radius: 50%; line-height: 48px; font-size: 24px; color: #059669; margin-bottom: 16px;">
        ✓
      </div>
      <h3 style="margin: 0 0 12px; font-size: 20px; font-weight: 800; color: #0f172a;">
        ${sourceLabel} Alındı!
      </h3>
      <p style="margin: 0 0 20px; font-size: 14px; color: #475569; line-height: 1.6; text-align: left;">
        Sayın <strong>${input.name}</strong>,<br /><br />
        <strong>"${input.subject}"</strong> konulu mesajınız teknik ve destek ekibimize başarıyla ulaştı. Talebiniz incelenerek en kısa sürede bu e-posta adresiniz üzerinden geri dönüş sağlanacaktır.
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 20px; text-align: left;">
        <p style="margin: 0; font-size: 12px; color: #64748b;">
          Acil durumlarda çağrı merkezimizden <strong>0 (850) 123 45 67</strong> veya doğrudan <a href="mailto:destek@siteyonetim.keskindev.com" style="color: #4f46e5; font-weight: bold;">destek@siteyonetim.keskindev.com</a> adresimizden bize ulaşabilirsiniz.
        </p>
      </div>
    </div>
  `;

  const html = buildBaseEmailWrapper({
    title: `${sourceLabel} Alındı`,
    badge: "DESTEK BİLGİLENDİRME",
    badgeColor: "#059669",
    contentHtml,
  });

  return sendBrandedEmail({
    to: input.email,
    subject: `Mesajınız Alındı: ${input.subject} — Site Yönetimi`,
    html,
    fromType: "support",
  });
}

