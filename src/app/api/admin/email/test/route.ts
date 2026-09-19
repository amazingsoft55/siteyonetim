import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { sendBrandedEmail, emailFromAddress } from "@/lib/send-email";
import { getPublicSiteUrl } from "@/lib/site-url";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
  }

  let body: { to?: string; type?: "default" | "support" };
  try {
    body = (await request.json()) as { to?: string; type?: "default" | "support" };
  } catch {
    body = {};
  }

  const to = body.to?.trim() || "";
  const type = body.type === "support" ? "support" : "default";

  if (!to || !to.includes("@")) {
    return NextResponse.json(
      { error: "Lütfen test e-postasının gönderileceği geçerli bir e-posta adresi belirtin." },
      { status: 400 }
    );
  }

  const senderLabel = type === "support" ? "Destek Kanalı (destek@...)" : "Bildirim Kanalı (bildirim@...)";
  const fromAddress = emailFromAddress(type);
  const base = getPublicSiteUrl(request);

  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #0f172a; margin: 0 0 6px;">E-posta Bağlantı Testi Başarılı! 🎉</h2>
        <p style="color: #64748b; font-size: 14px; margin: 0;">Bu test mesajı e-posta altyapınızın sorunsuz çalıştığını doğrular.</p>
      </div>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; font-size: 13px; color: #334155; line-height: 1.6;">
        <p style="margin: 0 0 6px;"><strong>Kanal:</strong> ${senderLabel}</p>
        <p style="margin: 0 0 6px;"><strong>Gönderen (From):</strong> ${fromAddress}</p>
        <p style="margin: 0 0 6px;"><strong>Alıcı (To):</strong> ${to}</p>
        <p style="margin: 0;"><strong>Tarih:</strong> ${new Date().toLocaleString("tr-TR")}</p>
      </div>
      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 20px;">
        Site Yönetim Portalı &bull; <a href="${base}" style="color: #4f46e5; text-decoration: none;">siteyonetim.keskindev.com</a>
      </p>
    </div>
  `;

  const result = await sendBrandedEmail({
    to,
    subject: `✅ E-posta Testi: ${senderLabel} — Site Yönetimi`,
    html,
    fromType: type,
  });

  if (!result.ok) {
    return NextResponse.json({
      ok: false,
      error: `E-posta gönderilemedi: ${result.error}`,
      channel: senderLabel,
      from: fromAddress,
    }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    message: `Test e-postası ${to} adresine başarıyla iletildi! (${senderLabel})`,
    from: fromAddress,
  });
}
