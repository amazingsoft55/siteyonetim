/**
 * Kanonik ortak URL — SEO, e-posta bağlantıları ve yönlendirmeler için kök adres.
 * İstek varsa (request) gelen domain üzerinden dinamik çözülür.
 */
export function getPublicSiteUrl(request?: Request): string {
  if (request) {
    const origin = request.headers.get("origin");
    if (origin && origin.startsWith("http")) return origin.replace(/\/$/, "");
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") || "https";
    if (host) return `${proto}://${host}`.replace(/\/$/, "");
    try {
      const u = new URL(request.url);
      if (u.origin && !u.origin.includes("localhost:3000")) return u.origin;
    } catch {}
  }
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv && fromEnv.startsWith("http")) return fromEnv;
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return vercel.startsWith("http") ? vercel.replace(/\/$/, "") : `https://${vercel}`;
  return "https://siteyonetim.keskindev.com";
}
