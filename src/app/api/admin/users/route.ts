import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import { deleteUserCascade } from "@/lib/user-cascade-delete";
import { users } from "@/db/schema";
import { createNotification } from "@/lib/notify";
import { sendBrandedEmail } from "@/lib/send-email";
import { buildBrandedEmailHtml } from "@/lib/email-template";
import { looksLikeEmail } from "@/lib/password-reset";

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

const publicUserColumns = {
  id: users.id,
  name: users.name,
  emailOrPhone: users.emailOrPhone,
  role: users.role,
  siteId: users.siteId,
  apartmentNo: users.apartmentNo,
  createdAt: users.createdAt,
};

const SITE_ROLES = ["ADMIN", "USER"] as const;

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN" || !session.siteId) return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  try {
    const list = await d.db
      .select(publicUserColumns)
      .from(users)
      .where(and(eq(users.siteId, session.siteId), inArray(users.role, [...SITE_ROLES])));
    return NextResponse.json(list);
  } catch (e) {
    return jsonSqlError(e, "Liste alınamadı.");
  }
}

type Body = {
  name?: unknown;
  emailOrPhone?: unknown;
  password?: unknown;
  apartmentNo?: unknown;
  role?: unknown;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN" || !session.siteId) return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  let raw: Body;
  try {
    raw = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const emailOrPhone =
    typeof raw.emailOrPhone === "string" ? raw.emailOrPhone.replace(/\s+/g, "").trim() : "";
  const password = typeof raw.password === "string" ? raw.password : "";
  const role = raw.role === "ADMIN" ? "ADMIN" : "USER";
  const apartmentNo =
    typeof raw.apartmentNo === "string" && raw.apartmentNo.trim().length > 0 ?
      raw.apartmentNo.trim()
    : undefined;

  if (!name || !emailOrPhone || !password) {
    return NextResponse.json(
      { error: "Ad, oturum (e‑posta/telefon) ve şifre zorunludur." },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Şifre en az 6 karakter olmalı." }, { status: 400 });
  }

  const dup = await d.db.select().from(users).where(eq(users.emailOrPhone, emailOrPhone)).limit(1);
  if (dup.length) {
    return NextResponse.json({ error: "Bu oturum adı başka kullanıcıda kullanılıyor." }, { status: 409 });
  }

  const id =
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `u-${Date.now()}`;
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await d.db.insert(users).values({
      id,
      name,
      emailOrPhone,
      passwordHash,
      role,
      siteId: session.siteId,
      apartmentNo: role === "USER" ? apartmentNo : null,
    });

    const row = await d.db.select(publicUserColumns).from(users).where(eq(users.id, id)).limit(1);

    // Yeni kullanıcıya hoşgeldin bildirimi gönder
    const siteName = session.siteId
      ? (await d.db.select({ name: users.name }).from(users).where(eq(users.id, session.id)).limit(1))[0]?.name ?? "Site yönetimi"
      : "Site yönetimi";
    createNotification(d.db, {
      userId: id,
      title: "Hoş Geldiniz!",
      body: `${siteName} sitesine başarıyla eklendiniz. Giriş bilgilerinizle panele erişebilirsiniz.`,
      type: "WELCOME",
      href: role === "ADMIN" ? "/admin" : "/dashboard",
    });

    // Kullanıcıya hoşgeldin emaili gönder
    if (looksLikeEmail(emailOrPhone)) {
      const base = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000").replace(/\/$/, "");
      const hasGmailSmtp = !!process.env.GMAIL_APP_PASSWORD?.trim();
      const hasGmailOAuth = !!(process.env.GMAIL_CLIENT_ID?.trim() && process.env.GMAIL_CLIENT_SECRET?.trim() && process.env.GMAIL_REFRESH_TOKEN?.trim());
      const hasResend = !!process.env.RESEND_API_KEY?.trim();
      console.log(`[admin/users] Email provider durumu: SMTP=${hasGmailSmtp}, OAuth=${hasGmailOAuth}, Resend=${hasResend}`);

      const emailResult = await sendBrandedEmail({
        to: emailOrPhone,
        subject: `Hoş Geldiniz — ${siteName}`,
        html: buildBrandedEmailHtml({
          title: "Hoş Geldiniz!",
          intro: `Merhaba ${name}, ${siteName} sitesine başarıyla eklendiniz.`,
          bodyHtml: `
            <p style="margin:0 0 8px;font-size:14px;color:#3f3f46">Giriş bilgileriniz:</p>
            <p style="margin:0 0 4px;font-size:14px;color:#3f3f46"><strong>Kullanıcı adı:</strong> ${emailOrPhone}</p>
            <p style="margin:0 0 16px;font-size:14px;color:#3f3f46"><strong>Şifre:</strong> (yönetici tarafından belirlendi)</p>
            ${role === "USER" && apartmentNo ? `<p style="margin:0 0 16px;font-size:14px;color:#3f3f46"><strong>Daire:</strong> ${apartmentNo}</p>` : ""}
          `,
          ctaHref: `${base}/login`,
          ctaLabel: "Panele Giriş Yap",
          footerNote: "Bu hesap site yönetimi tarafından oluşturulmuştur. İlk girişte şifrenizi değiştirmeniz istenebilir.",
        }),
      });
      if (!emailResult.ok) {
        console.error(`[admin/users] Hoşgeldin emaili BAŞARISIZ: ${emailOrPhone} — ${emailResult.error}`);
      } else {
        console.log(`[admin/users] Hoşgeldin emaili BAŞARILI: ${emailOrPhone}`);
      }
    } else {
      console.log(`[admin/users] Email adresi değil, hoşgeldin emaili atlandı: ${emailOrPhone}`);
    }
    }

    return NextResponse.json(row[0]);
  } catch (e) {
    return jsonSqlError(e, "Hesap oluşturulamadı.");
  }
}
