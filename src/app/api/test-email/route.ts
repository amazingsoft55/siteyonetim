import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { sendBrandedEmail } from "@/lib/send-email";
import { buildBrandedEmailHtml } from "@/lib/email-template";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const to = "mustafakeskin2655@gmail.com";

  console.log("[test-email] Test email gönderiliyor:", to);
  console.log("[test-email] SMTP:", !!process.env.GMAIL_APP_PASSWORD?.trim());
  console.log("[test-email] OAuth:", !!(process.env.GMAIL_CLIENT_ID?.trim() && process.env.GMAIL_CLIENT_SECRET?.trim()));

  const result = await sendBrandedEmail({
    to,
    subject: "Test Email — Site Yönetimi",
    html: buildBrandedEmailHtml({
      title: "Test Başarılı!",
      intro: "Bu bir test emailidir. Eğer bu emaili alıyorsanız, email sistemi düzgün çalışıyor.",
      ctaHref: "https://siteyonetim.mustafakeskin2290.workers.dev",
      ctaLabel: "Siteye Git",
    }),
  });

  console.log("[test-email] Sonuç:", JSON.stringify(result));

  return NextResponse.json({
    result,
    config: {
      smtp: !!process.env.GMAIL_APP_PASSWORD?.trim(),
      oauth: !!(process.env.GMAIL_CLIENT_ID?.trim() && process.env.GMAIL_CLIENT_SECRET?.trim()),
      resend: !!process.env.RESEND_API_KEY?.trim(),
    },
  });
}
