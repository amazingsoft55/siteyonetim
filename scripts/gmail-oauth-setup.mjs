/**
 * Gmail OAuth refresh token alma (tek seferlik, yerel çalıştırın).
 *
 * Ön koşul — Google Cloud Console (console.cloud.google.com):
 * 1. Proje oluşturun
 * 2. APIs & Services → Enable APIs → "Gmail API" etkinleştirin
 * 3. OAuth consent screen → External → test user olarak Gmail adresinizi ekleyin
 * 4. Credentials → Create OAuth client ID → Desktop app
 * 5. .env veya ortamda GMAIL_CLIENT_ID ve GMAIL_CLIENT_SECRET tanımlayın
 *
 * Çalıştırma:
 *   set GMAIL_CLIENT_ID=...
 *   set GMAIL_CLIENT_SECRET=...
 *   node scripts/gmail-oauth-setup.mjs
 */

const clientId = process.env.GMAIL_CLIENT_ID?.trim();
const clientSecret = process.env.GMAIL_CLIENT_SECRET?.trim();

if (!clientId || !clientSecret) {
  console.error("GMAIL_CLIENT_ID ve GMAIL_CLIENT_SECRET ortam değişkenlerini ayarlayın.");
  process.exit(1);
}

const redirectUri = "urn:ietf:wg:oauth:2.0:oob";
const scope = "https://www.googleapis.com/auth/gmail.send";
const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    access_type: "offline",
    prompt: "consent",
  });

console.log("\n1) Bu adresi tarayıcıda açın ve ccode4779@gmail.com ile giriş yapın:\n");
console.log(authUrl);
console.log("\n2) Google size bir kod verecek. Kodu aşağıya yapıştırın.\n");

const readline = await import("node:readline");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("Google doğrulama kodu: ", async (code) => {
  rl.close();
  const trimmed = code.trim();
  if (!trimmed) {
    console.error("Kod boş.");
    process.exit(1);
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: trimmed,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = (await res.json()) as { refresh_token?: string; error?: string; error_description?: string };

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
