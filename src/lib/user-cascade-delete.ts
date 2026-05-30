import { eq } from "drizzle-orm";
import type { PlatformDatabase } from "@/db/platform";
import {
  adminSupportTickets,
  announcements,
  emailVerificationCodes,
  notifications,
  passwordResetTokens,
  payments,
  requests,
  siteSettings,
  sites,
  userPresence,
  users,
} from "@/db/schema";

/** Kullanıcıya bağlı kayıtları silip kullanıcı satırını kaldırır. */
export async function deleteUserCascade(db: PlatformDatabase, userId: string) {
  await db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.userId, userId));
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  await db.delete(userPresence).where(eq(userPresence.userId, userId));
  await db.delete(notifications).where(eq(notifications.userId, userId));
  await db.delete(adminSupportTickets).where(eq(adminSupportTickets.adminUserId, userId));
  await db.delete(requests).where(eq(requests.userId, userId));
  await db.delete(payments).where(eq(payments.userId, userId));
  await db.delete(users).where(eq(users.id, userId));
}

/** Siteye bağlı kullanıcılar ve site verisini siler. */
export async function deleteSiteCascade(db: PlatformDatabase, siteId: string) {
  const siteUsers = await db.select({ id: users.id }).from(users).where(eq(users.siteId, siteId));
  for (const { id } of siteUsers) {
    await deleteUserCascade(db, id);
  }

  await db.delete(adminSupportTickets).where(eq(adminSupportTickets.siteId, siteId));
  await db.delete(announcements).where(eq(announcements.siteId, siteId));
  await db.delete(requests).where(eq(requests.siteId, siteId));
  await db.delete(payments).where(eq(payments.siteId, siteId));
  await db.delete(siteSettings).where(eq(siteSettings.siteId, siteId));
  await db.delete(sites).where(eq(sites.id, siteId));
}
