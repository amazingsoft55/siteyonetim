/**
 * Gmail OAuth bağlantı adresini yazdırır.
 * Kullanım: node scripts/gmail-print-auth-url.mjs [CLIENT_ID]
 */

import { buildGmailAuthUrl } from "./gmail-oauth-shared.mjs";

const clientId = process.env.GMAIL_CLIENT_ID?.trim() || process.argv[2]?.trim();

if (!clientId) {
  console.error("GMAIL_CLIENT_ID ortam değişkeni veya komut satırı argümanı gerekli.");
  process.exit(1);
}

console.log("\n1) Bu adresi tarayıcıda açın ve **ccode4779@gmail.com** ile giriş yapın:\n");
console.log(buildGmailAuthUrl(clientId));
console.log("\n2) Yönlendirme http://localhost olacak — adres çubuğundaki code=... değerini kopyalayın.");
console.log("3) npm run gmail:exchange -- \"KOD_VEYA_URL\"\n");
