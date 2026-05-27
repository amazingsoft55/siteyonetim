export type ClientPlatform = "ios" | "android" | "desktop" | "unknown";

export function detectClientPlatform(ua: string, maxTouchPoints = 0): ClientPlatform {
  const ios =
    /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && maxTouchPoints > 1);
  if (ios) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Windows|Macintosh|Linux/i.test(ua)) return "desktop";
  return "unknown";
}

/** iOS’ta yalnızca Safari tam PWA kurulumunu destekler. */
export function isIosSafari(ua: string): boolean {
  const ios = detectClientPlatform(ua) === "ios";
  if (!ios) return false;
  return /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(ua);
}
