/**
 * Google OAuth kodunu refresh token'a çevirir.
 * Kullanım: npm run gmail:exchange -- "KOD" veya "http://localhost/?code=..."
 */

import { GMAIL_OAUTH_REDIRECT_URI, extractOAuthCode } from "./gmail-oauth-shared.mjs";

const clientId = process.env.GMAIL_CLIENT_ID?.trim();
const clientSecret = process.env.GMAIL_CLIENT_SECRET?.trim();
const code = extractOAuthCode(process.argv[2] ?? "");

if (!clientId || !clientSecret) {
  console.error("GMAIL_CLIENT_ID ve GMAIL_CLIENT_SECRET gerekli.");
  process.exit(1);
}
if (!code) {
  console.error('Kullanım: npm run gmail:exchange -- "GOOGLE_KODU_VEYA_LOCALHOST_URL"');
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

const data = (await res.json()) as {
  refresh_token?: string;
  error?: string;
  error_description?: string;
};

if (!res.ok || !data.refresh_token) {
  console.error("Token alınamadı:", data.error_description || data.error || res.statusText);
  process.exit(1);
}

console.log("\nGMAIL_REFRESH_TOKEN:");
console.log(data.refresh_token);
console.log("\nCloudflare:");
console.log(`echo "${data.refresh_token}" | npx wrangler secret put GMAIL_REFRESH_TOKEN`);
