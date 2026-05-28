/** Tam şifre sıfırlama maili testi — node scripts/test-password-reset-mail.mjs email@ornek.com */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const clientId = "1009271557525-8158q5ajcojeq9s18hu2corj3ajt01js.apps.googleusercontent.com";
const clientSecret = process.env.GMAIL_CLIENT_SECRET?.trim() || "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";
const refreshToken =
  process.env.GMAIL_REFRESH_TOKEN?.trim() ||
  "1//03Oagsrs7biBACgYIARAAGAMSNwF-L9IrBxjP-2LylLPKiPX_-mBlwQeRuHHVtkEjwRSKX6irmvDdVW9Ncczex6KfMXj_yuHR0pk";
const from = "ccode4779@gmail.com";
const siteUrl = "https://siteyonetim.mustafakeskin2290.workers.dev";
const to = process.argv[2]?.trim() || "mustafakeksinn@gmail.com";
const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
const resetUrl = `${siteUrl}/sifre-sifirla?t=${encodeURIComponent(token)}`;

const logoPath = join(root, "public", "logo.png");
let logoDataUri = "";
try {
  logoDataUri = `data:image/png;base64,${readFileSync(logoPath).toString("base64")}`;
} catch {
  logoDataUri = "";
}

const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f4f4f5;padding:24px">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:32px">
${logoDataUri ? `<img src="${logoDataUri}" alt="Logo" width="64" height="64" style="display:block;margin:0 auto 16px"/>` : ""}
<h1 style="text-align:center;color:#18181b">Şifre sıfırlama</h1>
<p style="color:#52525b">Hesabınız için şifre sıfırlama isteği alındı.</p>
<p style="text-align:center;margin:24px 0">
<a href="${resetUrl}" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold">Yeni şifre belirle</a>
</p>
<p style="font-size:12px;color:#a1a1aa;text-align:center">Bağlantı yaklaşık 1 saat geçerlidir.</p>
</div></body></html>`;

async function main() {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    console.error("OAuth HATA:", tokenData);
    process.exit(1);
  }

  const subject = "Şifre sıfırlama — Site Yönetimi";
  const mime = [
    `From: Site Yönetimi <${from}>`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "",
    html,
  ].join("\r\n");

  const raw = Buffer.from(mime).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const sendRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });
  const body = await sendRes.text();
  if (!sendRes.ok) {
    console.error("Gönderim HATA:", body);
    process.exit(1);
  }
  console.log(`OK — şifre sıfırlama maili gönderildi: ${to}`);
  console.log(`Test bağlantısı (DB token yok, sadece örnek): ${resetUrl}`);
}

main();
