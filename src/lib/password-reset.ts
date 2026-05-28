import { eq } from "drizzle-orm";
import type { PlatformDatabase } from "@/db/platform";
import { passwordResetTokens } from "@/db/schema";
import { sendPasswordResetEmail } from "@/lib/send-email";

export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Kullanıcı için tek kullanımlık sıfırlama tokeni oluşturup e-posta gönderir. */
export async function issuePasswordResetEmail(
  db: PlatformDatabase,
  user: { id: string; name: string; emailOrPhone: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!looksLikeEmail(user.emailOrPhone)) {
    return { ok: false, error: "Bu hesapta kayıtlı geçerli bir e-posta yok." };
  }

  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));

  const id = crypto.randomUUID();
  const token = [...crypto.getRandomValues(new Uint8Array(32))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await db.insert(passwordResetTokens).values({
    id,
    userId: user.id,
    token,
    expiresAt: expires,
  });

  return sendPasswordResetEmail(
    user.emailOrPhone.trim(),
    `/sifre-sifirla?t=${encodeURIComponent(token)}`,
    user.name,
  );
}
