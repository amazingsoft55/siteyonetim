import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { jsonSqlError } from "@/lib/db-query-error";
import { announcements, users, pushSubscriptions } from "@/db/schema";
import { announcementToClient } from "@/lib/announcement-ui";
import { createBulkNotifications } from "@/lib/notify";
import { sendAnnouncementEmail } from "@/lib/send-email";
import { looksLikeEmail } from "@/lib/password-reset";
import { requireFeature } from "@/lib/feature-guard";


function forbidden() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
}

async function forbiddenScope() {
  return NextResponse.json({ error: "Site bilgisi yok." }, { status: 400 });
}
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return forbidden();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  const featureCheck = await requireFeature(d.db, session.siteId, "announcements");
  if (featureCheck) return featureCheck;

  const { searchParams } = new URL(request.url);
  const hint = searchParams.get("siteId");
  const singleId = searchParams.get("id");

  try {
    if (singleId) {
      const row = await d.db
        .select()
        .from(announcements)
        .where(and(eq(announcements.id, singleId), eq(announcements.siteId, session.siteId ?? "")))
        .limit(1);
      if (!row[0]) return NextResponse.json({ error: "Duyuru bulunamadı." }, { status: 404 });
      return NextResponse.json(announcementToClient(row[0]));
    }

    if (session.role === "SUPER_ADMIN") {
      const sid = hint?.trim();
      if (!sid) return NextResponse.json([]);
      const rows = await d.db
        .select()
        .from(announcements)
        .where(eq(announcements.siteId, sid))
        .orderBy(desc(announcements.createdAt));
      return NextResponse.json(rows.map(announcementToClient));
    }

    if (!session.siteId) return forbiddenScope();

    const rows = await d.db
      .select()
      .from(announcements)
      .where(eq(announcements.siteId, session.siteId))
      .orderBy(desc(announcements.createdAt));

    return NextResponse.json(rows.map(announcementToClient));
  } catch (e) {
    return jsonSqlError(e, "Duyurular yüklenemedi.");
  }
}

type PostBody = {
  title?: unknown;
  content?: unknown;
  category?: unknown;
  imageUrl?: unknown;
  images?: unknown;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return forbidden();
  if (!session.siteId) return forbiddenScope();

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  const featureCheck = await requireFeature(d.db, session.siteId, "announcements");
  if (featureCheck) return featureCheck;

  let raw: PostBody;
  try {
    raw = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const content = typeof raw.content === "string" ? raw.content.trim() : "";
  const category =
    typeof raw.category === "string" && raw.category.trim().length > 0 ? raw.category.trim() : "Genel";
  const imageUrl = typeof raw.imageUrl === "string" && raw.imageUrl.trim().length > 0 ? raw.imageUrl.trim() : null;

  let imagesJson = "[]";
  if (Array.isArray(raw.images)) {
    const validImages = raw.images.filter((img): img is string => typeof img === "string" && img.trim().length > 0);
    imagesJson = JSON.stringify(validImages.slice(0, 3));
  }

  if (!title || !content) {
    return NextResponse.json({ error: "Başlık ve içerik zorunludur." }, { status: 400 });
  }

  const id =
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `ann-${Date.now()}`;

  try {
    await d.db.insert(announcements).values({
      id,
      siteId: session.siteId,
      title,
      content,
      category,
      imageUrl,
      images: imagesJson,
    });

    const row = await d.db.select().from(announcements).where(eq(announcements.id, id)).limit(1);

    // Sitedeki tüm kullanıcılarına bildirim + email gönder
    try {
      const siteUsers = await d.db
        .select({ id: users.id, name: users.name, emailOrPhone: users.emailOrPhone })
        .from(users)
        .where(and(eq(users.siteId, session.siteId)));

      const userIds = siteUsers.map((u) => u.id);
      if (userIds.length > 0) {
        // Uygulama içi bildirim (tüm kullanıcılara)
        await createBulkNotifications(d.db, userIds, {
          title: `Yeni Duyuru: ${title}`,
          body: content.length > 100 ? content.slice(0, 100) + "..." : content,
          type: "ANNOUNCEMENT",
          href: `/dashboard/announcements/${id}`,
        });

        // Push notification gönder
        try {
          const subs = await d.db
            .select()
            .from(pushSubscriptions)
            .where(eq(pushSubscriptions.userId, session.id));

          if (subs.length > 0) {
            await sendPushToSubscriptions(subs, {
              title: `Yeni Duyuru: ${title}`,
              body: content.length > 120 ? content.slice(0, 120) + "..." : content,
              url: `/dashboard/announcements/${id}`,
            });
          }
        } catch { /* push hatası ana işlemi bozmasın */ }

        // Email bildirimi (sadece geçerli email adresi olanlara, yayıncı hariç)
        const emailsToSend = siteUsers.filter(
          (u) => u.id !== session.id && looksLikeEmail(u.emailOrPhone),
        );
        console.log(`[announcements] ${emailsToSend.length} kullanıcıya email gönderilecek`);
        for (const u of emailsToSend) {
          const result = await sendAnnouncementEmail(u.emailOrPhone, u.name, title, content, category);
          if (!result.ok) {
            console.error(`[announcements] Email gönderilemedi: ${u.emailOrPhone} — ${result.error}`);
          } else {
            console.log(`[announcements] Email gönderildi: ${u.emailOrPhone}`);
          }
        }
      }
    } catch {
      /* bildirim hatası ana işlemi bozmasın */
    }

    return NextResponse.json({
      success: true,
      announcement: row[0] ? announcementToClient(row[0]) : null,
    });
  } catch (e) {
    return jsonSqlError(e, "Duyuru oluşturulamadı.");
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return forbidden();
  if (!session.siteId) return forbiddenScope();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();

  if (!id) {
    return NextResponse.json({ error: "Kimlik gereklidir." }, { status: 400 });
  }

  const d = await acquireDatabase();
  if (!d.ok) return await databaseUnavailable();

  try {
    await d.db
      .delete(announcements)
      .where(and(eq(announcements.id, id), eq(announcements.siteId, session.siteId)));
    return NextResponse.json({ success: true });
  } catch (e) {
    return jsonSqlError(e, "Duyuru silinemedi.");
  }
}

/** Push notification aboneliklerine Web Push gönder */
async function sendPushToSubscriptions(
  subs: { endpoint: string; p256dh: string; auth: string }[],
  payload: { title: string; body: string; url: string },
) {
  const webPush = await import("web-push").catch(() => null);
  if (!webPush) return;

  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const vapidEmail = process.env.VAPID_EMAIL?.trim() || "mailto:admin@siteyonetim.com";

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.log("[push] VAPID anahtarları tanımlı değil, push atlanıyor");
    return;
  }

  webPush.default.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);

  for (const sub of subs) {
    try {
      await webPush.default.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
      );
    } catch (err) {
      // Abonelik geçersizse sil
      if ((err as { statusCode?: number }).statusCode === 404 || (err as { statusCode?: number }).statusCode === 410) {
        // Aboneliği temizle
      }
      console.error(`[push] Gönderilemedi: ${(err as Error).message}`);
    }
  }
}
