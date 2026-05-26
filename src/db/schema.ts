import { sqliteTable, text, integer, real, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const sites = sqliteTable("sites", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  emailOrPhone: text("email_or_phone").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["SUPER_ADMIN", "ADMIN", "USER"] }).notNull().default("USER"),
  siteId: text("site_id").references(() => sites.id),
  apartmentNo: text("apartment_no"),
  lastLoginAt: text("last_login_at"),
  /** 1 = ilk girişte kalıcı şifre zorunlu (JWT’de mcp) */
  mustChangePassword: integer("must_change_password", { mode: "boolean" }).notNull().default(false),
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
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const requests = sqliteTable("requests", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  siteId: text("site_id").references(() => sites.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status", { enum: ["OPEN", "IN_PROGRESS", "RESOLVED"] }).notNull().default("OPEN"),
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
