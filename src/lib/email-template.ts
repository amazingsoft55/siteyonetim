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

  const cta =
    opts.ctaHref && opts.ctaLabel
      ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px auto 0">
          <tr><td style="background:${accent};border-radius:10px">
            <a href="${opts.ctaHref}" style="display:inline-block;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 28px">Yenilikleri Keşfet</a>
          </td></tr>
        </table>
        <p style="margin:12px 0 0;font-size:11px;color:#a1a1aa;word-break:break-all;text-align:center">${opts.ctaHref}</p>`
      : "";

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06)">

        <tr><td style="background:linear-gradient(135deg,${accent},#7c3aed);padding:28px 24px 24px;text-align:center">
          <img src="${logoUrl}" alt="${SITE_BRAND_NAME}" width="56" height="56" style="display:block;margin:0 auto 10px;border-radius:14px;background:#fff;padding:3px" />
          <p style="margin:0;color:#fff;font-size:17px;font-weight:700">${SITE_BRAND_NAME}</p>
        </td></tr>

        <tr><td style="padding:32px 28px 36px">
          <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#1a1a2e">${opts.title}</h1>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.65;color:#555">${opts.intro}</p>
          ${opts.bodyHtml ?? ""}
          ${cta}
        </td></tr>

        <tr><td style="padding:0 28px 24px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr><td style="border-top:1px solid #eee;padding-top:18px;text-align:center">
              <p style="margin:0;font-size:11px;color:#aaa;line-height:1.5">
                ${opts.footerNote ?? "Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz."}
              </p>
              <p style="margin:6px 0 0;font-size:10px;color:#ccc">&copy; ${new Date().getFullYear()} ${SITE_BRAND_NAME}</p>
            </td></tr>
          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
