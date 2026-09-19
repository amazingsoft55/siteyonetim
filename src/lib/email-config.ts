import { isGmailConfigured } from "@/lib/gmail-send";

export type EmailProviderStatus = {
  configured: boolean;
  provider: "gmail" | "gmail_smtp" | "resend" | "none";
  missing: string[];
};

/** Resend veya Gmail yapılandırılmış mı? */
export function getEmailProviderStatus(): EmailProviderStatus {
  if (process.env.RESEND_API_KEY?.trim()) {
    return { configured: true, provider: "resend", missing: [] };
  }

  if (process.env.GMAIL_APP_PASSWORD?.trim()) {
    return { configured: true, provider: "gmail_smtp", missing: [] };
  }

  if (isGmailConfigured()) {
    return { configured: true, provider: "gmail", missing: [] };
  }

  const missing: string[] = [];
  if (!process.env.RESEND_API_KEY?.trim()) missing.push("RESEND_API_KEY");

  return { configured: false, provider: "none", missing };
}

export function isEmailConfigured(): boolean {
  return getEmailProviderStatus().configured;
}

export function emailNotConfiguredMessage(): string {
  return "E-posta servisi yapılandırılmamış. Lütfen RESEND_API_KEY ortam değişkenini tanımlayın.";
}
