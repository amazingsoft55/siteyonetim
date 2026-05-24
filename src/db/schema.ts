import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
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
