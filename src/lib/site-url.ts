/**
 * Kanonik ortak URL — SEO için metadataBase ve sitemap robots.
 * Üretimde `NEXT_PUBLIC_SITE_URL` olarak tam kök adresi verin (https://...)
 */
export function getPublicSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv && fromEnv.startsWith("http")) return fromEnv;
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return vercel.startsWith("http") ? vercel.replace(/\/$/, "") : `https://${vercel}`;
  return "http://localhost:3000";
}
