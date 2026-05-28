import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { users } from "@/db/schema";
import { emailNotConfiguredMessage, isEmailConfigured } from "@/lib/email-config";
import { issuePasswordResetEmail, looksLikeEmail } from "@/lib/password-reset";

type Body = { email?: unknown };

export async function POST(request: Request) {
  let raw: Body;
  try {
    raw = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

  const email = typeof raw.email === "string" ? raw.email.replace(/\s+/g, "").trim() : "";

  if (!isEmailConfigured()) {
    return NextResponse.json({ error: emailNotConfiguredMessage() }, { status: 503 });
  }

  const generic = NextResponse.json({
    ok: true,
    message:
      "İşlem tamamlanabildiysa e‑posta adresinize bir sıfırlama bağlantısı gönderdik. Gelen kutunuzu kontrol edin.",
  });

  if (!email || !looksLikeEmail(email)) {
    await new Promise((r) => setTimeout(r, 400));
    return generic;
  }

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  try {
    const rows = await d.db.select().from(users).where(eq(users.emailOrPhone, email)).limit(1);
    const u = rows[0];

    await new Promise((r) => setTimeout(r, 400));

    if (!u) {
      return generic;
    }

    const send = await issuePasswordResetEmail(d.db, u);
    if (!send.ok && process.env.NODE_ENV !== "production") {
      console.warn("[forgot-password] e-posta gönderilemedi:", send.error);
    }

    return generic;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "İstek işlenemedi.", detail: msg }, { status: 500 });
  }
}
