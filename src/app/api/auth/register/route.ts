import { NextResponse } from "next/server";
import { getPlatformDb } from "@/db/platform";
import { users, sites } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { databaseUnavailable } from "@/server/database/access";
import type { PlatformDatabase } from "@/db/platform";
import { sendAccountPendingAdminNotificationEmail } from "@/lib/send-email";
import { createNotification } from "@/lib/notify";

type RegisterBody = {
  name?: unknown;
  emailOrPhone?: unknown;
  password?: unknown;
  siteId?: unknown;
  newSiteName?: unknown;
  apartmentNo?: unknown;
  accountType?: unknown; // "RESIDENT" | "MANAGER"
};

export async function POST(request: Request) {
  try {
    const raw = (await request.json()) as RegisterBody;
    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    const emailOrPhone = typeof raw.emailOrPhone === "string" ? raw.emailOrPhone.trim().toLowerCase() : "";
    const password = typeof raw.password === "string" ? raw.password : "";
    let siteId = typeof raw.siteId === "string" ? raw.siteId.trim() : "";
    const newSiteName = typeof raw.newSiteName === "string" ? raw.newSiteName.trim() : "";
    const apartmentNo = typeof raw.apartmentNo === "string" ? raw.apartmentNo.trim() : "";
    const accountType = raw.accountType === "MANAGER" ? "MANAGER" : "RESIDENT";

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Lütfen geçerli bir ad soyad girin." }, { status: 400 });
    }

    if (!emailOrPhone || emailOrPhone.length < 5) {
      return NextResponse.json({ error: "Lütfen geçerli bir e-posta adresi veya telefon numarası girin." }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Şifre en az 6 karakter olmalıdır." }, { status: 400 });
    }

    let db: PlatformDatabase;
    try {
      db = await getPlatformDb();
    } catch {
      return await databaseUnavailable();
    }

    // E-posta / telefon çakışma kontrolü
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.emailOrPhone, emailOrPhone))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Bu e-posta veya telefon ile kayıtlı bir hesap zaten bulunmaktadır. Lütfen giriş yapmayı deneyin." },
        { status: 400 }
      );
    }

    let resolvedSiteName = "Site Yönetimi";

    // Yeni site oluşturma veya mevcut siteye bağlanma
    if (accountType === "MANAGER" && newSiteName) {
      siteId = crypto.randomUUID();
      await db.insert(sites).values({
        id: siteId,
        name: newSiteName,
        plan: "starter",
      });
      resolvedSiteName = newSiteName;
    } else if (siteId) {
      const siteRows = await db
        .select({ id: sites.id, name: sites.name })
        .from(sites)
        .where(eq(sites.id, siteId))
        .limit(1);

      if (siteRows.length > 0) {
        resolvedSiteName = siteRows[0].name;
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    const userRole = accountType === "MANAGER" ? "ADMIN" : "USER";

    await db.insert(users).values({
      id: userId,
      name,
      emailOrPhone,
      passwordHash,
      role: userRole,
      status: "PENDING", // Yönetici onayı bekliyor
      siteId: siteId || null,
      apartmentNo: apartmentNo || null,
      mustChangePassword: false,
    });

    // Site yöneticilerine veya süper yöneticiye sistem içi bildirim ve e-posta tetikle
    try {
      if (siteId && userRole === "USER") {
        const siteAdmins = await db
          .select({ id: users.id, emailOrPhone: users.emailOrPhone, name: users.name })
          .from(users)
          .where(and(eq(users.siteId, siteId), eq(users.role, "ADMIN")));

        for (const admin of siteAdmins) {
          createNotification(db, {
            userId: admin.id,
            title: "Yeni Sakin Başvurusu",
            body: `${name} (${apartmentNo ? `Daire ${apartmentNo}` : "Daire belirtilmemiş"}) onay bekliyor.`,
            type: "SYSTEM",
            href: "/admin/residents",
          });

          if (admin.emailOrPhone.includes("@")) {
            void sendAccountPendingAdminNotificationEmail(admin.emailOrPhone, {
              userName: name,
              userEmailOrPhone: emailOrPhone,
              siteName: resolvedSiteName,
              apartmentNo: apartmentNo || undefined,
            });
          }
        }
      }
    } catch {
      // Bildirim gönderimi ana kayıt işlemini engellememeli
    }

    return NextResponse.json({
      ok: true,
      message: "Kaydınız başarıyla alındı. Yönetici onayından sonra e-posta adresinize giriş bağlantısı gönderilecektir.",
      status: "PENDING",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Kayıt işlemi sırasında bir hata oluştu.", details: msg }, { status: 500 });
  }
}
