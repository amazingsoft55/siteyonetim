import { SITE_BRAND_NAME, SITE_LOGO_PATH } from "@/lib/brand";
import { getPublicSiteUrl } from "@/lib/site-url";

export type BrandedEmailOptions = {
  title: string;
  intro: string;
  bodyHtml?: string;
  ctaHref?: string;
  ctaLabel?: string;
  footerNote?: string;
  accentColor?: string;
};

export function buildBrandedEmailHtml(opts: BrandedEmailOptions): string {
  const base = getPublicSiteUrl().replace(/\/$/, "");
  const logoUrl = `${base}${SITE_LOGO_PATH}`;
  const accent = opts.accentColor || "#4f46e5";
  const accentLight = accent + "18";
  const cta =
    opts.ctaHref && opts.ctaLabel
      ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px auto 0">
          <tr><td style="background:${accent};border-radius:12px;overflow:hidden">
            <a href="${opts.ctaHref}" style="display:inline-block;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px">${opts.ctaLabel}</a>
          </td></tr>
        </table>
        <p style="margin:14px 0 0;font-size:12px;color:#a1a1aa;word-break:break-all;text-align:center">${opts.ctaHref}</p>`
      : "";

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f0f3;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0f0f3;padding:40px 16px">
    <tr><td align="center">

      <!-- Main Card -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:540px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.08)">

        <!-- Header Gradient -->
        <tr><td style="background:linear-gradient(135deg,${accent},#7c3aed);padding:36px 28px 32px;text-align:center;position:relative">
          <!-- Decorative circles -->
          <div style="position:absolute;top:-30px;right:-30px;width:100px;height:100px;background:rgba(255,255,255,.08);border-radius:50%"></div>
          <div style="position:absolute;bottom:-20px;left:-20px;width:70px;height:70px;background:rgba(255,255,255,.06);border-radius:50%"></div>

          <img src="${logoUrl}" alt="${SITE_BRAND_NAME}" width="64" height="64" style="display:block;margin:0 auto 14px;border-radius:16px;background:#fff;padding:4px;box-shadow:0 4px 16px rgba(0,0,0,.15)" />
          <p style="margin:0;color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.3px">${SITE_BRAND_NAME}</p>
        </td></tr>

        <!-- Content -->
        <tr><td style="padding:36px 32px 40px">
          <h1 style="margin:0 0 14px;font-size:22px;font-weight:800;color:#18181b;letter-spacing:-0.5px">${opts.title}</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#52525b">${opts.intro}</p>
          ${opts.bodyHtml ?? ""}
          ${cta}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:0 32px 28px">
          <div style="border-top:1px solid #e4e4e7;padding-top:20px;text-align:center">
            <p style="margin:0 0 6px;font-size:12px;color:#a1a1aa;line-height:1.6">
              ${opts.footerNote ?? "Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz."}
            </p>
            <p style="margin:0;font-size:11px;color:#d4d4d8">&copy; ${new Date().getFullYear()} ${SITE_BRAND_NAME}</p>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
