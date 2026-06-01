import { looksLikeEmail } from "./password-reset";

export { looksLikeEmail };

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
