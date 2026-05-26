import { NextResponse } from "next/server";
import { and, count, eq, gte } from "drizzle-orm";

import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import { platformPublicContact } from "@/db/schema";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Body = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  subject?: unknown;
  body?: unknown;
  /** "iletisim" | "destek" */
  source?: unknown;
  /** Bot tuzak — boş kalmalı */
  company?: unknown;
};

function sanitize(s: unknown, max: number): string {
  if (typeof s !== "string") return "";
  return s.trim().slice(0, max);
}

export async function POST(request: Request) {
  let raw: Body;
  try {
    raw = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  if (typeof raw.company === "string" && raw.company.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = sanitize(raw.name, 160);
  const email = sanitize(raw.email, 200).toLowerCase();
  const phone = sanitize(raw.phone, 48);
  const subject = sanitize(raw.subject, 220);
  const body = sanitize(raw.body, 8000);
  const srcRaw = sanitize(raw.source, 32).toLowerCase();
  const source = srcRaw === "destek" ? "destek" : "iletisim";

  if (name.length < 2) {
    return NextResponse.json({ error: "Geçerli bir ad soyad girin." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Geçerli bir e-posta girin." }, { status: 400 });
  }
  if (subject.length < 3) {
    return NextResponse.json({ error: "Konu başlığı çok kısa." }, { status: 400 });
  }
  if (body.length < 10) {
    return NextResponse.json({ error: "Mesajınız en az birkaç cümle olmalıdır." }, { status: 400 });
  }

  const d = acquireDatabase();
  if (!d.ok) return databaseUnavailable();

  try {
    const sinceIso = new Date(Date.now() - 3600_000).toISOString();
    const [row] = await d.db
      .select({ c: count() })
      .from(platformPublicContact)
      .where(
        and(eq(platformPublicContact.email, email), gte(platformPublicContact.createdAt, sinceIso)),
      );
    if ((row?.c ?? 0) >= 5) {
      return NextResponse.json(
        { error: "Çok sık gönderim. Lütfen bir süre sonra tekrar deneyin." },
        { status: 429 },
      );
    }
  } catch {
    /* hız limiti başarısız olursa yine de kaydı dene */
  }

  const id =
    typeof crypto !== "undefined" && crypto.randomUUID ?
      crypto.randomUUID()
    : `pc-${Date.now()}`;

  try {
    await d.db.insert(platformPublicContact).values({
      id,
      source,
      name,
      email,
      phone: phone || null,
      subject,
      body,
      status: "OPEN",
      superAdminReply: null,
    });
  } catch (e) {
    return jsonSqlError(e, "Mesaj kaydedilemedi. Şema güncelliğini doğrulayın (platform_public_contact).");
  }

  return NextResponse.json({
    ok: true,
    id,
    message: "Mesajınız alındı. Ekibimiz en kısa sürede size dönüş yapacaktır.",
  });
}
