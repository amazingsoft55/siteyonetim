import { SITE_BRAND_NAME, SITE_LOGO_PATH } from "@/lib/brand";
import { getPublicSiteUrl } from "@/lib/site-url";

export type BrandedEmailOptions = {
  title: string;
  intro: string;
  bodyHtml?: string;
  ctaHref?: string;
  ctaLabel?: string;
  footerNote?: string;
};

/** Site logosu ve marka ile HTML e-posta gövdesi. */
export function buildBrandedEmailHtml(opts: BrandedEmailOptions): string {
  const base = getPublicSiteUrl().replace(/\/$/, "");
  const logoUrl = `${base}${SITE_LOGO_PATH}`;
  const cta =
    opts.ctaHref && opts.ctaLabel ?
      `<p style="margin:28px 0 0;text-align:center">
        <a href="${opts.ctaHref}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px">${opts.ctaLabel}</a>
      </p>
      <p style="margin:16px 0 0;font-size:12px;color:#71717a;word-break:break-all;text-align:center">${opts.ctaHref}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06)">
        <tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 24px;text-align:center">
          <img src="${logoUrl}" alt="${SITE_BRAND_NAME}" width="72" height="72" style="display:block;margin:0 auto 12px;border-radius:16px;background:#fff;padding:4px" />
          <p style="margin:0;color:#fff;font-size:18px;font-weight:800">${SITE_BRAND_NAME}</p>
        </td></tr>
        <tr><td style="padding:28px 24px 32px">
          <h1 style="margin:0 0 12px;font-size:20px;color:#18181b">${opts.title}</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46">${opts.intro}</p>
          ${opts.bodyHtml ?? ""}
          ${cta}
          <p style="margin:28px 0 0;font-size:12px;line-height:1.5;color:#a1a1aa;border-top:1px solid #e4e4e7;padding-top:16px">
            ${opts.footerNote ?? "Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz."}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
