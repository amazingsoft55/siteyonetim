import { SITE_BRAND_NAME } from "@/lib/brand";
import { getPublicSiteUrl } from "@/lib/site-url";

function emailLogoDataUri(accent: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="16" fill="#fff"/>
    <path d="M18 46V26l14-9 14 9v20" stroke="${accent}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M26 46v-10h12v10" stroke="${accent}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="32" cy="28" r="2.5" fill="${accent}"/>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export type BrandedEmailOptions = {
  title: string;
  intro: string;
  bodyHtml?: string;
  ctaHref?: string;
  ctaLabel?: string;
  footerNote?: string;
  accentColor?: string;
};

export type WelcomeEmailOptions = {
  name: string;
  siteName: string;
  emailOrPhone: string;
  apartmentNo?: string | null;
  role: "ADMIN" | "USER";
  loginUrl: string;
};

export function buildWelcomeEmailHtml(opts: WelcomeEmailOptions): string {
  const accent = "#4f46e5";
  const logoUri = emailLogoDataUri(accent);

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  @keyframes fadeInUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
  @keyframes pulse { 0%,100% { transform:scale(1); box-shadow:0 0 20px rgba(34,197,94,.25) } 50% { transform:scale(1.06); box-shadow:0 0 36px rgba(34,197,94,.45) } }
  @keyframes float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-6px) } }
  @keyframes confetti1 { 0% { transform:translateY(0) rotate(0); opacity:1 } 100% { transform:translateY(-50px) rotate(360deg); opacity:0 } }
  @keyframes confetti2 { 0% { transform:translateY(0) rotate(0); opacity:1 } 100% { transform:translateY(-35px) rotate(-360deg); opacity:0 } }
  @keyframes slideIn { from { opacity:0; transform:translateX(-16px) } to { opacity:1; transform:translateX(0) } }
</style>
</head>
<body style="margin:0;padding:0;background:#f0f0f3;font-family:'Segoe UI',Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0f0f3;padding:40px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:540px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.07)">

        <tr><td style="background:linear-gradient(135deg,${accent},${accent}cc);padding:44px 32px 38px;text-align:center;position:relative">
          <span style="position:absolute;top:18px;left:28%;width:8px;height:8px;background:#fbbf24;border-radius:50%;animation:confetti1 2.4s ease-out infinite"></span>
          <span style="position:absolute;top:12px;left:48%;width:6px;height:6px;background:#f472b6;border-radius:50%;animation:confetti2 2.8s ease-out infinite .3s"></span>
          <span style="position:absolute;top:22px;left:68%;width:7px;height:7px;background:#34d399;border-radius:50%;animation:confetti1 2.1s ease-out infinite .6s"></span>
          <span style="position:absolute;top:8px;left:18%;width:5px;height:5px;background:#818cf8;border-radius:50%;animation:confetti2 3s ease-out infinite .2s"></span>
          <span style="position:absolute;top:28px;left:82%;width:6px;height:6px;background:#fb923c;border-radius:50%;animation:confetti1 2.6s ease-out infinite .9s"></span>

          <div style="width:84px;height:84px;margin:0 auto 16px;background:rgba(255,255,255,.15);border-radius:50%;animation:pulse 3s ease-in-out infinite;display:flex;align-items:center;justify-content:center">
            <img src="${logoUri}" alt="${SITE_BRAND_NAME}" width="52" height="52" style="display:block;border-radius:12px;animation:float 3s ease-in-out infinite" />
          </div>
          <p style="margin:0;color:rgba(255,255,255,.75);font-size:12px;text-transform:uppercase;letter-spacing:3px;font-weight:700;animation:fadeIn .8s ease-out">HOŞ GELDİNİZ</p>
          <h1 style="margin:6px 0 0;color:#fff;font-size:24px;font-weight:800;animation:fadeInUp .8s ease-out .15s both">Site Yönetimi'ne Katıldınız!</h1>
        </td></tr>

        <tr><td style="padding:36px 32px 16px">
          <p style="margin:0 0 6px;font-size:19px;font-weight:700;color:#1a1a2e;animation:fadeInUp .7s ease-out .3s both">Merhaba ${opts.name}</p>
          <p style="margin:0 0 28px;font-size:14px;line-height:1.7;color:#666;animation:fadeInUp .7s ease-out .4s both"><strong>${opts.siteName}</strong> sitesine başarıyla eklendiniz. Aşağıda hesap bilgilerinizi bulabilirsiniz.</p>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="animation:fadeInUp .7s ease-out .5s both">
            <tr><td style="padding:18px 20px;background:#f8fafc;border-radius:14px;border:1px solid #e2e8f0">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="width:44px;vertical-align:top;padding-top:2px">
                    <div style="width:40px;height:40px;background:${accent}12;border-radius:11px;text-align:center;line-height:40px;font-size:17px">📧</div>
                  </td>
                  <td style="padding-left:14px">
                    <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:700">E-posta / Kullanıcı Adı</p>
                    <p style="margin:4px 0 0;font-size:15px;color:#1e293b;font-weight:700">${opts.emailOrPhone}</p>
                  </td>
                </tr>
              </table>
            </td></tr>
            ${opts.apartmentNo ? `<tr><td style="height:10px"></td></tr><tr><td style="padding:18px 20px;background:#f8fafc;border-radius:14px;border:1px solid #e2e8f0">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="width:44px;vertical-align:top;padding-top:2px">
                    <div style="width:40px;height:40px;background:${accent}12;border-radius:11px;text-align:center;line-height:40px;font-size:17px">🏠</div>
                  </td>
                  <td style="padding-left:14px">
                    <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:700">Daire No</p>
                    <p style="margin:4px 0 0;font-size:15px;color:#1e293b;font-weight:700">${opts.apartmentNo}</p>
                  </td>
                </tr>
              </table>
            </td></tr>` : ""}
          </table>
        </td></tr>

        <tr><td style="padding:0 32px 24px;animation:fadeInUp .7s ease-out .6s both">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,#fef3c7,#fef9c3);border:1px solid #fde68a;border-radius:14px">
            <tr><td style="padding:16px 18px">
              <table role="presentation" cellspacing="0" cellpadding="0"><tr>
                <td style="vertical-align:top;font-size:18px;line-height:1">⚠️</td>
                <td style="padding-left:10px">
                  <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6"><strong>Güvenlik Notu:</strong> Şifreniz yöneticiniz tarafından oluşturulmuştur. İlk girişinizde size özel bir şifre belirlemeniz istenecektir.</p>
                </td>
              </tr></table>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 32px 28px;text-align:center;animation:fadeInUp .7s ease-out .7s both">
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto">
            <tr><td style="background:linear-gradient(135deg,${accent},${accent}bb);border-radius:14px;box-shadow:0 6px 20px ${accent}35">
              <a href="${opts.loginUrl}" style="display:inline-block;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:15px 40px;letter-spacing:.3px">Panele Giriş Yap →</a>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 32px 28px;animation:fadeInUp .7s ease-out .8s both">
          <p style="margin:0 0 14px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;text-align:center">Yapabilecekleriniz</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td width="33%" style="text-align:center;padding:10px 4px">
                <div style="width:48px;height:48px;background:#f0fdf4;border-radius:14px;margin:0 auto 8px;line-height:48px;font-size:20px;animation:slideIn .6s ease-out .9s both">📋</div>
                <p style="margin:0;font-size:11px;color:#64748b;font-weight:700">Duyurular</p>
              </td>
              <td width="33%" style="text-align:center;padding:10px 4px">
                <div style="width:48px;height:48px;background:#eff6ff;border-radius:14px;margin:0 auto 8px;line-height:48px;font-size:20px;animation:slideIn .6s ease-out 1s both">💰</div>
                <p style="margin:0;font-size:11px;color:#64748b;font-weight:700">Aidat Takibi</p>
              </td>
              <td width="33%" style="text-align:center;padding:10px 4px">
                <div style="width:48px;height:48px;background:#fdf4ff;border-radius:14px;margin:0 auto 8px;line-height:48px;font-size:20px;animation:slideIn .6s ease-out 1.1s both">🔧</div>
                <p style="margin:0;font-size:11px;color:#64748b;font-weight:700">Talepler</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 32px 28px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr><td style="border-top:1px solid #f1f5f9;padding-top:20px;text-align:center">
              <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6">Bu hesap site yönetimi tarafından oluşturulmuştur.<br>Sorularınız için yöneticinizle iletişime geçin.</p>
              <p style="margin:8px 0 0;font-size:10px;color:#cbd5e1">&copy; ${new Date().getFullYear()} ${SITE_BRAND_NAME}</p>
            </td></tr>
          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildBrandedEmailHtml(opts: BrandedEmailOptions): string {
  const base = getPublicSiteUrl().replace(/\/$/, "");
  const accent = opts.accentColor || "#4f46e5";
  const logoUri = emailLogoDataUri(accent);

  const cta =
    opts.ctaHref && opts.ctaLabel
      ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px auto 0">
          <tr><td style="background:${accent};border-radius:12px">
            <a href="${opts.ctaHref}" style="display:inline-block;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px">${opts.ctaLabel}</a>
          </td></tr>
        </table>
        <p style="margin:14px 0 0;font-size:11px;color:#a1a1aa;word-break:break-all;text-align:center">${opts.ctaHref}</p>`
      : "";

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f0f3;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0f0f3;padding:40px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.08)">

        <tr><td style="background:linear-gradient(135deg,${accent},#7c3aed);padding:36px 28px 32px;text-align:center">
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto">
            <tr><td style="background:#fff;border-radius:14px;padding:6px">
              <img src="${logoUri}" alt="${SITE_BRAND_NAME}" width="48" height="48" style="display:block;border-radius:10px" />
            </td></tr>
          </table>
          <p style="margin:16px 0 0;color:#fff;font-size:19px;font-weight:700;letter-spacing:-0.3px">${SITE_BRAND_NAME}</p>
          <p style="margin:6px 0 0;color:rgba(255,255,255,.7);font-size:12px;font-weight:500">Yönetim Paneli</p>
        </td></tr>

        <tr><td style="padding:36px 32px 40px">
          <h1 style="margin:0 0 14px;font-size:22px;font-weight:800;color:#18181b;letter-spacing:-0.5px">${opts.title}</h1>
          <div style="width:40px;height:3px;background:${accent};border-radius:2px;margin:0 0 18px"></div>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#52525b">${opts.intro}</p>
          ${opts.bodyHtml ?? ""}
          ${cta}
        </td></tr>

        <tr><td style="padding:0 32px 28px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr><td style="border-top:1px solid #e4e4e7;padding-top:20px;text-align:center">
              <p style="margin:0 0 6px;font-size:11px;color:#a1a1aa;line-height:1.6">
                ${opts.footerNote ?? "Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz."}
              </p>
              <p style="margin:0;font-size:10px;color:#d4d4d8">&copy; ${new Date().getFullYear()} ${SITE_BRAND_NAME} &mdash; Tüm hakları saklıdır.</p>
            </td></tr>
          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
