/**
 * OAuth kodunu http://localhost üzerinden otomatik yakalar, refresh token üretir.
 * Yönetici olarak çalıştırmanız gerekebilir (port 80).
 *
 *   node scripts/gmail-oauth-server.mjs
 */

import { createServer } from "node:http";
import { exec } from "node:child_process";
import {
  GMAIL_OAUTH_REDIRECT_URI,
  buildGmailAuthUrl,
  extractOAuthCode,
} from "./gmail-oauth-shared.mjs";

const clientId = process.env.GMAIL_CLIENT_ID?.trim();
const clientSecret = process.env.GMAIL_CLIENT_SECRET?.trim();

if (!clientId || !clientSecret) {
  console.error("GMAIL_CLIENT_ID ve GMAIL_CLIENT_SECRET ortam değişkenlerini ayarlayın.");
  console.error("Örnek: $env:GMAIL_CLIENT_ID=\"....apps.googleusercontent.com\"");
  process.exit(1);
}

const authUrl = buildGmailAuthUrl(clientId);

function openBrowser(url) {
  const cmd =
    process.platform === "win32" ? `start "" "${url}"`
    : process.platform === "darwin" ? `open "${url}"`
    : `xdg-open "${url}"`;
  exec(cmd, () => {});
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", GMAIL_OAUTH_REDIRECT_URI);
  const code = extractOAuthCode(url.search ? `?${url.search.slice(1)}` : "");

  if (!code) {
    res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>Kod bulunamadı</h1><p>Tarayıcıyı kapatıp tekrar deneyin.</p>");
    return;
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
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
    const data = await tokenRes.json();

    if (!tokenRes.ok || !data.refresh_token) {
      res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        `<h1>Token alınamadı</h1><pre>${JSON.stringify(data, null, 2)}</pre>`,
      );
      console.error("HATA:", data);
      server.close();
      process.exit(1);
    }

    console.log("\n=== GMAIL_REFRESH_TOKEN (Cloudflare Secret) ===\n");
    console.log(data.refresh_token);
    console.log("\nWrangler:\n");
    console.log(`echo "${data.refresh_token}" | npx wrangler secret put GMAIL_REFRESH_TOKEN`);

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      "<h1>Tamam!</h1><p>Refresh token terminalde yazdırıldı. Bu sekmeyi kapatabilirsiniz.</p>",
    );
    setTimeout(() => {
      server.close();
      process.exit(0);
    }, 500);
  } catch (e) {
    res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<h1>Hata</h1><pre>${String(e)}</pre>`);
    server.close();
    process.exit(1);
  }
});

server.listen(80, "127.0.0.1", () => {
  console.log("Dinleniyor: http://localhost (port 80)");
  console.log("\nTarayıcıda açın (ccode4779@gmail.com):\n");
  console.log(authUrl);
  console.log("\n");
  openBrowser(authUrl);
});

server.on("error", (err) => {
  console.error("Port 80 açılamadı:", err.message);
  console.error("PowerShell'i Yönetici olarak açıp tekrar deneyin:");
  console.error("  node scripts/gmail-oauth-server.mjs");
  process.exit(1);
});
