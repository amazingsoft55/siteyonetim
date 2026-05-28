/** Gmail API ile e-posta gönderimi (Cloudflare Workers uyumlu — yalnızca fetch). */

type SendResult = { ok: true } | { ok: false; error: string };

function gmailConfig() {
  const clientId = process.env.GMAIL_CLIENT_ID?.trim();
  const clientSecret = process.env.GMAIL_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN?.trim();
  const from =
    process.env.GMAIL_FROM?.trim() ||
    process.env.EMAIL_FROM?.trim()?.match(/<([^>]+)>/)?.[1] ||
    process.env.EMAIL_FROM?.trim() ||
    "ccode4779@gmail.com";

  if (!clientId || !clientSecret || !refreshToken) return null;
  return { clientId, clientSecret, refreshToken, from };
}

export function isGmailConfigured(): boolean {
  return gmailConfig() !== null;
}

function encodeSubjectUtf8(subject: string): string {
  const bytes = new TextEncoder().encode(subject);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  const b64 = btoa(binary);
  return `=?UTF-8?B?${b64}?=`;
}

function toBase64Url(raw: string): string {
  const bytes = new TextEncoder().encode(raw);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function formatFromAddress(email: string): string {
  const e = email.includes("@") ? email : "ccode4779@gmail.com";
  if (e.includes("<")) return e;
  return `Site Yönetimi <${e}>`;
}

async function getAccessToken(cfg: NonNullable<ReturnType<typeof gmailConfig>>): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      refresh_token: cfg.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => res.statusText);
    throw new Error(`Gmail OAuth hatası: ${t || res.status}`);
  }

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Gmail access token alınamadı.");
  return data.access_token;
}

/** HTML e-postayı Gmail API üzerinden gönderir. */
export async function sendViaGmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const cfg = gmailConfig();
  if (!cfg) {
    return { ok: false, error: "Gmail yapılandırması eksik (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN)." };
  }

  try {
    const token = await getAccessToken(cfg);
    const from = formatFromAddress(cfg.from);
    const replyTo = process.env.EMAIL_REPLY_TO?.trim();

    const headers = [
      `From: ${from}`,
      `To: ${input.to}`,
      `Subject: ${encodeSubjectUtf8(input.subject)}`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=UTF-8",
    ];
    if (replyTo && replyTo.includes("@")) {
      headers.push(`Reply-To: ${replyTo}`);
    }

    const mime = `${headers.join("\r\n")}\r\n\r\n${input.html}`;
    const raw = toBase64Url(mime);

    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => res.statusText);
      return { ok: false, error: t || `Gmail API HTTP ${res.status}` };
    }

    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
