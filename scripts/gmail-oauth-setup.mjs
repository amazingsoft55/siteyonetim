/**
 * Gmail OAuth refresh token alma (tek seferlik, yerel çalıştırın).
 *
 * Ön koşul — Google Cloud Console:
 * 1. Gmail API etkin
 * 2. OAuth consent screen → Test users: ccode4779@gmail.com (mail gönderen hesap)
 * 3. Credentials → Desktop app (redirect: http://localhost)
 *
 * Çalıştırma:
 *   set GMAIL_CLIENT_ID=...
 *   set GMAIL_CLIENT_SECRET=...
 *   npm run gmail:setup
 */

import {
  GMAIL_OAUTH_REDIRECT_URI,
  buildGmailAuthUrl,
  extractOAuthCode,
} from "./gmail-oauth-shared.mjs";

const clientId = process.env.GMAIL_CLIENT_ID?.trim();
const clientSecret = process.env.GMAIL_CLIENT_SECRET?.trim();

if (!clientId || !clientSecret) {
  console.error("GMAIL_CLIENT_ID ve GMAIL_CLIENT_SECRET ortam değişkenlerini ayarlayın.");
  process.exit(1);
}

const authUrl = buildGmailAuthUrl(clientId);

console.log("\n1) Bu adresi tarayıcıda açın ve **ccode4779@gmail.com** ile giriş yapın:\n");
console.log(authUrl);
console.log(
  "\n2) Giriş sonrası tarayıcı http://localhost adresine yönlenecek (sayfa açılmayabilir).",
);
console.log("   Adres çubuğundaki code=... değerini veya tüm URL'yi kopyalayın.\n");

const readline = await import("node:readline");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("Google kodu veya localhost URL: ", async (raw) => {
  rl.close();
  const code = extractOAuthCode(raw);
  if (!code) {
    console.error("Kod boş.");
    process.exit(1);
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: GMAIL_OAUTH_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.refresh_token) {
    console.error("Token alınamadı:", data.error_description || data.error || res.statusText);
    process.exit(1);
  }

  console.log("\nCloudflare Workers ortam değişkenlerine ekleyin:\n");
  console.log(`GMAIL_CLIENT_ID=${clientId}`);
  console.log(`GMAIL_CLIENT_SECRET=${clientSecret}`);
  console.log(`GMAIL_REFRESH_TOKEN=${data.refresh_token}`);
  console.log("GMAIL_FROM=ccode4779@gmail.com");
  console.log("\nTamamlandı.");
});
