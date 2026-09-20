import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import { users, sites } from "@/db/schema";
import { deleteUserCascade, deleteSiteCascade } from "@/lib/user-cascade-delete";
import { createNotification } from "@/lib/notify";
import { sendAccountDeletedEmail } from "@/lib/send-email";
import { looksLikeEmail } from "@/lib/password-reset";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !session.id) {
    return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
  }

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  let body: { password?: unknown; deleteSiteAlso?: unknown };
  try {
    body = (await request.json()) as { password?: unknown; deleteSiteAlso?: unknown };
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  const deleteSiteAlso = Boolean(body.deleteSiteAlso);

  if (!password) {
    return NextResponse.json(
      { error: "Hesabınızı kalıcı olarak silmek için mevcut şifrenizi girmelisiniz." },
      { status: 400 }
    );
  }

  try {
    const userRows = await d.db.select().from(users).where(eq(users.id, session.id)).limit(1);
    const user = userRows[0];
    if (!user) {
      return NextResponse.json({ error: "Kullanıcı hesabı bulunamadı." }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Girdiğiniz şifre hatalı. Güvenlik gerekçesiyle hesap silinemedi." },
        { status: 400 }
      );
    }

    // Süper yönetici hesabı silinemez
    if (user.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Süper yönetici hesabı bu panelden silinemez." },
        { status: 403 }
      );
    }

    // Site adını öğren
    let siteName = "Site Yönetimi";
    if (user.siteId) {
      const siteRows = await d.db.select({ name: sites.name }).from(sites).where(eq(sites.id, user.siteId)).limit(1);
      if (siteRows[0]?.name) {
        siteName = siteRows[0].name;
      }
    }

    // 1. Kullanıcıya "Hesabınız Kalıcı Olarak Silindi" onay e-postası gönder
    if (looksLikeEmail(user.emailOrPhone)) {
      try {
        const mailRes = await sendAccountDeletedEmail(user.emailOrPhone, {
          recipientName: user.name,
          emailOrPhone: user.emailOrPhone,
          siteName,
          apartmentNo: user.apartmentNo,
          role: user.role,
        });
        console.log("[account/delete] Hesap silindi e-postası sonucu:", mailRes);
      } catch (mailErr) {
        console.error("[account/delete] Hesap silindi e-postası gönderilemedi:", mailErr);
      }
    }

    // 2. Eğer silinen hesap bir Daire Sakini (USER) ise, Site Yöneticisine (ADMIN) bildirim gönder
    if (user.role === "USER" && user.siteId) {
      try {
        const siteAdmins = await d.db
          .select({ id: users.id })
          .from(users)
          .where(and(eq(users.siteId, user.siteId), eq(users.role, "ADMIN")));

        const aptLabel = user.apartmentNo ? ` (Daire ${user.apartmentNo})` : "";
        for (const admin of siteAdmins) {
          await createNotification(d.db, {
            userId: admin.id,
            title: "Sakin Ayrıldı / Hesap Silindi",
            body: `${user.name}${aptLabel} sakin hesabını ve platform kaydını kalıcı olarak sildi.`,
            type: "SYSTEM",
            href: "/admin/residents",
          });
        }
      } catch (notifErr) {
        console.error("[account/delete] Yönetici bildirimi eklenemedi:", notifErr);
      }
    }

    // 3. Veritabanından kalıcı olarak sil
    if (user.role === "ADMIN" && user.siteId && deleteSiteAlso) {
      await deleteSiteCascade(d.db, user.siteId);
    } else {
      await deleteUserCascade(d.db, user.id);
    }

    const response = NextResponse.json({
      ok: true,
      message: "Hesabınız ve tüm ilişkili verileriniz kalıcı olarak başarıyla silindi.",
    });

    // Oturum çerezlerini (token ve session) derhal ve tamamen imha et
    response.cookies.set("token", "", {
      path: "/",
      expires: new Date(0),
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    response.cookies.set("session", "", {
      path: "/",
      expires: new Date(0),
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    return jsonSqlError(error, "Hesap silinirken bir hata oluştu.");
  }
}

