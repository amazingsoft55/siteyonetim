import { getPublicSiteUrl } from "@/lib/site-url";

type SendResult = { ok: true } | { ok: false; error: string };

/**
 * Resend HTTP API (Edge uyumlu). Anahtar yoksa başarısız döner; çağıran genel mesaj verir.
 * @see https://resend.com/docs/api-reference/emails/send-email
 */
export async function sendPasswordResetEmail(to: string, resetPathWithToken: string): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    return { ok: false, error: "RESEND_API_KEY tanımlı değil." };
  }

  const from = process.env.EMAIL_FROM?.trim() || "onboarding@resend.dev";
  const base = getPublicSiteUrl().replace(/\/$/, "");
  const path = resetPathWithToken.startsWith("/") ? resetPathWithToken : `/${resetPathWithToken}`;
  const url = `${base}${path}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Şifre sıfırlama bağlantısı",
      html: `<p>Merhaba,</p><p>Süper yönetici hesabınız için şifre sıfırlama isteği alındı. Aşağıdaki bağlantıyı kullanın (yaklaşık 1 saat geçerlidir):</p><p><a href="${url}">${url}</a></p><p>Bu isteği siz yapmadıysanız bu e-postayı yok sayın.</p>`,
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => res.statusText);
    return { ok: false, error: t || `HTTP ${res.status}` };
  }
  return { ok: true };
}

/** Süper yönetici hesap değişikliği doğrulama kodu */
export async function sendAccountVerificationEmail(to: string, code: string): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    return { ok: false, error: "RESEND_API_KEY tanımlı değil." };
  }

  const from = process.env.EMAIL_FROM?.trim() || "onboarding@resend.dev";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Hesap değişikliği doğrulama kodu",
      html: `<p>Merhaba,</p><p>Süper yönetici hesabınızda e-posta veya şifre değişikliği için doğrulama kodunuz:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</p><p>Bu kod yaklaşık 15 dakika geçerlidir. İsteği siz yapmadıysanız bu e-postayı yok sayın.</p>`,
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => res.statusText);
    return { ok: false, error: t || `HTTP ${res.status}` };
  }
  return { ok: true };
}
