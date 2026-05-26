/** API route json gövdelerinden güvenli okuma */

export function readJsonError(payload: unknown, fallback: string): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof (payload as { error: unknown }).error === "string"
  ) {
    return (payload as { error: string }).error;
  }
  return fallback;
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
