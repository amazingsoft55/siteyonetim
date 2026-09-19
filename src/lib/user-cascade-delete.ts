import { eq } from "drizzle-orm";
import type { PlatformDatabase } from "@/db/platform";
import {
  adminSupportTickets,
  announcements,
  communityChannels,
  communityMessages,
  communityPolls,
  communityPollVotes,
  emailVerificationCodes,
  notifications,
  passwordResetTokens,
  payments,
  pushSubscriptions,
  requests,
  siteSettings,
  sites,
  transactions,
  userPresence,
  users,
} from "@/db/schema";

/** Kullanıcıya bağlı tüm kayıtları kalıcı olarak silip kullanıcı satırını kaldırır (KVKK Uyumlu). */
export async function deleteUserCascade(db: PlatformDatabase, userId: string) {
  try { await db.delete(communityPollVotes).where(eq(communityPollVotes.userId, userId)); } catch {}
  try { await db.delete(communityMessages).where(eq(communityMessages.userId, userId)); } catch {}
  try { await db.delete(communityPolls).where(eq(communityPolls.createdBy, userId)); } catch {}
  try { await db.delete(pushSubscriptions).where(eq(pushSubscriptions.userId, userId)); } catch {}
  try { await db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.userId, userId)); } catch {}
  try { await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId)); } catch {}
  try { await db.delete(userPresence).where(eq(userPresence.userId, userId)); } catch {}
  try { await db.delete(notifications).where(eq(notifications.userId, userId)); } catch {}
  try { await db.delete(adminSupportTickets).where(eq(adminSupportTickets.adminUserId, userId)); } catch {}
  try { await db.delete(requests).where(eq(requests.userId, userId)); } catch {}
  try { await db.delete(payments).where(eq(payments.userId, userId)); } catch {}
  try { await db.delete(users).where(eq(users.id, userId)); } catch {}
}

/** Siteye bağlı tüm kullanıcılar, aidatlar, kasalar ve site verisini kalıcı olarak siler. */
export async function deleteSiteCascade(db: PlatformDatabase, siteId: string) {
  try {
    const siteUsers = await db.select({ id: users.id }).from(users).where(eq(users.siteId, siteId));
    for (const { id } of siteUsers) {
      await deleteUserCascade(db, id);
    }
  } catch {}

  try { await db.delete(communityMessages).where(eq(communityMessages.siteId, siteId)); } catch {}
  try { await db.delete(communityPolls).where(eq(communityPolls.siteId, siteId)); } catch {}
  try { await db.delete(communityChannels).where(eq(communityChannels.siteId, siteId)); } catch {}
  try { await db.delete(transactions).where(eq(transactions.siteId, siteId)); } catch {}
  try { await db.delete(adminSupportTickets).where(eq(adminSupportTickets.siteId, siteId)); } catch {}
  try { await db.delete(announcements).where(eq(announcements.siteId, siteId)); } catch {}
  try { await db.delete(requests).where(eq(requests.siteId, siteId)); } catch {}
  try { await db.delete(payments).where(eq(payments.siteId, siteId)); } catch {}
  try { await db.delete(siteSettings).where(eq(siteSettings.siteId, siteId)); } catch {}
  try { await db.delete(sites).where(eq(sites.id, siteId)); } catch {}
}
