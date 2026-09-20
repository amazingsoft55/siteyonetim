import { SITE_BRAND_NAME } from "@/lib/brand";
import { getPublicSiteUrl } from "@/lib/site-url";

/* ==========================================================================
   GÜVENLİK YARDIMCILARI (XSS VE HTML ENJEKSİYON KORUMASI)
   ========================================================================== */

/**
 * Kullanıcı girdilerini (Ad, Soyad, Site Adı, Duyuru, vb.) HTML içine güvenle yerleştirmek için escape eder.
 */
export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return "";
  const s = String(str);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Güvenli bağlantı URL kontrolü (yalnızca http veya https kabul eder).
 */
export function sanitizeUrl(url: unknown, fallback = "#"): string {
  if (typeof url !== "string" || !url.trim()) return fallback;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) {
    return escapeHtml(trimmed);
  }
  return fallback;
}

/* ==========================================================================
   E-POSTA TİPLERİ VE ARAYÜZLERİ
   ========================================================================== */

export type BaseEmailOptions = {
  title: string;
  badge?: string;
  badgeColor?: string;
  badgeBg?: string;
  accentColor?: string;
  footerNote?: string;
};

export type BrandedEmailOptions = BaseEmailOptions & {
  intro: string;
  bodyHtml?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export type WelcomeEmailOptions = {
  name: string;
  siteName: string;
  emailOrPhone: string;
  apartmentNo?: string | null;
  role: "ADMIN" | "USER" | "SUPER_ADMIN";
  loginUrl?: string;
};

export type AccountApprovedEmailOptions = {
  name: string;
  siteName: string;
  emailOrPhone: string;
  apartmentNo?: string | null;
  role?: string;
  loginUrl?: string;
  managerName?: string;
  managerPhone?: string;
};

export type AccountPendingAdminNotificationOptions = {
  userName: string;
  userEmailOrPhone: string;
  siteName: string;
  apartmentNo?: string | null;
  adminReviewUrl?: string;
};

export type PasswordResetEmailOptions = {
  recipientName?: string;
  resetUrl: string;
  expiresInMinutes?: number;
};

export type VerificationCodeEmailOptions = {
  code: string;
  recipientName?: string;
  purpose?: string;
  expiresInMinutes?: number;
};

export type AnnouncementEmailOptions = {
  recipientName?: string;
  title: string;
  content: string;
  category: string;
  date?: string;
  viewUrl?: string;
};

export type PaymentReceiptOptions = {
  recipientName: string;
  siteName: string;
  apartmentNo: string;
  amount: string | number;
  period: string;
  paymentMethod?: string;
  receiptNo: string;
  date: string;
  receiptUrl?: string;
};

export type DueReminderOptions = {
  recipientName: string;
  siteName: string;
  apartmentNo: string;
  totalAmount: string | number;
  period: string;
  dueDate: string;
  payUrl?: string;
};

export type SupportTicketUpdateOptions = {
  recipientName: string;
  ticketId: string;
  ticketTitle: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  statusLabel: string;
  adminResponse?: string;
  viewUrl?: string;
};

export type AccountDeletedEmailOptions = {
  recipientName: string;
  emailOrPhone: string;
  siteName?: string;
  apartmentNo?: string | null;
  role?: string;
};

/* ==========================================================================
   1. GENEL / ANA TEMEL ÇERÇEVE ŞABLONU (BASE WRAPPER - ULTRA MODERN)
   ========================================================================== */

export function buildBaseEmailWrapper(opts: {
  title: string;
  badge?: string;
  badgeColor?: string;
  badgeBg?: string;
  accentColor?: string;
  footerNote?: string;
  contentHtml: string;
}): string {
  const base = getPublicSiteUrl().replace(/\/$/, "");
  const accent = opts.accentColor || "#4f46e5";
  const logoUrl = `${base}/logo.png`;
  const badgeText = opts.badge || "SİSTEM BİLDİRİMİ";
  const badgeColor = opts.badgeColor || accent;
  const badgeBg = opts.badgeBg || `${accent}14`;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="tr">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <title>${escapeHtml(opts.title)} — ${escapeHtml(SITE_BRAND_NAME)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; table-layout: fixed; width: 100%;">
    <tr>
      <td align="center" style="padding: 40px 16px 56px;">

        <!-- Ana Kart Kapsayıcı (Max 580px, Modern Glassmorphism & Shadow) -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(226, 232, 240, 0.8); border: 1px solid #e2e8f0;">

          <!-- Üst Canlı Degrade Şerit (Indigo -> Purple -> Pink) -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Başlık & Logo Alanı (Modern Brand Header) -->
          <tr>
            <td style="padding: 32px 36px 24px; text-align: center; background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%); border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border: 1px solid #e2e8f0; border-radius: 20px; padding: 10px; box-shadow: 0 8px 16px -4px rgba(79, 70, 229, 0.12);">
                    <img src="${logoUrl}" alt="${escapeHtml(SITE_BRAND_NAME)}" width="48" height="48" style="display: block; border-radius: 12px; border: 0;" />
                  </td>
                </tr>
              </table>
              <h2 style="margin: 14px 0 0; font-size: 19px; font-weight: 900; color: #0f172a; letter-spacing: -0.4px;">
                ${escapeHtml(SITE_BRAND_NAME)}
              </h2>
              <p style="margin: 3px 0 0; font-size: 12px; color: #64748b; font-weight: 600; letter-spacing: 0.2px;">
                Yeni Nesil Akıllı Site & Yaşam Portalı
              </p>
            </td>
          </tr>

          <!-- İçerik Alanı -->
          <tr>
            <td style="padding: 36px 36px 32px;">

              <!-- Rozet / Badge -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 18px;">
                <tr>
                  <td style="background-color: ${badgeBg}; border-radius: 24px; padding: 6px 15px; border: 1px solid ${badgeColor}30;">
                    <span style="font-size: 11px; font-weight: 800; color: ${badgeColor}; text-transform: uppercase; letter-spacing: 0.8px;">
                      ${escapeHtml(badgeText)}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Gövde -->
              ${opts.contentHtml}

            </td>
          </tr>

          <!-- Alt Bilgi (Footer) -->
          <tr>
            <td style="padding: 28px 36px 32px; background-color: #fafbfc; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0 0 12px; font-size: 12px; line-height: 1.6; color: #64748b;">
                ${escapeHtml(opts.footerNote ?? "Bu e-posta otomatik olarak gönderilmiştir. Lütfen doğrudan yanıtlamayınız.")}
              </p>

              <!-- Hızlı Bağlantılar -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 14px auto 14px;">
                <tr>
                  <td style="font-size: 12px; font-weight: 600; color: #64748b;">
                    <a href="${base}/dashboard" target="_blank" style="color: #4f46e5; text-decoration: none; margin: 0 8px;">Sakin Portalı</a> &bull;
                    <a href="${base}/destek" target="_blank" style="color: #64748b; text-decoration: none; margin: 0 8px;">Yardım & Destek</a> &bull;
                    <a href="${base}/gizlilik-politikasi" target="_blank" style="color: #64748b; text-decoration: none; margin: 0 8px;">Gizlilik</a>
                  </td>
                </tr>
              </table>

              <!-- Güvenlik Mührü -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 16px auto 8px; background-color: #f1f5f9; border-radius: 12px; padding: 8px 16px;">
                <tr>
                  <td style="font-size: 11px; font-weight: 600; color: #475569;">
                    🔒 256-Bit SSL Uçtan Uca Güvenli &bull; KVKK Uyumlu Doğrulanmış Bildirim
                  </td>
                </tr>
              </table>

              <p style="margin: 8px 0 0; font-size: 11px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} ${escapeHtml(SITE_BRAND_NAME)}. Tüm hakları saklıdır.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ==========================================================================
   2. GENEL ŞABLON (BRANDED EMAIL)
   ========================================================================== */

export function buildBrandedEmailHtml(opts: BrandedEmailOptions): string {
  const accent = opts.accentColor || "#4f46e5";

  const ctaButton =
    opts.ctaHref && opts.ctaLabel
      ? `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 32px auto 0;">
          <tr>
            <td align="center" style="border-radius: 16px; background: linear-gradient(135deg, ${accent} 0%, #7c3aed 100%); box-shadow: 0 8px 20px -4px rgba(79, 70, 229, 0.45);">
              <a href="${sanitizeUrl(opts.ctaHref)}" target="_blank" style="font-size: 15px; color: #ffffff; text-decoration: none; font-weight: 800; padding: 16px 38px; border-radius: 16px; display: inline-block; letter-spacing: 0.2px;">
                ${escapeHtml(opts.ctaLabel)} &rarr;
              </a>
            </td>
          </tr>
        </table>
      `
      : "";

  const contentHtml = `
    <h1 style="margin: 0 0 14px; font-size: 23px; font-weight: 900; color: #0f172a; line-height: 1.35; letter-spacing: -0.5px;">
      ${escapeHtml(opts.title)}
    </h1>
    <p style="margin: 0 0 22px; font-size: 15px; line-height: 1.7; color: #334155;">
      ${escapeHtml(opts.intro)}
    </p>
    ${opts.bodyHtml ?? ""}
    ${ctaButton}
  `;

  return buildBaseEmailWrapper({
    title: opts.title,
    badge: opts.badge,
    badgeColor: opts.badgeColor,
    badgeBg: opts.badgeBg,
    accentColor: opts.accentColor,
    footerNote: opts.footerNote,
    contentHtml,
  });
}

/* ==========================================================================
   3. HOŞ GELDİNİZ (YENİ SAKİN / YÖNETİCİ KAYIT) ŞABLONU — ULTRA ETKİLEYİCİ
   ========================================================================== */

export function buildWelcomeEmailHtml(opts: WelcomeEmailOptions): string {
  const base = getPublicSiteUrl().replace(/\/$/, "");
  const accent = "#4f46e5";
  const loginUrl = sanitizeUrl(opts.loginUrl || `${base}/login`);

  const safeName = escapeHtml(opts.name);
  const safeSiteName = escapeHtml(opts.siteName);
  const safeEmail = escapeHtml(opts.emailOrPhone);
  const safeApt = opts.apartmentNo ? escapeHtml(opts.apartmentNo) : null;

  const contentHtml = `
    <!-- Ana Başlık & Karşılama -->
    <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 900; color: #0f172a; line-height: 1.3; letter-spacing: -0.6px;">
      Aramıza Hoş Geldiniz! ✨
    </h1>
    <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #475569;">
      Sayın <strong>${safeName}</strong>, <strong>${safeSiteName}</strong> dijital yönetim ve komşuluk platformundaki hesabınız başarıyla oluşturuldu.
    </p>

    <!-- Kullanıcı Hesap Kartı (Modern Glassmorphic Tasarım) -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 18px; margin: 20px 0 24px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);">
      <tr>
        <td style="padding: 22px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding: 6px 0 10px; border-bottom: 1px solid #e2e8f0;">
                <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Bağlı Olduğunuz Site:</span><br/>
                <strong style="font-size: 16px; color: #0f172a; font-weight: 800;">${safeSiteName}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Giriş E-Posta / Telefon:</span><br/>
                <strong style="font-size: 15px; color: #4f46e5; font-weight: 700;">${safeEmail}</strong>
              </td>
            </tr>
            ${safeApt ? `
            <tr>
              <td style="padding: 10px 0 4px;">
                <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Daire Numarası:</span><br/>
                <strong style="font-size: 15px; color: #0f172a; font-weight: 800;">Daire ${safeApt}</strong>
              </td>
            </tr>` : ""}
          </table>
        </td>
      </tr>
    </table>

    <!-- SİTEYE GİRME İSTEĞİ UYANDIRAN ÖZELLİK VİTRİNİ (FEATURES HIGHLIGHT) -->
    <div style="margin: 28px 0 24px;">
      <h3 style="margin: 0 0 14px; font-size: 14px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.8px;">
        🚀 Sakin Paneli ile Neler Yapabilirsiniz?
      </h3>

      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding: 8px 0;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf5ff; border: 1px solid #f3e8ff; border-radius: 12px; padding: 12px 16px;">
              <tr>
                <td width="36" valign="top" style="font-size: 20px;">💬</td>
                <td style="font-size: 13px; color: #581c87; line-height: 1.5;">
                  <strong>Komşu Sohbeti & Topluluk:</strong> Site sakinleriyle anlık tanışın, duyuruları kaçırmayın.
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 12px; padding: 12px 16px;">
              <tr>
                <td width="36" valign="top" style="font-size: 20px;">💳</td>
                <td style="font-size: 13px; color: #065f46; line-height: 1.5;">
                  <strong>Aidat & Kolay Ödeme:</strong> Aidat borçlarınızı, banka IBAN ve makbuzlarınızı anında görüntüleyin.
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 12px; padding: 12px 16px;">
              <tr>
                <td width="36" valign="top" style="font-size: 20px;">🛠️</td>
                <td style="font-size: 13px; color: #1e40af; line-height: 1.5;">
                  <strong>Arıza & Talep İletimi:</strong> Apartmandaki arızaları fotoğraflı olarak yöneticiye 7/24 iletin.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>

    <!-- Güvenlik & İlk Giriş Hatırlatması -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 12px; margin: 20px 0 28px;">
      <tr>
        <td style="padding: 14px 18px;">
          <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #92400e;">
            💡 <strong>Güvenlik Notu:</strong> Sisteme ilk girişinizde şifrenizi <strong>Hesabım</strong> sayfasından dilediğiniz gibi güncelleyebilirsiniz.
          </p>
        </td>
      </tr>
    </table>

    <!-- BÜYÜK GİRİŞ BUTONU (HIGH-IMPACT CTA) -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 32px auto 8px;">
      <tr>
        <td align="center" style="border-radius: 18px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); box-shadow: 0 10px 24px -4px rgba(79, 70, 229, 0.4);">
          <a href="${loginUrl}" target="_blank" style="font-size: 16px; color: #ffffff; text-decoration: none; font-weight: 800; padding: 17px 42px; border-radius: 18px; display: inline-block; letter-spacing: 0.3px;">
            Sakin Paneline Giriş Yap &rarr;
          </a>
        </td>
      </tr>
    </table>
  `;

  return buildBaseEmailWrapper({
    title: "Aramıza Hoş Geldiniz!",
    badge: "YENİ HESAP",
    badgeColor: "#10b981",
    badgeBg: "#ecfdf5",
    accentColor: accent,
    footerNote: "Bu hesap site yönetimi tarafından sisteme tanımlanmıştır.",
    contentHtml,
  });
}

/* ==========================================================================
   4. YENİ DUYURU BİLDİRİMİ ŞABLONU
   ========================================================================== */

export function buildAnnouncementEmailHtml(opts: AnnouncementEmailOptions): string {
  const base = getPublicSiteUrl().replace(/\/$/, "");
  const accent = "#6366f1";
  const viewUrl = sanitizeUrl(opts.viewUrl || `${base}/dashboard/announcements`);
  const safeTitle = escapeHtml(opts.title);
  const safeContent = escapeHtml(opts.content);
  const safeCategory = escapeHtml(opts.category || "GENEL");
  const safeRecipient = escapeHtml(opts.recipientName || "Değerli Sakin");

  const contentHtml = `
    <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 900; color: #0f172a; line-height: 1.35; letter-spacing: -0.6px;">
      ${safeTitle}
    </h1>
    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7; color: #475569;">
      Merhaba <strong>${safeRecipient}</strong>, siteniz hakkında yeni bir resmi duyuru yayınlandı:
    </p>

    <!-- Duyuru İçerik Kartı -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fafbfc; border: 1px solid #e2e8f0; border-left: 4px solid #6366f1; border-radius: 16px; margin: 20px 0 28px;">
      <tr>
        <td style="padding: 24px;">
          <div style="font-size: 15px; line-height: 1.8; color: #334155; white-space: pre-wrap;">
            ${safeContent}
          </div>
        </td>
      </tr>
    </table>

    <!-- CTA Butonu -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 28px auto 0;">
      <tr>
        <td align="center" style="border-radius: 16px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); box-shadow: 0 8px 20px -4px rgba(99, 102, 241, 0.4);">
          <a href="${viewUrl}" target="_blank" style="font-size: 15px; color: #ffffff; text-decoration: none; font-weight: 800; padding: 16px 38px; border-radius: 16px; display: inline-block;">
            Duyuru Detayını Gör ve Yorum Yap &rarr;
          </a>
        </td>
      </tr>
    </table>
  `;

  return buildBaseEmailWrapper({
    title: opts.title,
    badge: `📢 DUYURU: ${safeCategory.toUpperCase()}`,
    badgeColor: "#6366f1",
    badgeBg: "#eef2ff",
    accentColor: accent,
    footerNote: "Bu e-posta site yönetimi tarafından sakinleri bilgilendirmek amacıyla gönderilmiştir.",
    contentHtml,
  });
}

/* ==========================================================================
   5. AİDAT & ÖDEME MAKBUZU ŞABLONU (PAYMENT RECEIPT)
   ========================================================================== */

export function buildPaymentReceiptEmailHtml(opts: PaymentReceiptOptions): string {
  const base = getPublicSiteUrl().replace(/\/$/, "");
  const accent = "#059669";
  const viewUrl = sanitizeUrl(opts.receiptUrl || `${base}/dashboard/payments`);
  const safeName = escapeHtml(opts.recipientName);
  const safePeriod = escapeHtml(opts.period);
  const safeAmount = escapeHtml(String(opts.amount));
  const safeSite = escapeHtml(opts.siteName);
  const safeApt = escapeHtml(opts.apartmentNo);
  const safeReceipt = escapeHtml(opts.receiptNo);
  const safeDate = escapeHtml(opts.date);

  const contentHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 60px; height: 60px; line-height: 60px; border-radius: 50%; background-color: #ecfdf5; text-align: center; margin-bottom: 12px; border: 2px solid #a7f3d0;">
        <span style="font-size: 30px; vertical-align: middle;">✅</span>
      </div>
      <h1 style="margin: 0 0 10px; font-size: 24px; font-weight: 900; color: #0f172a; line-height: 1.3; letter-spacing: -0.6px;">
        Ödemeniz Başarıyla Alındı
      </h1>
      <p style="margin: 0; font-size: 15px; color: #475569; line-height: 1.6;">
        Sayın <strong>${safeName}</strong>, <strong>${safePeriod}</strong> dönemine ait aidat ödemeniz başarıyla tahsil edilmiştir.
      </p>
    </div>

    <!-- Makbuz Kartı -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 20px; margin: 24px 0;">
      <tr>
        <td style="padding: 24px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding-bottom: 16px; border-bottom: 1px dashed #cbd5e1; text-align: center;">
                <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">TAHSİLAT TUTARI</span>
                <p style="margin: 6px 0 0; font-size: 32px; font-weight: 900; color: #065f46; letter-spacing: -1px;">${safeAmount} ₺</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 0 4px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="6">
                  <tr>
                    <td style="font-size: 13px; color: #64748b;">Site / Apartman:</td>
                    <td align="right" style="font-size: 13px; font-weight: 800; color: #0f172a;">${safeSite}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 13px; color: #64748b;">Daire Numarası:</td>
                    <td align="right" style="font-size: 13px; font-weight: 800; color: #0f172a;">Daire ${safeApt}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 13px; color: #64748b;">Dönem:</td>
                    <td align="right" style="font-size: 13px; font-weight: 800; color: #0f172a;">${safePeriod}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 13px; color: #64748b;">İşlem Tarihi:</td>
                    <td align="right" style="font-size: 13px; font-weight: 800; color: #0f172a;">${safeDate}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 13px; color: #64748b;">Makbuz No:</td>
                    <td align="right" style="font-size: 13px; font-weight: 800; color: #059669; font-family: monospace;">#${safeReceipt}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- CTA Butonu -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 28px auto 0;">
      <tr>
        <td align="center" style="border-radius: 16px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); box-shadow: 0 8px 20px -4px rgba(5, 150, 105, 0.4);">
          <a href="${viewUrl}" target="_blank" style="font-size: 15px; color: #ffffff; text-decoration: none; font-weight: 800; padding: 16px 38px; border-radius: 16px; display: inline-block;">
            Ödeme Geçmişini İncele &rarr;
          </a>
        </td>
      </tr>
    </table>
  `;

  return buildBaseEmailWrapper({
    title: "Ödeme Makbuzu",
    badge: "ÖDEME ONAYLANDI",
    badgeColor: "#059669",
    badgeBg: "#ecfdf5",
    accentColor: accent,
    footerNote: "Bu belge resmi tahsilat kaydı niteliğindedir. İstediğiniz zaman sakin panelinizden tüm geçmiş makbuzlarınıza ulaşabilirsiniz.",
    contentHtml,
  });
}

/* ==========================================================================
   6. TALEP & ARIZA DURUM GÜNCELLEMESİ ŞABLONU
   ========================================================================== */

export function buildSupportTicketUpdateEmailHtml(opts: SupportTicketUpdateOptions): string {
  const base = getPublicSiteUrl().replace(/\/$/, "");
  const accent = "#0284c7";
  const viewUrl = sanitizeUrl(opts.viewUrl || `${base}/dashboard/requests`);
  const safeName = escapeHtml(opts.recipientName);
  const safeId = escapeHtml(opts.ticketId);
  const safeTitle = escapeHtml(opts.ticketTitle);
  const safeStatus = escapeHtml(opts.statusLabel);
  const safeNote = opts.adminResponse ? escapeHtml(opts.adminResponse) : null;

  const contentHtml = `
    <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 900; color: #0f172a; line-height: 1.35; letter-spacing: -0.6px;">
      Talep Durumunuz Güncellendi 🛠️
    </h1>
    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7; color: #475569;">
      Sayın <strong>${safeName}</strong>, oluşturmuş olduğunuz <strong>#${safeId}</strong> numaralı talep yönetici tarafından incelenerek durumu güncellendi.
    </p>

    <!-- Talep Detay Kartı -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 18px; margin: 20px 0 24px;">
      <tr>
        <td style="padding: 22px;">
          <p style="margin: 0 0 4px; font-size: 11px; color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Talep Konusu:</p>
          <p style="margin: 0 0 16px; font-size: 16px; font-weight: 800; color: #0f172a;">${safeTitle}</p>
          
          <p style="margin: 0 0 4px; font-size: 11px; color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Yeni Durum:</p>
          <p style="margin: 0 0 ${safeNote ? "16px" : "0"}; font-size: 15px; font-weight: 800; color: #0284c7;">● ${safeStatus}</p>

          ${safeNote ? `
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid #0284c7; border-radius: 10px; padding: 14px 18px;">
            <p style="margin: 0 0 4px; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">YÖNETİCİ NOTU:</p>
            <p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${safeNote}</p>
          </div>` : ""}
        </td>
      </tr>
    </table>

    <!-- CTA Butonu -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 28px auto 0;">
      <tr>
        <td align="center" style="border-radius: 16px; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); box-shadow: 0 8px 20px -4px rgba(2, 132, 199, 0.4);">
          <a href="${viewUrl}" target="_blank" style="font-size: 15px; color: #ffffff; text-decoration: none; font-weight: 800; padding: 16px 38px; border-radius: 16px; display: inline-block;">
            Talebi Görüntüle ve Yanıtla &rarr;
          </a>
        </td>
      </tr>
    </table>
  `;

  return buildBaseEmailWrapper({
    title: "Talep Durum Güncellemesi",
    badge: `TALEP: #${safeId}`,
    badgeColor: "#0284c7",
    badgeBg: "#e0f2fe",
    accentColor: accent,
    footerNote: "Talebinizle ilgili ek mesaj yazmak veya sürecini canlı takip etmek için yönetim paneline giriş yapabilirsiniz.",
    contentHtml,
  });
}

/* ==========================================================================
   7. HESAP ONAYLANDI ŞABLONU
   ========================================================================== */

export function buildAccountApprovedEmailHtml(opts: AccountApprovedEmailOptions): string {
  const base = getPublicSiteUrl().replace(/\/$/, "");
  const accent = "#4f46e5";
  const loginUrl = sanitizeUrl(opts.loginUrl || `${base}/login`);
  const safeName = escapeHtml(opts.name);
  const safeSite = escapeHtml(opts.siteName);
  const safeEmail = escapeHtml(opts.emailOrPhone);
  const safeApt = opts.apartmentNo ? escapeHtml(opts.apartmentNo) : null;

  const contentHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 60px; height: 60px; line-height: 60px; border-radius: 50%; background-color: #ecfdf5; text-align: center; margin-bottom: 12px; border: 2px solid #a7f3d0;">
        <span style="font-size: 30px; vertical-align: middle;">🎉</span>
      </div>
      <h1 style="margin: 0 0 10px; font-size: 24px; font-weight: 900; color: #0f172a; line-height: 1.3; letter-spacing: -0.6px;">
        Hesabınız Başarıyla Onaylandı!
      </h1>
      <p style="margin: 0; font-size: 15px; color: #475569; line-height: 1.6;">
        Sayın <strong>${safeName}</strong>, <strong>${safeSite}</strong> için yapmış olduğunuz hesap başvurusu site yönetimi tarafından onaylanarak aktifleştirilmiştir.
      </p>
    </div>

    <!-- Onay Detay Kartı -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 18px; margin: 20px 0 24px;">
      <tr>
        <td style="padding: 22px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size: 13px; color: #64748b; padding-bottom: 10px;">Site / Apartman:</td>
              <td align="right" style="font-size: 13px; font-weight: 800; color: #0f172a; padding-bottom: 10px;">${safeSite}</td>
            </tr>
            ${safeApt ? `
            <tr>
              <td style="font-size: 13px; color: #64748b; padding-bottom: 10px;">Daire Numarası:</td>
              <td align="right" style="font-size: 13px; font-weight: 800; color: #0f172a; padding-bottom: 10px;">Daire ${safeApt}</td>
            </tr>` : ""}
            <tr>
              <td style="font-size: 13px; color: #64748b; padding-bottom: 10px;">Giriş Bilgisi:</td>
              <td align="right" style="font-size: 13px; font-weight: 800; color: #4f46e5; padding-bottom: 10px;">${safeEmail}</td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #64748b;">Hesap Durumu:</td>
              <td align="right" style="font-size: 13px; font-weight: 800; color: #059669;">● Aktif &bull; Giriş Yapılabilir</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- CTA Butonu -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 16px;">
      <tr>
        <td align="center">
          <a href="${loginUrl}" target="_blank" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 800; padding: 16px 42px; border-radius: 16px; display: inline-block; box-shadow: 0 10px 24px -4px rgba(79, 70, 229, 0.4);">
            Hemen Giriş Yapın &rarr;
          </a>
        </td>
      </tr>
    </table>
  `;

  return buildBaseEmailWrapper({
    title: "Hesabınız Onaylandı",
    badge: "HESAP ONAYLANDI",
    badgeColor: "#059669",
    badgeBg: "#ecfdf5",
    accentColor: accent,
    footerNote: "Bu e-posta site yöneticiniz tarafından onaylanan hesabınız için gönderilmiştir.",
    contentHtml,
  });
}

/* ==========================================================================
   8. YÖNETİCİYE YENİ SAKİN KAYIT BİLDİRİM ŞABLONU
   ========================================================================== */

export function buildAccountPendingAdminNotificationEmailHtml(opts: AccountPendingAdminNotificationOptions): string {
  const base = getPublicSiteUrl().replace(/\/$/, "");
  const accent = "#f59e0b";
  const reviewUrl = sanitizeUrl(opts.adminReviewUrl || `${base}/admin/residents`);
  const safeName = escapeHtml(opts.userName);
  const safeEmail = escapeHtml(opts.userEmailOrPhone);
  const safeSite = escapeHtml(opts.siteName);
  const safeApt = opts.apartmentNo ? escapeHtml(opts.apartmentNo) : null;

  const contentHtml = `
    <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 900; color: #0f172a; line-height: 1.35; letter-spacing: -0.6px;">
      Yeni Sakin Katıldı 🔔
    </h1>
    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7; color: #475569;">
      <strong>${safeSite}</strong> sitenize yeni bir sakin kaydı yapıldı. Sakin bilgilerini aşağıdan görüntüleyebilirsiniz:
    </p>

    <!-- Detay Kartı -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 18px; margin: 20px 0 24px;">
      <tr>
        <td style="padding: 22px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size: 13px; color: #64748b; padding-bottom: 10px;">Sakin Adı:</td>
              <td align="right" style="font-size: 13px; font-weight: 800; color: #0f172a; padding-bottom: 10px;">${safeName}</td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #64748b; padding-bottom: 10px;">E-Posta / Telefon:</td>
              <td align="right" style="font-size: 13px; font-weight: 800; color: #4f46e5; padding-bottom: 10px;">${safeEmail}</td>
            </tr>
            ${safeApt ? `
            <tr>
              <td style="font-size: 13px; color: #64748b;">Daire Numarası:</td>
              <td align="right" style="font-size: 13px; font-weight: 800; color: #0f172a;">Daire ${safeApt}</td>
            </tr>` : ""}
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 16px;">
      <tr>
        <td align="center">
          <a href="${reviewUrl}" target="_blank" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 800; padding: 16px 38px; border-radius: 16px; display: inline-block; box-shadow: 0 8px 20px -4px rgba(245, 158, 11, 0.4);">
            Sakinleri Yönetici Panelinde İncele &rarr;
          </a>
        </td>
      </tr>
    </table>
  `;

  return buildBaseEmailWrapper({
    title: "Yeni Sakin Katıldı",
    badge: "YENİ SAKİN",
    badgeColor: "#d97706",
    badgeBg: "#fef3c7",
    accentColor: accent,
    footerNote: "Bu e-posta yöneticisi olduğunuz siteye yeni bir sakin kaydı yapıldığında bilgilendirme amacıyla gönderilir.",
    contentHtml,
  });
}

/* ==========================================================================
   9. ŞİFRE SIFIRLAMA ŞABLONU
   ========================================================================== */

export function buildPasswordResetEmailHtml(opts: PasswordResetEmailOptions): string {
  const accent = "#e11d48";
  const greeting = opts.recipientName?.trim() ? `Merhaba <strong>${escapeHtml(opts.recipientName.trim())}</strong>,` : "Merhaba,";
  const minutes = opts.expiresInMinutes || 60;
  const safeResetUrl = sanitizeUrl(opts.resetUrl);

  const contentHtml = `
    <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 900; color: #0f172a; line-height: 1.35; letter-spacing: -0.6px;">
      Şifre Sıfırlama Talebi 🔐
    </h1>
    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7; color: #475569;">
      ${greeting} Site Yönetimi hesabınız için bir şifre sıfırlama talebinde bulunuldu. Yeni şifrenizi güvenle oluşturmak için aşağıdaki butona tıklayabilirsiniz.
    </p>

    <!-- Uyarı Kutusu -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fff1f2; border: 1px solid #ffe4e6; border-left: 4px solid #e11d48; border-radius: 14px; margin: 16px 0 28px;">
      <tr>
        <td style="padding: 16px 20px;">
          <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #9f1239;">
            ⏱️ <strong>Güvenlik Uyarısı:</strong> Bu bağlantı <strong>${minutes} dakika</strong> boyunca geçerlidir. Bu talebi siz yapmadıysanız hesabınız güvendedir, hiçbir işlem yapmanıza gerek yoktur.
          </p>
        </td>
      </tr>
    </table>

    <!-- Eylem Butonu -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 28px auto 0;">
      <tr>
        <td align="center" style="border-radius: 16px; background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); box-shadow: 0 8px 20px -4px rgba(225, 29, 72, 0.4);">
          <a href="${safeResetUrl}" target="_blank" style="font-size: 15px; color: #ffffff; text-decoration: none; font-weight: 800; padding: 16px 40px; border-radius: 16px; display: inline-block;">
            Yeni Şifremi Belirle &rarr;
          </a>
        </td>
      </tr>
    </table>
  `;

  return buildBaseEmailWrapper({
    title: "Şifre Sıfırlama Talebi",
    badge: "GÜVENLİK BİLDİRİMİ",
    badgeColor: "#e11d48",
    badgeBg: "#fff1f2",
    accentColor: accent,
    footerNote: "Şifre talebi sizin bilginiz dahilinde değilse lütfen bu iletiyi dikkate almayınız.",
    contentHtml,
  });
}

/* ==========================================================================
   10. GÜVENLİK ONAY KODU (2FA / VERIFICATION CODE) ŞABLONU
   ========================================================================== */

export function buildVerificationCodeEmailHtml(opts: VerificationCodeEmailOptions): string {
  const accent = "#059669";
  const purpose = escapeHtml(opts.purpose || "hesap güvenlik doğrulama");
  const minutes = opts.expiresInMinutes || 15;
  const safeCode = escapeHtml(opts.code);

  const contentHtml = `
    <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 900; color: #0f172a; line-height: 1.35; letter-spacing: -0.6px;">
      Güvenlik Doğrulama Kodu 🛡️
    </h1>
    <p style="margin: 0 0 22px; font-size: 15px; line-height: 1.7; color: #475569;">
      Yönetim panelinizde <strong>${purpose}</strong> işlemini tamamlamak için aşağıdaki tek kullanımlık güvenlik kodunu kullanabilirsiniz:
    </p>

    <!-- Büyük Kod Kutusu -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); border: 2px dashed #10b981; border-radius: 20px; margin: 24px 0;">
      <tr>
        <td align="center" style="padding: 28px 20px;">
          <span style="font-size: 11px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 10px;">
            ONAY KODUNUZ
          </span>
          <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 40px; font-weight: 900; color: #065f46; letter-spacing: 10px; display: inline-block;">
            ${safeCode}
          </span>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0fdf4; border: 1px solid #dcfce7; border-radius: 12px; margin-bottom: 16px;">
      <tr>
        <td style="padding: 12px 18px; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #166534; line-height: 1.5;">
            ⏳ Bu kod <strong>${minutes} dakika</strong> boyunca geçerlidir. Güvenliğiniz için bu kodu kimseyle paylaşmayınız.
          </p>
        </td>
      </tr>
    </table>
  `;

  return buildBaseEmailWrapper({
    title: "Güvenlik Doğrulama Kodu",
    badge: "ONAY KODU",
    badgeColor: "#059669",
    badgeBg: "#ecfdf5",
    accentColor: accent,
    footerNote: "Bu işlemi siz başlatmadıysanız lütfen sistem yöneticinizle irtibata geçin.",
    contentHtml,
  });
}

/* ==========================================================================
   11. HESAP SİLİNDİ ONAY E-POSTASI (KVKK & GÜVENLİK BİLGİLENDİRMESİ)
   ========================================================================== */

export function buildAccountDeletedEmailHtml(opts: AccountDeletedEmailOptions): string {
  const accent = "#e11d48";
  const now = new Date().toLocaleString("tr-TR");
  const safeName = escapeHtml(opts.recipientName);
  const safeEmail = escapeHtml(opts.emailOrPhone);
  const safeSite = escapeHtml(opts.siteName || SITE_BRAND_NAME);
  const safeApt = opts.apartmentNo ? escapeHtml(opts.apartmentNo) : null;

  const contentHtml = `
    <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 900; color: #0f172a; line-height: 1.35; letter-spacing: -0.6px;">
      Hesabınız Kalıcı Olarak Silindi 🛡️
    </h1>
    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7; color: #475569;">
      Sayın <strong>${safeName}</strong>,<br /><br />
      Talebiniz doğrultusunda <strong>${safeSite}</strong> platformundaki hesabınız ve hesaba bağlı tüm kişisel verileriniz sistemimizden <strong>kalıcı olarak silinmiştir (KVKK Uyumlu)</strong>.
    </p>

    <!-- Bilgi Kartı -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 18px; margin: 20px 0 24px;">
      <tr>
        <td style="padding: 22px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size: 13px; color: #9f1239; padding-bottom: 10px;">Silinen Hesap:</td>
              <td align="right" style="font-size: 13px; font-weight: 800; color: #0f172a; padding-bottom: 10px;">${safeName}</td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #9f1239; padding-bottom: 10px;">E-Posta / Telefon:</td>
              <td align="right" style="font-size: 13px; font-weight: 800; color: #0f172a; padding-bottom: 10px;">${safeEmail}</td>
            </tr>
            ${safeApt ? `
            <tr>
              <td style="font-size: 13px; color: #9f1239; padding-bottom: 10px;">Daire:</td>
              <td align="right" style="font-size: 13px; font-weight: 800; color: #0f172a; padding-bottom: 10px;">Daire ${safeApt}</td>
            </tr>` : ""}
            <tr>
              <td style="font-size: 13px; color: #9f1239;">Silinme Tarihi:</td>
              <td align="right" style="font-size: 13px; font-weight: 800; color: #0f172a;">${now}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px 20px; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.6;">
        💡 Bu işlem sizin bilginiz dışında gerçekleştiyse veya siteye tekrar dahil olmak isterseniz lütfen site yöneticiniz ile iletişime geçiniz.
      </p>
    </div>
  `;

  return buildBaseEmailWrapper({
    title: "Hesabınız Kalıcı Olarak Silindi",
    badge: "HESAP SİLİNDİ",
    badgeColor: "#e11d48",
    badgeBg: "#ffe4e6",
    accentColor: accent,
    footerNote: "Bu bilgilendirme e-postası güvenlik ve yasal zorunluluk (KVKK) kapsamında gönderilmiştir.",
    contentHtml,
  });
}
