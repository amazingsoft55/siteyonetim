import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { users, passwordResetTokens } from "@/db/schema";
import { sendPasswordResetEmail } from "@/lib/send-email";

export const runtime = "nodejs";

type Body = { email?: unknown };

function looksLikeEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(request: Request) {
  let raw: Body;
  try {
    raw = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

  const email =
    typeof raw.email === "string" ? raw.email.replace(/\s+/g, "").trim() : "";

  /** Her zaman aynı mesaj (hesap sızdırmaz). */
  const generic = NextResponse.json({
    ok: true,
    message:
      "İşlem tamamlanabildiysa e‑posta adresinize bir sıfırlama bağlantısı gönderdik. Gelen kutunuzu kontrol edin.",
  });

  if (!email || !looksLikeEmail(email)) {
    await new Promise((r) => setTimeout(r, 400));
    return generic;
  }

  const d = acquireDatabase();
  if (!d.ok) return databaseUnavailable();

  try {
    const rows = await d.db
      .select()
      .from(users)
      .where(and(eq(users.emailOrPhone, email), eq(users.role, "SUPER_ADMIN")))
      .limit(1);

    const u = rows[0];

    await new Promise((r) => setTimeout(r, 400));

    if (!u) {
      return generic;
    }

    await d.db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, u.id));

    const id = crypto.randomUUID();
    const token = [...crypto.getRandomValues(new Uint8Array(32))]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await d.db.insert(passwordResetTokens).values({
      id,
      userId: u.id,
      token,
      expiresAt: expires,
    });

    const send = await sendPasswordResetEmail(email, `/sifre-sifirla?t=${encodeURIComponent(token)}`);

    if (!send.ok && process.env.NODE_ENV !== "production") {
      console.warn("[forgot-password] e-posta gönderilemedi:", send.error);
    }

    /* Yapılandırma eksikse yine genel mesaj; üretimde logdan ayırt edilir. */
    return generic;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "İstek işlenemedi.", detail: msg }, { status: 500 });
  }
}
