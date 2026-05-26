/** API route json gövdelerinden güvenli okuma */

/** Kısa hata özeti (`error` + varsa `code` + ilk satır `detail`) — Süper-admin teşhisi için. */
export function formatApiError(payload: unknown, fallback: string): string {
  if (typeof payload !== "object" || payload === null) return fallback;
  const o = payload as Record<string, unknown>;
  const err = typeof o.error === "string" && o.error.trim() ? o.error : fallback;
  const code = typeof o.code === "string" ? o.code.trim() : "";
  const detail = typeof o.detail === "string" ? o.detail.trim() : "";
  const segments = code ? `${err} [${code}]` : err;
  if (!detail) return segments;
  const short = detail.length > 400 ? `${detail.slice(0, 400)}…` : detail;
  return `${segments} — ${short}`;
}

export function readJsonError(payload: unknown, fallback: string): string {
  /* Geriye uyum: artık ayrıntı da ekleniyor */
  return formatApiError(payload, fallback);
}

export function readJsonNotice(payload: unknown): string | undefined {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "notice" in payload &&
    typeof (payload as { notice: unknown }).notice === "string"
  ) {
    return (payload as { notice: string }).notice;
  }
  return undefined;
}
