export type EmailProviderStatus = {
  configured: boolean;
  provider: "resend" | "none";
  missing: string[];
};

/** Resend e-posta servisi yapılandırılmış mı? */
export function getEmailProviderStatus(): EmailProviderStatus {
  if (process.env.RESEND_API_KEY?.trim()) {
    return { configured: true, provider: "resend", missing: [] };
  }

  return { configured: false, provider: "none", missing: ["RESEND_API_KEY"] };
}

export function isEmailConfigured(): boolean {
  return getEmailProviderStatus().configured;
}

export function emailNotConfiguredMessage(): string {
  return "E-posta servisi yapılandırılmamış. Lütfen RESEND_API_KEY ortam değişkenini tanımlayın.";
}
