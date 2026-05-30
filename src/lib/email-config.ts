import { isGmailConfigured } from "@/lib/gmail-send";

export type EmailProviderStatus = {
  configured: boolean;
  provider: "gmail" | "gmail_smtp" | "resend" | "none";
  missing: string[];
};

/** Gmail (OAuth), Gmail SMTP veya Resend yapılandırılmış mı? */
export function getEmailProviderStatus(): EmailProviderStatus {
  if (process.env.GMAIL_APP_PASSWORD?.trim()) {
    return { configured: true, provider: "gmail_smtp", missing: [] };
  }

  if (isGmailConfigured()) {
    return { configured: true, provider: "gmail", missing: [] };
  }

  const missing: string[] = [];
  if (!process.env.GMAIL_CLIENT_ID?.trim()) missing.push("GMAIL_CLIENT_ID");
  if (!process.env.GMAIL_CLIENT_SECRET?.trim()) missing.push("GMAIL_CLIENT_SECRET");
  if (!process.env.GMAIL_REFRESH_TOKEN?.trim()) missing.push("GMAIL_REFRESH_TOKEN");

  if (process.env.RESEND_API_KEY?.trim()) {
    return { configured: true, provider: "resend", missing: [] };
  }

  missing.push("RESEND_API_KEY (veya Gmail SMTP/OAuth değişkenleri)");
  return { configured: false, provider: "none", missing };
}

export function isEmailConfigured(): boolean {
  return getEmailProviderStatus().configured;
}

export function emailNotConfiguredMessage(): string {
  return "E-posta servisi yapılandırılmamış. Cloudflare Workers ortam değişkenlerine GMAIL_APP_PASSWORD ve GMAIL_USER ekleyin.";
}
