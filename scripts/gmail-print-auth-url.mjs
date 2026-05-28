/**
 * Gmail OAuth bağlantı adresini yazdırır (refresh token almadan önce tarayıcıda açın).
 * Kullanım:
 *   set GMAIL_CLIENT_ID=....apps.googleusercontent.com
 *   node scripts/gmail-print-auth-url.mjs
 */

const clientId = process.env.GMAIL_CLIENT_ID?.trim() || process.argv[2]?.trim();

if (!clientId) {
  console.error("GMAIL_CLIENT_ID ortam değişkeni veya komut satırı argümanı gerekli.");
  process.exit(1);
}

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
    response_type: "code",
    scope: "https://www.googleapis.com/auth/gmail.send",
    access_type: "offline",
    prompt: "consent",
  });

console.log("\n1) Bu adresi tarayıcıda açın ve ccode4779@gmail.com ile giriş yapın:\n");
console.log(authUrl);
console.log("\n2) Google'ın verdiği kodu alın.");
console.log("3) GMAIL_CLIENT_SECRET ile birlikte: npm run gmail:setup\n");
