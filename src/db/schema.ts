import { sqliteTable, text, integer, real, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const sites = sqliteTable("sites", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  plan: text("plan", { enum: ["starter", "professional", "enterprise"] }).notNull().default("starter"),
  planExpiresAt: text("plan_expires_at"),
  inviteCode: text("invite_code"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  emailOrPhone: text("email_or_phone").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["SUPER_ADMIN", "ADMIN", "USER"] }).notNull().default("USER"),
  status: text("status", { enum: ["PENDING", "APPROVED", "REJECTED"] }).notNull().default("APPROVED"),
  siteId: text("site_id").references(() => sites.id),
  apartmentNo: text("apartment_no"),
  lastLoginAt: text("last_login_at"),
  /** 1 = ilk girişte kalıcı şifre zorunlu (JWT'de mcp) */
  mustChangePassword: integer("must_change_password", { mode: "boolean" }).notNull().default(false),
  /** E-posta/şifre kaç kez değiştirildi (0 = bir kez ücretsiz değişiklik hakkı) */
  accountChangesCount: integer("account_changes_count").notNull().default(0),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

/** Süper yönetici hesap değişikliği doğrulama kodu (6 hane, kısa süreli) */
export const emailVerificationCodes = sqliteTable("email_verification_codes", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  codeHash: text("code_hash").notNull(),
  purpose: text("purpose").notNull().default("account_change"),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  siteId: text("site_id").references(() => sites.id),
  amount: real("amount").notNull(),
  title: text("title").notNull(),
  status: text("status", { enum: ["PAID", "UNPAID"] }).notNull().default("UNPAID"),
  dueDate: text("due_date"),
  paidAt: text("paid_at"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const announcements = sqliteTable("announcements", {
  id: text("id").primaryKey(),
  siteId: text("site_id").references(() => sites.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category"),
  imageUrl: text("image_url"),
  images: text("images").default("[]"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const requests = sqliteTable("requests", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  siteId: text("site_id").references(() => sites.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  category: text("category"),
  status: text("status", { enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"] }).notNull().default("OPEN"),
  resolutionNote: text("resolution_note"),
  resolutionImageUrl: text("resolution_image_url"),
  rejectedNote: text("rejected_note"),
  rejectedImageUrl: text("rejected_image_url"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

/** Site başına görünen iletişim / aidat metinleri (kalıcı SQLite) */
export const siteSettings = sqliteTable("site_settings", {
  siteId: text("site_id")
    .primaryKey()
    .references(() => sites.id),
  defaultAidat: text("default_aidat"),
  managerName: text("manager_name"),
  iban: text("iban"),
  bankName: text("bank_name"),
  phone: text("phone"),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

/** Ziyaretçi / iletişim ve genel destek formu — kimlik gerektirmez (süper yönetici panelinde görünür) */
export const platformPublicContact = sqliteTable("platform_public_contact", {
  id: text("id").primaryKey(),
  source: text("source").notNull().default("iletisim"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status", { enum: ["OPEN", "IN_PROGRESS", "RESOLVED"] })
    .notNull()
    .default("OPEN"),
  superAdminReply: text("super_admin_reply"),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

/** Site yöneticisinden platform süper yöneticisine destek talebi */
export const adminSupportTickets = sqliteTable("admin_support_tickets", {
  id: text("id").primaryKey(),
  siteId: text("site_id").notNull().references(() => sites.id),
  adminUserId: text("admin_user_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status", { enum: ["OPEN", "IN_PROGRESS", "RESOLVED"] })
    .notNull()
    .default("OPEN"),
  superAdminReply: text("super_admin_reply"),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

/** Süper yönetici şifre sıfırlama bağlantısı (token tek kullanımlık, süreli) */
export const passwordResetTokens = sqliteTable("password_reset_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

/** Çevrimiçi yaklaşımı: kimlik doğrulamalı sayfadan periyodik ping */
export const userPresence = sqliteTable("user_presence", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id),
  lastPath: text("last_path"),
  lastPingAt: text("last_ping_at").notNull(),
});

/** Herkese açık sayfa görüntülemeleri (tarayıcı beacon; gündüz/partition bazlı sayım) */
export const pageVisitsDaily = sqliteTable(
  "page_visits_daily",
  {
    day: text("day").notNull(),
    pathname: text("pathname").notNull(),
    cnt: integer("cnt").notNull().default(1),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.day, t.pathname] }),
  }),
);

/** PageSpeed Lighthouse önbelleği (JSON) */
export const platformInsights = sqliteTable("platform_insights", {
  key: text("key").primaryKey(),
  json: text("json").notNull(),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

/** Platform özellikleri — süper yönetici tarafından yönetilir, paketlere eklenir */
export const features = sqliteTable("features", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  category: text("category").notNull().default("genel"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

/** Fiyatlandırma paketleri — süper yönetici tarafından yönetilir */
export const plans = sqliteTable("plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  originalPrice: integer("original_price"),
  period: text("period").notNull().default("/ay"),
  featureIds: text("feature_ids").notNull().default("[]"),
  highlight: integer("highlight", { mode: "boolean" }).notNull().default(false),
  badge: text("badge"),
  cta: text("cta").notNull().default("Hemen Başla"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

/** Kullanıcı bildirimleri — hoşgeldin, aidat, duyuru, talep durumu vb. */
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  body: text("body").notNull(),
  type: text("type", {
    enum: ["WELCOME", "PAYMENT", "ANNOUNCEMENT", "REQUEST", "SYSTEM"],
  }).notNull().default("SYSTEM"),
  href: text("href"),
  readAt: text("read_at"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

/** Push notification abonelikleri — tarayıcı push için */
export const pushSubscriptions = sqliteTable("push_subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("user_agent"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

/** Site Kasa & Gelir/Gider Hareketleri */
export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  siteId: text("site_id").notNull().references(() => sites.id),
  type: text("type", { enum: ["INCOME", "EXPENSE"] }).notNull(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  amount: real("amount").notNull(),
  date: text("date").notNull(),
  paymentMethod: text("payment_method").notNull().default("BANK"),
  receiptNo: text("receipt_no"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

/** Site İçi Topluluk Kanalları / Grupları (Komşuluk Ağı) */
export const communityChannels = sqliteTable("community_channels", {
  id: text("id").primaryKey(),
  siteId: text("site_id").notNull().references(() => sites.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  icon: text("icon").notNull().default("MessageSquare"),
  isAnnouncementOnly: integer("is_announcement_only", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

/** Site İçi Anketler & Oylamalar */
export const communityPolls = sqliteTable("community_polls", {
  id: text("id").primaryKey(),
  siteId: text("site_id").notNull().references(() => sites.id),
  channelId: text("channel_id").notNull().references(() => communityChannels.id),
  createdBy: text("created_by").notNull().references(() => users.id),
  question: text("question").notNull(),
  /** JSON array of string options e.g. ["Evet", "Hayır"] */
  options: text("options").notNull().default("[]"),
  expiresAt: text("expires_at"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

/** Anket Oyları */
export const communityPollVotes = sqliteTable("community_poll_votes", {
  id: text("id").primaryKey(),
  pollId: text("poll_id").notNull().references(() => communityPolls.id),
  userId: text("user_id").notNull().references(() => users.id),
  optionIndex: integer("option_index").notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

/** Site İçi Komşuluk Mesajları & Paylaşımlar */
export const communityMessages = sqliteTable("community_messages", {
  id: text("id").primaryKey(),
  siteId: text("site_id").notNull().references(() => sites.id),
  channelId: text("channel_id").notNull().references(() => communityChannels.id),
  userId: text("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  isPinned: integer("is_pinned", { mode: "boolean" }).notNull().default(false),
  pollId: text("poll_id").references(() => communityPolls.id),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

