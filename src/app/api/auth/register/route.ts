import { NextResponse } from "next/server";
import { getPlatformDb } from "@/db/platform";
import { users, sites } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { databaseUnavailable } from "@/server/database/access";
import type { PlatformDatabase } from "@/db/platform";
import { sendAccountPendingAdminNotificationEmail, sendWelcomeEmail } from "@/lib/send-email";
import { createNotification } from "@/lib/notify";
import { parseInviteCodeInput, generateSiteInviteCode } from "@/lib/site-code";

function generateSafeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

type RegisterBody = {
  name?: unknown;
  emailOrPhone?: unknown;
  password?: unknown;
  siteId?: unknown;
  inviteCode?: unknown;
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
    const inviteCodeRaw = typeof raw.inviteCode === "string" ? raw.inviteCode.trim() : "";
    const newSiteName = typeof raw.newSiteName === "string" ? raw.newSiteName.trim() : "";
    let apartmentNo = typeof raw.apartmentNo === "string" ? raw.apartmentNo.trim() : "";
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

    // 1. Daire Sakini Kaydı: Katılım Kodu Doğrulama
    if (accountType === "RESIDENT") {
      const codeToSearch = inviteCodeRaw || siteId;
      if (!codeToSearch) {
        return NextResponse.json(
          { error: "Lütfen site yöneticinizin size ilettiği Katılım Kodunu girin." },
          { status: 400 }
        );
      }

      const parsed = parseInviteCodeInput(codeToSearch);
      if (parsed.apartmentNo && !apartmentNo) {
        apartmentNo = parsed.apartmentNo;
      }

      let matchedSite: { id: string; name: string } | null = null;

      try {
        const siteRows = await db
          .select({
            id: sites.id,
            name: sites.name,
            inviteCode: sites.inviteCode,
          })
          .from(sites);

        for (const s of siteRows) {
          const expectedCode = (s.inviteCode || generateSiteInviteCode(s.name, s.id)).toUpperCase();
          if (
            expectedCode === parsed.siteCodeOnly.toUpperCase() ||
            s.id.toUpperCase() === parsed.siteCodeOnly.toUpperCase()
          ) {
            matchedSite = { id: s.id, name: s.name };
            break;
          }
        }
      } catch {
        // invite_code kolonu henüz D1'de yoksa temel alanlarla ara
        try {
          const basicSites = await db
            .select({ id: sites.id, name: sites.name })
            .from(sites);

          for (const s of basicSites) {
            const expectedCode = generateSiteInviteCode(s.name, s.id).toUpperCase();
            if (
              expectedCode === parsed.siteCodeOnly.toUpperCase() ||
              s.id.toUpperCase() === parsed.siteCodeOnly.toUpperCase()
            ) {
              matchedSite = { id: s.id, name: s.name };
              break;
            }
          }
        } catch (queryErr) {
          console.error("Site sorgulama hatası:", queryErr);
        }
      }

      if (!matchedSite) {
        return NextResponse.json(
          { error: "Geçersiz site katılım kodu. Lütfen yöneticinizden aldığınız kodu kontrol edin." },
          { status: 400 }
        );
      }

      siteId = matchedSite.id;
      resolvedSiteName = matchedSite.name;
    }

    // 2. Yönetici Kaydı: Yeni Site ve Katılım Kodu Oluşturma
    else if (accountType === "MANAGER") {
      if (!newSiteName) {
        return NextResponse.json({ error: "Lütfen yöneteceğiniz site / apartman adını girin." }, { status: 400 });
      }
      siteId = generateSafeId();
      const generatedCode = generateSiteInviteCode(newSiteName, siteId);

      let inserted = false;
      try {
        await db.insert(sites).values({
          id: siteId,
          name: newSiteName,
          plan: "starter",
          inviteCode: generatedCode,
        });
        inserted = true;
      } catch (err) {
        console.warn("Drizzle insert sites failed, trying raw SQL fallback:", err);
      }

      if (!inserted) {
        try {
          await db.run(
            sql`INSERT INTO sites (id, name, plan) VALUES (${siteId}, ${newSiteName}, 'starter')`
          );
          inserted = true;
        } catch (rawErr) {
          console.warn("Raw SQL insert sites 1 failed, trying minimal:", rawErr);
        }
      }

      if (!inserted) {
        try {
          await db.run(
            sql`INSERT INTO sites (id, name) VALUES (${siteId}, ${newSiteName})`
          );
        } catch (rawErr2) {
          console.error("Sites raw SQL failed:", rawErr2);
          throw rawErr2;
        }
      }
      resolvedSiteName = newSiteName;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = generateSafeId();
    const userRole = accountType === "MANAGER" ? "ADMIN" : "USER";
    const userStatus = "APPROVED"; // Sakin ve Yönetici hesapları anında aktif olur

    let insertedUser = false;
    try {
      await db.insert(users).values({
        id: userId,
        name,
        emailOrPhone,
        passwordHash,
        role: userRole,
        status: userStatus,
        siteId: siteId || null,
        apartmentNo: accountType === "RESIDENT" ? (apartmentNo || null) : null,
      });
      insertedUser = true;
    } catch (e1) {
      console.warn("Drizzle insert users failed, trying raw SQL fallback:", e1);
    }

    if (!insertedUser) {
      try {
        const aptVal = accountType === "RESIDENT" ? (apartmentNo || null) : null;
        const siteVal = siteId || null;
        await db.run(
          sql`INSERT INTO users (id, name, email_or_phone, password_hash, role, status, site_id, apartment_no) VALUES (${userId}, ${name}, ${emailOrPhone}, ${passwordHash}, ${userRole}, ${userStatus}, ${siteVal}, ${aptVal})`
        );
        insertedUser = true;
      } catch (e2) {
        console.warn("Raw SQL insert 1 failed, trying minimal fallback:", e2);
      }
    }

    if (!insertedUser) {
      try {
        const siteVal = siteId || null;
        await db.run(
          sql`INSERT INTO users (id, name, email_or_phone, password_hash, role, site_id) VALUES (${userId}, ${name}, ${emailOrPhone}, ${passwordHash}, ${userRole}, ${siteVal})`
        );
      } catch (e3) {
        console.error("User insert raw SQL minimal error:", e3);
        throw e3;
      }
    }

    // Bildirimler & Hoş Geldin E-postası (Hata verse dahi kullanıcı kaydını asla engellemez)
    try {
      // 1. Yeni Kaydolan Kullanıcıya / Yöneticiye Hoş Geldiniz E-postası
      if (emailOrPhone.includes("@")) {
        try {
          const mailRes = await sendWelcomeEmail(emailOrPhone, {
            name,
            siteName: resolvedSiteName,
            emailOrPhone,
            apartmentNo: accountType === "RESIDENT" ? (apartmentNo || null) : null,
            role: userRole,
          });
          console.log("Hoş geldin e-postası sonucu:", mailRes);
        } catch (mailErr) {
          console.error("Hoş geldin e-postası gönderilemedi:", mailErr);
        }
      }

      // 2. Sistem İçi Hoş Geldiniz Bildirimi
      try {
        createNotification(db, {
          userId,
          title: "Hoş Geldiniz!",
          body: `${resolvedSiteName} sistemine başarıyla kaydoldunuz.`,
          type: "SYSTEM",
          href: userRole === "ADMIN" ? "/admin/residents" : "/dashboard",
        });
      } catch {}

      // 3. Sakin katıldığında Yöneticiye Bildirim
      if (siteId && userRole === "USER") {
        const siteAdmins = await db
          .select({ id: users.id, emailOrPhone: users.emailOrPhone, name: users.name })
          .from(users)
          .where(and(eq(users.siteId, siteId), eq(users.role, "ADMIN")));

        for (const admin of siteAdmins) {
          try {
            createNotification(db, {
              userId: admin.id,
              title: "Yeni Sakin Katıldı",
              body: `${name} (${apartmentNo ? `Daire ${apartmentNo}` : "Daire belirtilmemiş"}) siteye katıldı.`,
              type: "SYSTEM",
              href: "/admin/residents",
            });
          } catch {}

          try {
            if (admin.emailOrPhone.includes("@")) {
              void sendAccountPendingAdminNotificationEmail(admin.emailOrPhone, {
                userName: name,
                userEmailOrPhone: emailOrPhone,
                siteName: resolvedSiteName,
                apartmentNo: apartmentNo || undefined,
              });
            }
          } catch {}
        }
      }
    } catch (notifErr) {
      console.warn("Notification error ignored during registration:", notifErr);
    }

    return NextResponse.json({
      ok: true,
      message:
        accountType === "MANAGER"
          ? "Site ve yönetici hesabınız başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz."
          : "Kaydınız başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.",
      status: "APPROVED",
      siteName: resolvedSiteName,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Kayıt hatası:", error);
    return NextResponse.json({ error: "Kayıt işlemi sırasında bir hata oluştu: " + msg }, { status: 500 });
  }
}
