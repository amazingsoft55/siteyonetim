import type { PlatformDatabase } from "@/db/platform";
import { notifications } from "@/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";

type NotifyType = "WELCOME" | "PAYMENT" | "ANNOUNCEMENT" | "REQUEST" | "SYSTEM";

/**
 * Kullanıcıya bildirim oluştur.
 * Hata fırlatmaz — sessizce başarısız olur (bildirim sistem hatası sayfayı bozmamalı).
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
) {
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
  } catch {
    /* Bildirim kayıt hatası sayfayı bozmamalı */
  }
}

/** Kullanıcıya toplu bildirim gönder (aynı sitedekilere duyuru bildirimi vb.) */
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
  for (const uid of userIds) {
    await createNotification(db, { ...opts, userId: uid });
  }
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
  } catch {
    return 0;
  }
}

/** Kullanıcının son N bildirimini getir */
export async function getNotifications(
  db: PlatformDatabase,
  userId: string,
  limit = 20,
) {
  try {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  } catch {
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
  } catch {
    /* sessiz */
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
  } catch {
    /* sessiz */
  }
}
