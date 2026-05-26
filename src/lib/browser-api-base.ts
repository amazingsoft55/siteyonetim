/**
 * Tarayıcıda API istekleri: aynı origin’de göreli yol; mobil / farklı host için
 * NEXT_PUBLIC_SITE_URL veya localStorage `siteyonetim_api_base` kullanılır.
 */
const LS_KEY = "siteyonetim_api_base";

export function getStoredApiBase(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(LS_KEY)?.trim().replace(/\/$/, "") ?? "";
  } catch {
    return "";
  }
}

export function setStoredApiBase(value: string): void {
  if (typeof window === "undefined") return;
  try {
    const v = value.trim().replace(/\/$/, "");
    if (!v) window.localStorage.removeItem(LS_KEY);
    else window.localStorage.setItem(LS_KEY, v);
  } catch {
    /* private mode */
  }
}

/** Boş string = göreli istek (önerilen: aynı Workers domain’i). */
export function getBrowserApiBase(): string {
  const stored = getStoredApiBase();
  const env =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL?.trim()) || "";
  const base = (stored || env).replace(/\/$/, "");
  return base;
}

export function browserApiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const b = getBrowserApiBase();
  return b ? `${b}${p}` : p;
}
