-- =============================================================================
-- Site Yönetimi — ŞEMA ONLY (SQLite / Cloudflare D1 uyumlu)
-- =============================================================================
-- Bu dosya yalnızca tablolar ve indeksler oluşturur; üretim verisi buraya yazılmaz.
--
-- Yerel dosya SQLite:          npm run db:apply
-- Cloudflare D1 (remote):      npm run db:d1:remote
--
-- =============================================================================

-- -----------------------------------------------------------------------------
-- [A] OPSİYONEL sıfırlama (DROP)
-- -----------------------------------------------------------------------------
/*
PRAGMA foreign_keys = OFF;
DROP TABLE IF EXISTS `page_visits_daily`;
DROP TABLE IF EXISTS `platform_insights`;
DROP TABLE IF EXISTS `user_presence`;
DROP TABLE IF EXISTS `password_reset_tokens`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `announcements`;
DROP TABLE IF EXISTS `requests`;
DROP TABLE IF EXISTS `admin_support_tickets`;
DROP TABLE IF EXISTS `platform_public_contact`;
DROP TABLE IF EXISTS `site_settings`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `sites`;
PRAGMA foreign_keys = ON;
*/

-- -----------------------------------------------------------------------------
-- [B] ŞEMA OLUŞTUR
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `sites` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `address` text,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS `users` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `email_or_phone` text NOT NULL,
  `password_hash` text NOT NULL,
  `role` text NOT NULL DEFAULT 'USER',
  `site_id` text,
  `apartment_no` text,
  `last_login_at` text,
  `must_change_password` integer NOT NULL DEFAULT 0,
  `account_changes_count` integer NOT NULL DEFAULT 0,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`)
);

CREATE UNIQUE INDEX IF NOT EXISTS `users_email_or_phone_unique` ON `users` (`email_or_phone`);

CREATE TABLE IF NOT EXISTS `email_verification_codes` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `code_hash` text NOT NULL,
  `purpose` text NOT NULL DEFAULT 'account_change',
  `expires_at` text NOT NULL,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);

CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `token` text NOT NULL UNIQUE,
  `expires_at` text NOT NULL,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);

CREATE INDEX IF NOT EXISTS `idx_password_reset_tokens_user` ON `password_reset_tokens` (`user_id`);

CREATE TABLE IF NOT EXISTS `payments` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `site_id` text,
  `amount` real NOT NULL,
  `title` text NOT NULL,
  `status` text NOT NULL DEFAULT 'UNPAID',
  `due_date` text,
  `paid_at` text,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`)
);

CREATE TABLE IF NOT EXISTS `announcements` (
  `id` text PRIMARY KEY NOT NULL,
  `site_id` text,
  `title` text NOT NULL,
  `content` text NOT NULL,
  `category` text,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`)
);

CREATE TABLE IF NOT EXISTS `requests` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `site_id` text,
  `subject` text NOT NULL,
  `description` text NOT NULL,
  `category` text,
  `status` text NOT NULL DEFAULT 'OPEN',
  `created_at` text DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`)
);

CREATE TABLE IF NOT EXISTS `site_settings` (
  `site_id` text PRIMARY KEY NOT NULL,
  `default_aidat` text,
  `manager_name` text,
  `iban` text,
  `bank_name` text,
  `phone` text,
  `updated_at` text DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`)
);

CREATE TABLE IF NOT EXISTS `platform_public_contact` (
  `id` text PRIMARY KEY NOT NULL,
  `source` text NOT NULL DEFAULT 'iletisim',
  `name` text NOT NULL,
  `email` text NOT NULL,
  `phone` text,
  `subject` text NOT NULL,
  `body` text NOT NULL,
  `status` text NOT NULL DEFAULT 'OPEN',
  `super_admin_reply` text,
  `updated_at` text DEFAULT (CURRENT_TIMESTAMP),
  `created_at` text DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS `idx_platform_public_contact_status` ON `platform_public_contact` (`status`);
CREATE INDEX IF NOT EXISTS `idx_platform_public_contact_created` ON `platform_public_contact` (`created_at`);

CREATE TABLE IF NOT EXISTS `admin_support_tickets` (
  `id` text PRIMARY KEY NOT NULL,
  `site_id` text NOT NULL,
  `admin_user_id` text NOT NULL,
  `subject` text NOT NULL,
  `body` text NOT NULL,
  `status` text NOT NULL DEFAULT 'OPEN',
  `super_admin_reply` text,
  `updated_at` text DEFAULT (CURRENT_TIMESTAMP),
  `created_at` text DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`),
  FOREIGN KEY (`admin_user_id`) REFERENCES `users`(`id`)
);

CREATE INDEX IF NOT EXISTS `idx_admin_support_site` ON `admin_support_tickets` (`site_id`);
CREATE INDEX IF NOT EXISTS `idx_admin_support_status` ON `admin_support_tickets` (`status`);

CREATE TABLE IF NOT EXISTS `user_presence` (
  `user_id` text PRIMARY KEY NOT NULL,
  `last_path` text,
  `last_ping_at` text NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);

CREATE TABLE IF NOT EXISTS `page_visits_daily` (
  `day` text NOT NULL,
  `pathname` text NOT NULL,
  `cnt` integer NOT NULL DEFAULT 1,
  PRIMARY KEY (`day`, `pathname`)
);

CREATE TABLE IF NOT EXISTS `platform_insights` (
  `key` text PRIMARY KEY NOT NULL,
  `json` text NOT NULL,
  `updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
