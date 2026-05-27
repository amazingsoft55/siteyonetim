/** E-posta adresi mi (doğrulama kodu gönderimi için). */
export function looksLikeEmail(value: string): boolean {
  const v = value.trim();
  return v.includes("@") && v.includes(".") && !v.startsWith("@");
}

export function normalizeLogin(value: string): string {
  return value.replace(/\s+/g, "").trim();
}

export function generateSixDigitCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function codeExpiresAt(minutes = 15): string {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

export function isCodeExpired(expiresAt: string): boolean {
  return Date.parse(expiresAt) < Date.now();
}
