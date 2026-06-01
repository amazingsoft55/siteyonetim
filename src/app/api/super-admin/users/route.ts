import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import { users } from "@/db/schema";
import { createNotification } from "@/lib/notify";
import { sendBrandedEmail } from "@/lib/send-email";
import { buildBrandedEmailHtml } from "@/lib/email-template";
import { looksLikeEmail } from "@/lib/password-reset";
import { getPublicSiteUrl } from "@/lib/site-url";


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
  mustChangePassword: users.mustChangePassword,
};

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  try {
    const list = await d.db.select(publicUserColumns).from(users);
    return NextResponse.json(list);
  } catch (e) {
    return jsonSqlError(e, "Kullanıcılar listelenemedi.");
  }
}

type CreateBody = {
  name?: unknown;
  emailOrPhone?: unknown;
  password?: unknown;
  role?: unknown;
  siteId?: unknown;
  apartmentNo?: unknown;
  forcePasswordChange?: unknown;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  let raw: CreateBody;
  try {
    raw = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const emailOrPhone =
    typeof raw.emailOrPhone === "string" ? raw.emailOrPhone.replace(/\s+/g, "").trim() : "";
  const password = typeof raw.password === "string" ? raw.password : "";
  const role = raw.role === "ADMIN" || raw.role === "USER" ? raw.role : null;
  const siteIdRaw = raw.siteId;
  const siteId =
    typeof siteIdRaw === "string" && siteIdRaw.trim().length > 0 ? siteIdRaw.trim() : null;
  const apartmentNo =
    typeof raw.apartmentNo === "string" && raw.apartmentNo.trim().length > 0
      ? raw.apartmentNo.trim()
      : undefined;
  const forcePasswordChange = raw.forcePasswordChange === true;

  if (!name || !emailOrPhone || !password || !role) {
    return NextResponse.json(
      { error: "Ad, oturum (e‑posta veya telefon), şifre ve rol zorunludur." },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Şifre en az 6 karakter olmalı." }, { status: 400 });
  }

  if (!siteId) {
    return NextResponse.json({ error: "ADMIN ve USER için geçerli bir site seçin." }, { status: 400 });
  }

  try {
    const dup = await d.db.select().from(users).where(eq(users.emailOrPhone, emailOrPhone)).limit(1);
    if (dup.length) {
      return NextResponse.json({ error: "Bu e‑posta/telefon zaten kayıtlı." }, { status: 409 });
    }

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `u-${Date.now()}`;

    const passwordHash = await bcrypt.hash(password, 10);

    await d.db.insert(users).values({
      id,
      name,
      emailOrPhone,
      passwordHash,
      role,
      siteId,
      apartmentNo,
      mustChangePassword: forcePasswordChange,
    });

    const row = await d.db.select(publicUserColumns).from(users).where(eq(users.id, id)).limit(1);

    // Hoşgeldin bildirimi
    createNotification(d.db, {
      userId: id,
      title: "Hoş Geldiniz!",
      body: "Platformumuza başarıyla eklendiniz. Giriş bilgilerinizle panele erişebilirsiniz.",
      type: "WELCOME",
      href: role === "ADMIN" ? "/admin" : "/dashboard",
    });

    // Hoşgeldin emaili
    if (looksLikeEmail(emailOrPhone)) {
      const base = getPublicSiteUrl();
      const result = await sendBrandedEmail({
        to: emailOrPhone,
        subject: `Hoş Geldiniz — Site Yönetimi`,
        html: buildBrandedEmailHtml({
          title: "Hoş Geldiniz!",
          intro: `Merhaba <strong>${name}</strong>, Site Yönetimi platformuna başarıyla eklendiniz. Aşağıda hesap bilgilerinizi bulabilirsiniz.`,
          bodyHtml: `
            <table style="width:100%;margin:0 0 20px;font-size:14px;border-collapse:separate;border-spacing:0">
              <tr>
                <td style="padding:10px 14px;background:#f4f4f5;border-radius:10px 0 0 10px;color:#71717a;font-weight:600;width:120px;border-bottom:1px solid #e4e4e7">E-posta</td>
                <td style="padding:10px 14px;background:#f4f4f5;border-radius:0 10px 10px 0;color:#18181b;font-weight:700;border-bottom:1px solid #e4e4e7">${emailOrPhone}</td>
              </tr>
              ${apartmentNo ? `<tr>
                <td style="padding:10px 14px;background:#f4f4f5;border-radius:0 0 0 10px;color:#71717a;font-weight:600">Daire</td>
                <td style="padding:10px 14px;background:#f4f4f5;border-radius:0 0 10px 0;color:#18181b;font-weight:700">${apartmentNo}</td>
              </tr>` : ""}
            </table>
            <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:14px 18px;border-radius:0 10px 10px 0;margin:0 0 20px">
              <p style="margin:0;font-size:13px;color:#1e40af"><strong>Bilgi:</strong> Şifreniz yöneticiniz tarafından oluşturulmuştur. İlk girişinizde size özel bir şifre belirlemeniz istenecektir.</p>
            </div>
          `,
          ctaHref: `${base}/login`,
          ctaLabel: "Panele Giriş Yap",
          footerNote: "Bu hesap site yönetimi tarafından oluşturulmuştur. Sorularınız için yöneticinizle iletişime geçin.",
        }),
      });
      console.log(`[super-admin/users] Hoşgeldin emaili ${result.ok ? "BAŞARILI" : "BAŞARISIZ"}: ${emailOrPhone}`, result.ok ? "" : result.error);
    }

    return NextResponse.json(row[0]);
  } catch (e) {
    return jsonSqlError(e, "Kullanıcı oluşturulamadı.");
  }
}

