import { SITE_BRAND_NAME } from "@/lib/brand";
import { getPublicSiteUrl } from "@/lib/site-url";

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
  amount: string;
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
  totalAmount: string;
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
   1. GENEL / ANA TEMEL ÇERÇEVE ŞABLONU (BASE WRAPPER)
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
  <title>${opts.title} — ${SITE_BRAND_NAME}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 16px 48px;">

        <!-- Ana Kart Kapsayıcı -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">

          <!-- Üst Degrade Şerit -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, ${accent}, #8b5cf6, #ec4899);"></td>
          </tr>

          <!-- Başlık & Logo Alanı -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #f1f5f9; background-color: #fafbfc;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center">
                <tr>
                  <td align="center" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);">
                    <img src="${logoUrl}" alt="${SITE_BRAND_NAME}" width="46" height="46" style="display: block; border-radius: 10px; border: 0;" />
                  </td>
                </tr>
              </table>
              <h2 style="margin: 14px 0 0; font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">
                ${SITE_BRAND_NAME}
              </h2>
              <p style="margin: 3px 0 0; font-size: 12px; color: #64748b; font-weight: 500;">
                Akıllı Site & Apartman Yönetim Sistemi
              </p>
            </td>
          </tr>

          <!-- İçerik Alanı -->
          <tr>
            <td style="padding: 36px 32px 32px;">

              <!-- Rozet / Badge -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="background-color: ${badgeBg}; border-radius: 20px; padding: 5px 14px; border: 1px solid ${badgeColor}30;">
                    <span style="font-size: 11px; font-weight: 800; color: ${badgeColor}; text-transform: uppercase; letter-spacing: 0.8px;">
                      ${badgeText}
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
            <td style="padding: 24px 32px 28px; background-color: #fafbfc; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 12px; line-height: 1.6; color: #64748b;">
                ${opts.footerNote ?? "Bu e-posta otomatik olarak gönderilmiştir. Lütfen doğrudan yanıtlamayınız."}
              </p>
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 12px auto 10px;">
                <tr>
                  <td style="font-size: 11px; color: #94a3b8;">
                    <a href="${base}/gizlilik-politikasi" target="_blank" style="color: #64748b; text-decoration: underline; margin: 0 6px;">Gizlilik Politikası</a> &bull;
                    <a href="${base}/destek" target="_blank" style="color: #64748b; text-decoration: underline; margin: 0 6px;">Yardım Merkezi</a> &bull;
                    <a href="${base}/login" target="_blank" style="color: #64748b; text-decoration: underline; margin: 0 6px;">Giriş Yap</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} ${SITE_BRAND_NAME}. Tüm hakları saklıdır.
              </p>
            </td>
          </tr>

        </table>

        <!-- Güvenlik Bilgisi -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; margin-top: 16px; text-align: center;">
          <tr>
            <td style="font-size: 11px; color: #94a3b8; line-height: 1.5;">
              🛡️ Bu işlem <strong>siteyonetim.keskindev.com</strong> altyapısı ile güvence altına alınmıştır.
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
            <td align="center" style="border-radius: 12px; background: ${accent}; box-shadow: 0 4px 14px ${accent}40;">
              <a href="${opts.ctaHref}" target="_blank" style="font-size: 15px; color: #ffffff; text-decoration: none; font-weight: 700; padding: 15px 36px; border-radius: 12px; display: inline-block;">
                ${opts.ctaLabel} &rarr;
              </a>
            </td>
          </tr>
        </table>
      `
      : "";

  const contentHtml = `
    <h1 style="margin: 0 0 14px; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.35; letter-spacing: -0.5px;">
      ${opts.title}
    </h1>
    <p style="margin: 0 0 22px; font-size: 15px; line-height: 1.7; color: #334155;">
      ${opts.intro}
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
   3. ŞİFRE SIFIRLAMA ŞABLONU
   ========================================================================== */

export function buildPasswordResetEmailHtml(opts: PasswordResetEmailOptions): string {
  const accent = "#e11d48";
  const greeting = opts.recipientName?.trim() ? `Merhaba <strong>${opts.recipientName.trim()}</strong>,` : "Merhaba,";
  const minutes = opts.expiresInMinutes || 60;

  const contentHtml = `
    <h1 style="margin: 0 0 14px; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.35; letter-spacing: -0.5px;">
      Şifre Sıfırlama Talebi
    </h1>
    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7; color: #334155;">
      ${greeting} Site Yönetimi hesabınız için bir şifre sıfırlama talebinde bulunuldu. Yeni şifrenizi güvenli bir şekilde oluşturmak için aşağıdaki butona tıklayabilirsiniz.
    </p>

    <!-- Uyarı Kutusu -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fff1f2; border: 1px solid #ffe4e6; border-left: 4px solid #e11d48; border-radius: 12px; margin: 16px 0 28px;">
      <tr>
        <td style="padding: 16px 18px;">
          <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #9f1239;">
            ⏱️ <strong>Süre Sınırı:</strong> Bu bağlantı güvenlik amacıyla yaklaşık <strong>${minutes} dakika</strong> geçerlidir. Talebi siz yapmadıysanız lütfen bu e-postayı dikkate almayınız.
          </p>
        </td>
      </tr>
    </table>

    <!-- Eylem Butonu -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 28px auto 0;">
      <tr>
        <td align="center" style="border-radius: 12px; background: #e11d48; box-shadow: 0 4px 14px rgba(225, 29, 72, 0.35);">
          <a href="${opts.resetUrl}" target="_blank" style="font-size: 15px; color: #ffffff; text-decoration: none; font-weight: 700; padding: 15px 36px; border-radius: 12px; display: inline-block;">
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
    footerNote: "Bu talep bilginiz dahilinde değilse hesabınız tamamen güvendedir, hiçbir işlem yapmanıza gerek yoktur.",
    contentHtml,
  });
}

/* ==========================================================================
   4. GÜVENLİK ONAY KODU (2FA / VERIFICATION CODE) ŞABLONU
   ========================================================================== */

export function buildVerificationCodeEmailHtml(opts: VerificationCodeEmailOptions): string {
  const accent = "#059669";
  const purpose = opts.purpose || "hesap güvenlik doğrulama";
  const minutes = opts.expiresInMinutes || 15;

  const contentHtml = `
    <h1 style="margin: 0 0 14px; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.35; letter-spacing: -0.5px;">
      Tek Kullanımlık Onay Kodu
    </h1>
    <p style="margin: 0 0 22px; font-size: 15px; line-height: 1.7; color: #334155;">
      Yönetim panelinizde <strong>${purpose}</strong> işlemini tamamlamak için aşağıdaki güvenlik kodunu kullanabilirsiniz:
    </p>

    <!-- Büyük Kod Kutusu -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 2px dashed #10b981; border-radius: 16px; margin: 24px 0;">
      <tr>
        <td align="center" style="padding: 28px 20px;">
          <span style="font-size: 11px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 8px;">
            ONAY KODUNUZ
          </span>
          <span style="font-family: 'SFMono-Regular', Consolas, Menlo, Monaco, monospace; font-size: 38px; font-weight: 800; color: #065f46; letter-spacing: 8px; display: inline-block;">
            ${opts.code}
          </span>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0fdf4; border: 1px solid #dcfce7; border-radius: 10px; margin-bottom: 16px;">
      <tr>
        <td style="padding: 12px 16px; text-align: center;">
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
    footerNote: "Bu işlemi siz başlatmadıysanız lütfen derhal sistem yöneticinizle irtibata geçin.",
    contentHtml,
  });
}

/* ==========================================================================
   5. HOŞ GELDİNİZ (YENİ SAKİN / YÖNETİCİ KAYIT) ŞABLONU
   ========================================================================== */

export function buildWelcomeEmailHtml(opts: WelcomeEmailOptions): string {
  const base = getPublicSiteUrl().replace(/\/$/, "");
  const accent = "#4f46e5";
  const loginUrl = opts.loginUrl || `${base}/login`;

  const contentHtml = `
    <h1 style="margin: 0 0 14px; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.35; letter-spacing: -0.5px;">
      Aramıza Hoş Geldiniz! 👋
    </h1>
    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7; color: #334155;">
      Merhaba <strong>${opts.name}</strong>, <strong>${opts.siteName}</strong> sakinleri ve yönetim ağına kaydınız başarıyla tamamlandı. Sisteme aşağıdaki bilgilerle giriş yapabilirsiniz:
    </p>

    <!-- Bilgi Kartı -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin: 20px 0;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9;">
                <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Bağlı Olduğunuz Site:</span><br/>
                <strong style="font-size: 15px; color: #0f172a;">${opts.siteName}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Giriş E-postanız / Telefon:</span><br/>
                <strong style="font-size: 15px; color: #0f172a;">${opts.emailOrPhone}</strong>
              </td>
            </tr>
            ${opts.apartmentNo ? `
            <tr>
              <td style="padding: 10px 0;">
                <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Daire Numaranız:</span><br/>
                <strong style="font-size: 15px; color: #0f172a;">Daire ${opts.apartmentNo}</strong>
              </td>
            </tr>` : ""}
          </table>
        </td>
      </tr>
    </table>

    <!-- İlk Giriş Notu -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 12px; margin: 16px 0 28px;">
      <tr>
        <td style="padding: 14px 18px;">
          <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #92400e;">
            💡 <strong>İlk Giriş:</strong> Şifreniz yöneticiniz tarafından tanımlanmıştır. Sisteme ilk girişinizde şifrenizi dilediğiniz gibi güncelleyebilirsiniz.
          </p>
        </td>
      </tr>
    </table>

    <!-- Giriş Butonu -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 28px auto 0;">
      <tr>
        <td align="center" style="border-radius: 12px; background: ${accent}; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);">
          <a href="${loginUrl}" target="_blank" style="font-size: 15px; color: #ffffff; text-decoration: none; font-weight: 700; padding: 15px 36px; border-radius: 12px; display: inline-block;">
            Yönetim Paneline Giriş Yap &rarr;
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
    footerNote: "Bu hesap site yöneticiniz tarafından sisteme kaydedilmiştir.",
    contentHtml,
  });
}

/* ==========================================================================
   6. YENİ DUYURU BİLDİRİMİ ŞABLONU
   ========================================================================== */

export function buildAnnouncementEmailHtml(opts: AnnouncementEmailOptions): string {
  const base = getPublicSiteUrl().replace(/\/$/, "");
  const accent = "#6366f1";
  const viewUrl = opts.viewUrl || `${base}/dashboard/announcements`;

  const contentHtml = `
    <h1 style="margin: 0 0 14px; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.35; letter-spacing: -0.5px;">
      ${opts.title}
    </h1>
    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7; color: #334155;">
      Merhaba <strong>${opts.recipientName || "Değerli Sakin"}</strong>, siteniz hakkında yeni bir duyuru yayınlandı:
    </p>

    <!-- Duyuru Kartı -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin: 20px 0 28px;">
      <tr>
        <td style="padding: 24px;">
          <div style="font-size: 15px; line-height: 1.8; color: #334155;">
            ${opts.content}
          </div>
        </td>
      </tr>
    </table>

    <!-- Duyuruyu Gör Butonu -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 28px auto 0;">
      <tr>
        <td align="center" style="border-radius: 12px; background: ${accent}; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);">
          <a href="${viewUrl}" target="_blank" style="font-size: 15px; color: #ffffff; text-decoration: none; font-weight: 700; padding: 15px 36px; border-radius: 12px; display: inline-block;">
            Duyurunun Detaylarını Gör &rarr;
          </a>
        </td>
      </tr>
    </table>
  `;

  return buildBaseEmailWrapper({
    title: opts.title,
    badge: `📢 DUYURU: ${opts.category.toUpperCase()}`,
    badgeColor: "#6366f1",
    badgeBg: "#eef2ff",
    accentColor: accent,
    footerNote: "Bu e-posta site yönetimi tarafından duyuru amacıyla gönderilmiştir.",
    contentHtml,
  });
}

/* ==========================================================================
   7. AİDAT & ÖDEME MAKBUZU ŞABLONU (PAYMENT RECEIPT)
   ========================================================================== */

export function buildPaymentReceiptEmailHtml(opts: PaymentReceiptOptions): string {
  const accent = "#059669";

  const contentHtml = `
    <h1 style="margin: 0 0 14px; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.35; letter-spacing: -0.5px;">
      Ödemeniz Başarıyla Alındı 🎉
    </h1>
    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7; color: #334155;">
      Sayın <strong>${opts.recipientName}</strong>, <strong>${opts.period}</strong> dönemine ait aidat ödemeniz başarıyla tahsil edilmiştir.
    </p>

    <!-- Makbuz Fatura Kartı -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; margin: 24px 0;">
      <tr>
        <td style="padding: 24px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
                <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Ödenen Tutar</span>
                <p style="margin: 4px 0 0; font-size: 28px; font-weight: 800; color: #065f46;">${opts.amount} ₺</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 0 6px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="font-size: 13px; color: #64748b;">Site / Daire:</td>
                    <td align="right" style="font-size: 13px; font-weight: 700; color: #0f172a;">${opts.siteName} &bull; Daire ${opts.apartmentNo}</td>
                  </tr>
                  <tr>
                    <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Dönem:</td>
                    <td align="right" style="padding-top: 8px; font-size: 13px; font-weight: 700; color: #0f172a;">${opts.period}</td>
                  </tr>
                  <tr>
                    <td style="padding-top: 8px; font-size: 13px; color: #64748b;">İşlem Tarihi:</td>
                    <td align="right" style="padding-top: 8px; font-size: 13px; font-weight: 700; color: #0f172a;">${opts.date}</td>
                  </tr>
                  <tr>
                    <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Makbuz / İşlem No:</td>
                    <td align="right" style="padding-top: 8px; font-size: 13px; font-weight: 700; color: #0f172a; font-family: monospace;">#${opts.receiptNo}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  return buildBaseEmailWrapper({
    title: "Ödeme Makbuzu",
    badge: "ÖDEME BAŞARILI",
    badgeColor: "#059669",
    badgeBg: "#ecfdf5",
    accentColor: accent,
    footerNote: "Bu belge resmi tahsilat kaydı niteliğindedir. İstediğiniz zaman panelinizden geçmiş makbuzlarınıza ulaşabilirsiniz.",
    contentHtml,
  });
}

/* ==========================================================================
   8. TALEP & ARIZA DURUM GÜNCELLEMESİ ŞABLONU (SUPPORT TICKET)
   ========================================================================== */

export function buildSupportTicketUpdateEmailHtml(opts: SupportTicketUpdateOptions): string {
  const accent = "#0284c7";

  const contentHtml = `
    <h1 style="margin: 0 0 14px; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.35; letter-spacing: -0.5px;">
      Talep Durumunuz Güncellendi
    </h1>
    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7; color: #334155;">
      Sayın <strong>${opts.recipientName}</strong>, oluşturmuş olduğunuz <strong>#${opts.ticketId}</strong> numaralı talep yönetici tarafından güncellendi.
    </p>

    <!-- Talep Detay Kartı -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin: 20px 0 24px;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0 0 6px; font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase;">Talep Konusu:</p>
          <p style="margin: 0 0 16px; font-size: 16px; font-weight: 800; color: #0f172a;">${opts.ticketTitle}</p>
          
          <p style="margin: 0 0 6px; font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase;">Yeni Durum:</p>
          <p style="margin: 0 0 ${opts.adminResponse ? "16px" : "0"}; font-size: 14px; font-weight: 800; color: #0284c7;">${opts.statusLabel}</p>

          ${opts.adminResponse ? `
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-left: 3px solid #0284c7; border-radius: 8px; padding: 12px 16px;">
            <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #64748b;">YÖNETİCİ NOTU:</p>
            <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.6;">${opts.adminResponse}</p>
          </div>` : ""}
        </td>
      </tr>
    </table>
  `;

  return buildBaseEmailWrapper({
    title: "Talep Durum Güncellemesi",
    badge: `TALEP: #${opts.ticketId}`,
    badgeColor: "#0284c7",
    badgeBg: "#e0f2fe",
    accentColor: accent,
    footerNote: "Talebinize ek mesaj yazmak veya sürecini takip etmek için yönetim paneline giriş yapabilirsiniz.",
    contentHtml,
  });
}

/* ==========================================================================
   9. HESAP ONAYLANDI ŞABLONU (ACCOUNT APPROVED)
   ========================================================================== */

export function buildAccountApprovedEmailHtml(opts: AccountApprovedEmailOptions): string {
  const accent = "#4f46e5";
  const loginUrl = opts.loginUrl || `${getPublicSiteUrl()}/login`;

  const contentHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background-color: #ecfdf5; text-align: center; margin-bottom: 12px;">
        <span style="font-size: 28px; vertical-align: middle;">🎉</span>
      </div>
      <h1 style="margin: 0 0 10px; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.3; letter-spacing: -0.5px;">
        Hesabınız Başarıyla Onaylandı!
      </h1>
      <p style="margin: 0; font-size: 15px; color: #475569; line-height: 1.6;">
        Sayın <strong>${opts.name}</strong>, <strong>${opts.siteName}</strong> için yapmış olduğunuz hesap başvurusu site yönetimi tarafından incelenmiş ve onaylanmıştır.
      </p>
    </div>

    <!-- Onay Detay Kartı -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; margin: 20px 0 24px;">
      <tr>
        <td style="padding: 22px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size: 13px; color: #64748b; padding-bottom: 10px;">Site / Apartman:</td>
              <td align="right" style="font-size: 13px; font-weight: 700; color: #0f172a; padding-bottom: 10px;">${opts.siteName}</td>
            </tr>
            ${opts.apartmentNo ? `
            <tr>
              <td style="font-size: 13px; color: #64748b; padding-bottom: 10px;">Daire Numarası:</td>
              <td align="right" style="font-size: 13px; font-weight: 700; color: #0f172a; padding-bottom: 10px;">Daire ${opts.apartmentNo}</td>
            </tr>` : ""}
            <tr>
              <td style="font-size: 13px; color: #64748b; padding-bottom: 10px;">Kayıtlı E-Posta / Telefon:</td>
              <td align="right" style="font-size: 13px; font-weight: 700; color: #0f172a; padding-bottom: 10px;">${opts.emailOrPhone}</td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #64748b;">Hesap Durumu:</td>
              <td align="right" style="font-size: 13px; font-weight: 700; color: #059669;">● Aktif — Giriş Yapılabilir</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 8px; padding: 14px 16px; margin: 18px 0 24px;">
      <p style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #15803d;">Sakin Paneli ile Neler Yapabilirsiniz?</p>
      <p style="margin: 0; font-size: 12px; color: #166534; line-height: 1.6;">
        &bull; Aylık aidat ve ortak gider durumunuzu takip edebilirsiniz.<br/>
        &bull; Yönetim duyurularını anlık olarak görüntüleyebilirsiniz.<br/>
        &bull; Arıza, istek ve şikayetlerinizi doğrudan yöneticiye iletebilirsiniz.
      </p>
    </div>

    <!-- CTA Butonu -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0 16px;">
      <tr>
        <td align="center">
          <a href="${loginUrl}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 36px; border-radius: 12px; display: inline-block;">
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
   10. YÖNETİCİYE YENİ SAKİN KAYIT BİLDİRİM ŞABLONU
   ========================================================================== */

export function buildAccountPendingAdminNotificationEmailHtml(opts: AccountPendingAdminNotificationOptions): string {
  const accent = "#f59e0b";
  const reviewUrl = opts.adminReviewUrl || `${getPublicSiteUrl()}/admin/residents`;

  const contentHtml = `
    <h1 style="margin: 0 0 14px; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.35; letter-spacing: -0.5px;">
      Yeni Sakin Kayıt Başvurusu 🔔
    </h1>
    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7; color: #334155;">
      <strong>${opts.siteName}</strong> için yeni bir sakin kayıt başvurusu yapıldı. Başvuruyu inceleyip onaylayabilirsiniz.
    </p>

    <!-- Detay Kartı -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin: 20px 0 24px;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size: 13px; color: #64748b; padding-bottom: 8px;">Başvuran Adı:</td>
              <td align="right" style="font-size: 13px; font-weight: 700; color: #0f172a; padding-bottom: 8px;">${opts.userName}</td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #64748b; padding-bottom: 8px;">E-Posta / Telefon:</td>
              <td align="right" style="font-size: 13px; font-weight: 700; color: #0f172a; padding-bottom: 8px;">${opts.userEmailOrPhone}</td>
            </tr>
            ${opts.apartmentNo ? `
            <tr>
              <td style="font-size: 13px; color: #64748b;">Daire Numarası:</td>
              <td align="right" style="font-size: 13px; font-weight: 700; color: #0f172a;">Daire ${opts.apartmentNo}</td>
            </tr>` : ""}
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0 16px;">
      <tr>
        <td align="center">
          <a href="${reviewUrl}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 12px; display: inline-block;">
            Başvuruyu Yönetici Panelinde İncele &rarr;
          </a>
        </td>
      </tr>
    </table>
  `;

  return buildBaseEmailWrapper({
    title: "Yeni Sakin Kayıt Başvurusu",
    badge: "YENİ BAŞVURU",
    badgeColor: "#d97706",
    badgeBg: "#fef3c7",
    accentColor: accent,
    footerNote: "Bu e-posta yöneticisi olduğunuz siteye yeni bir sakin kaydı yapıldığında bilgilendirme amacıyla gönderilir.",
    contentHtml,
  });
}

/* ==========================================================================
   11. HESAP SİLİNDİ ONAY E-POSTASI (KVKK & GÜVENLİK BİLGİLENDİRMESİ)
   ========================================================================== */

export function buildAccountDeletedEmailHtml(opts: AccountDeletedEmailOptions): string {
  const accent = "#e11d48";
  const now = new Date().toLocaleString("tr-TR");

  const contentHtml = `
    <h1 style="margin: 0 0 14px; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.35; letter-spacing: -0.5px;">
      Hesabınız Kalıcı Olarak Silindi
    </h1>
    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7; color: #334155;">
      Sayın <strong>${opts.recipientName}</strong>,<br /><br />
      Talebiniz doğrultusunda <strong>${opts.siteName || SITE_BRAND_NAME}</strong> platformundaki hesabınız ve hesaba bağlı tüm kişisel verileriniz sistemimizden <strong>kalıcı olarak silinmiştir (KVKK Uyumlu)</strong>.
    </p>

    <!-- Bilgi Kartı -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 14px; margin: 20px 0 24px;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size: 13px; color: #9f1239; padding-bottom: 8px;">Silinen Hesap:</td>
              <td align="right" style="font-size: 13px; font-weight: 700; color: #0f172a; padding-bottom: 8px;">${opts.recipientName}</td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #9f1239; padding-bottom: 8px;">E-Posta / Telefon:</td>
              <td align="right" style="font-size: 13px; font-weight: 700; color: #0f172a; padding-bottom: 8px;">${opts.emailOrPhone}</td>
            </tr>
            ${opts.apartmentNo ? `
            <tr>
              <td style="font-size: 13px; color: #9f1239; padding-bottom: 8px;">Daire:</td>
              <td align="right" style="font-size: 13px; font-weight: 700; color: #0f172a; padding-bottom: 8px;">Daire ${opts.apartmentNo}</td>
            </tr>` : ""}
            <tr>
              <td style="font-size: 13px; color: #9f1239;">Silinme Tarihi:</td>
              <td align="right" style="font-size: 13px; font-weight: 700; color: #0f172a;">${now}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.6;">
        💡 Bu işlem sizin bilginiz dışında gerçekleştiyse veya tekrar katılmak isterseniz lütfen site yöneticiniz ile iletişime geçiniz.
      </p>
    </div>
  `;

  return buildBaseEmailWrapper({
    title: "Hesabınız Kalıcı Olarak Silindi",
    badge: "HESAP SİLİNDİ",
    badgeColor: "#e11d48",
    badgeBg: "#ffe4e6",
    accentColor: accent,
    footerNote: "Bu bilgilendirme e-postası güvenlik ve yasal zorunluluk kapsamında gönderilmiştir.",
    contentHtml,
  });
}

