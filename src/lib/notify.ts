import type { PlatformDatabase } from "@/db/platform";
import { notifications } from "@/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";

export type NotifyType = "WELCOME" | "PAYMENT" | "ANNOUNCEMENT" | "REQUEST" | "SYSTEM";

/**
 * Kullanıcıya bildirim oluştur.
 * Hata durumunda konsola yazar fakat çağıran fonksiyonu çökertmez.
 */
export async function createNotification(
  db: PlatformDatabase,
  opts: {
    userId: string;
    title: string;
    body: string;
    type?: NotifyType;
    href?: string;
  },
): Promise<boolean> {
  try {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await db.insert(notifications).values({
      id,
      userId: opts.userId,
      title: opts.title,
      body: opts.body,
      type: opts.type ?? "SYSTEM",
      href: opts.href ?? null,
    });
    return true;
  } catch (err) {
    console.error(`[notify] Bildirim eklenirken hata (${opts.userId}):`, err);
    return false;
  }
}

/** Kullanıcılara toplu bildirim gönder (aynı sitedekilere duyuru bildirimi vb.) */
export async function createBulkNotifications(
  db: PlatformDatabase,
  userIds: string[],
  opts: {
    title: string;
    body: string;
    type?: NotifyType;
    href?: string;
  },
) {
  if (!userIds.length) return;
  
  // Paralel olarak tüm kullanıcılara bildirim ekle
  await Promise.allSettled(
    userIds.map((uid) => createNotification(db, { ...opts, userId: uid }))
  );
}

/** Kullanıcının okunmamış bildirim sayısını getir */
export async function getUnreadCount(db: PlatformDatabase, userId: string): Promise<number> {
  try {
    const result = await db
      .select({ c: count() })
      .from(notifications)
      .where(
        sql`${notifications.userId} = ${userId} AND ${notifications.readAt} IS NULL`,
      );
    return result[0]?.c ?? 0;
  } catch (err) {
    console.error(`[notify] Okunmamış bildirim sayısı alınamadı (${userId}):`, err);
    return 0;
  }
}

/** Kullanıcının son N bildirimini getir */
export async function getNotifications(
  db: PlatformDatabase,
  userId: string,
  limit = 30,
) {
  try {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  } catch (err) {
    console.error(`[notify] Bildirimler listelenemedi (${userId}):`, err);
    return [];
  }
}

/** Tek bildirimi okundu olarak işaretle */
export async function markAsRead(db: PlatformDatabase, notificationId: string, userId: string) {
  try {
    const now = new Date().toISOString();
    await db
      .update(notifications)
      .set({ readAt: now })
      .where(
        sql`${notifications.id} = ${notificationId} AND ${notifications.userId} = ${userId}`,
      );
  } catch (err) {
    console.error(`[notify] Bildirim okundu işaretlenemedi:`, err);
  }
}

/** Kullanıcının tüm okunmamış bildirimlerini okundu olarak işaretle */
export async function markAllAsRead(db: PlatformDatabase, userId: string) {
  try {
    const now = new Date().toISOString();
    await db
      .update(notifications)
      .set({ readAt: now })
      .where(
        sql`${notifications.userId} = ${userId} AND ${notifications.readAt} IS NULL`,
      );
  } catch (err) {
    console.error(`[notify] Tüm bildirimler okundu işaretlenemedi:`, err);
  }
}

/** Bildirimi sil */
export async function deleteNotification(db: PlatformDatabase, notificationId: string, userId: string) {
  try {
    await db
      .delete(notifications)
      .where(
        sql`${notifications.id} = ${notificationId} AND ${notifications.userId} = ${userId}`,
      );
  } catch (err) {
    console.error(`[notify] Bildirim silinemedi:`, err);
  }
}

