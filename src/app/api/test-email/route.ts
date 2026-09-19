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

  const result = await sendBrandedEmail({
    to,
    subject: "Test Email — Site Yönetimi",
    html: buildBrandedEmailHtml({
      title: "Test Başarılı!",
      intro: "Bu bir test e-postasıdır. Eğer bu iletiyi görüyorsanız, Resend e-posta sistemi başarıyla çalışıyor.",
      ctaHref: "https://siteyonetim.keskindev.com",
      ctaLabel: "Siteye Git",
    }),
  });

  return NextResponse.json({
    result,
    resendConfigured: !!process.env.RESEND_API_KEY?.trim(),
  });
}
