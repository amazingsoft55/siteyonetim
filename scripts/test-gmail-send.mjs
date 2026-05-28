/** Yerel Gmail test — GMAIL_* ortam değişkenleri gerekli. */
const clientId = process.env.GMAIL_CLIENT_ID?.trim();
const clientSecret = process.env.GMAIL_CLIENT_SECRET?.trim();
const refreshToken = process.env.GMAIL_REFRESH_TOKEN?.trim();
const from = process.env.GMAIL_FROM?.trim() || "ccode4779@gmail.com";
const to = process.argv[2]?.trim();

if (!clientId || !clientSecret || !refreshToken) {
  console.error("GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET ve GMAIL_REFRESH_TOKEN gerekli.");
  process.exit(1);
}
if (!to) {
  console.error("Kullanım: node scripts/test-gmail-send.mjs alici@email.com");
  process.exit(1);
}

async function main() {
  console.log("1) Access token...");
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
    console.error("OAuth HATA:", JSON.stringify(tokenData, null, 2));
    process.exit(1);
  }
  console.log("   OK");

  const html = "<p>Site Yönetimi Gmail testi — ayarlar çalışıyor.</p>";
  const subject = "Test — Site Yönetimi";
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

  console.log(`2) Gönderim: ${from} → ${to}`);
  const sendRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });
  const sendData = await sendRes.text();
  if (!sendRes.ok) {
    console.error("Gmail API HATA:", sendData);
    process.exit(1);
  }
  console.log("   OK:", sendData);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
