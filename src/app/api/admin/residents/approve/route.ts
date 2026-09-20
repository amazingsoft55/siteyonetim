import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import { users, sites } from "@/db/schema";
import { createNotification } from "@/lib/notify";
import { sendAccountApprovedEmail } from "@/lib/send-email";
import { looksLikeEmail } from "@/lib/password-reset";

function forbidden() {
  return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    return forbidden();
  }

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  try {
    const raw = (await request.json()) as { userId?: unknown; action?: unknown };
    const userId = typeof raw.userId === "string" ? raw.userId.trim() : "";
    const action = raw.action === "REJECT" ? "REJECT" : "APPROVE";

    if (!userId) {
      return NextResponse.json({ error: "Kullanıcı ID gereklidir." }, { status: 400 });
    }

    const userRows = await d.db
      .select({
        id: users.id,
        name: users.name,
        emailOrPhone: users.emailOrPhone,
        role: users.role,
        status: users.status,
        siteId: users.siteId,
        apartmentNo: users.apartmentNo,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = userRows[0];
    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    // Yöneticinin kendi sitesindeki sakin mi kontrol et (süper yönetici hariç)
    if (session.role === "ADMIN" && user.siteId !== session.siteId) {
      return forbidden();
    }

    const targetSiteId = user.siteId || session.siteId;
    let siteName = "Site Yönetimi";

    if (targetSiteId) {
      const siteRows = await d.db
        .select({ name: sites.name })
        .from(sites)
        .where(eq(sites.id, targetSiteId))
        .limit(1);

      if (siteRows[0]?.name) {
        siteName = siteRows[0].name;
      }
    }

    if (action === "APPROVE") {
      await d.db
        .update(users)
        .set({ status: "APPROVED" })
        .where(eq(users.id, userId));

      // 1. Sistem içi bildirim oluştur
      await createNotification(d.db, {
        userId: user.id,
        title: "Hesabınız Onaylandı 🎉",
        body: `${siteName} sakin hesabınız onaylanmıştır. Tüm platform özelliklerini kullanabilirsiniz.`,
        type: "WELCOME",
        href: "/dashboard",
      });

      // 2. Kullanıcıya özel zengin HTML onay e-postası gönder
      if (looksLikeEmail(user.emailOrPhone)) {
        try {
          const base = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000").replace(/\/$/, "");
          const mailRes = await sendAccountApprovedEmail(user.emailOrPhone, {
            name: user.name,
            siteName,
            emailOrPhone: user.emailOrPhone,
            apartmentNo: user.apartmentNo,
            role: user.role,
            loginUrl: `${base}/login`,
          });
          console.log("[approve] Hesap onay e-postası sonucu:", mailRes);
        } catch (mailErr) {
          console.error("[approve] Hesap onay e-postası gönderilemedi:", mailErr);
        }
      }

      return NextResponse.json({
        ok: true,
        message: `${user.name} kullanıcısının hesabı onaylandı ve e-posta iletildi.`,
        status: "APPROVED",
      });
    } else {
      // REJECT
      await d.db
        .update(users)
        .set({ status: "REJECTED" })
        .where(eq(users.id, userId));

      return NextResponse.json({
        ok: true,
        message: `${user.name} kullanıcısının başvurusu reddedildi.`,
        status: "REJECTED",
      });
    }
  } catch (e) {
    return jsonSqlError(e, "Onay işlemi tamamlanamadı.");
  }
}
