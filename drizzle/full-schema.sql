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
  `plan` text NOT NULL DEFAULT 'starter',
  `plan_expires_at` text,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS `users` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `email_or_phone` text NOT NULL,
  `password_hash` text NOT NULL,
  `role` text NOT NULL DEFAULT 'USER',
  `status` text NOT NULL DEFAULT 'APPROVED',
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
  `image_url` text,
  `images` text DEFAULT '[]',
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
  `resolution_note` text,
  `resolution_image_url` text,
  `rejected_note` text,
  `rejected_image_url` text,
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

-- -----------------------------------------------------------------------------
-- [C] BİLDİRİMLER
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `features` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `description` text,
  `icon` text,
  `category` text NOT NULL DEFAULT 'genel',
  `active` integer NOT NULL DEFAULT 1,
  `sort_order` integer NOT NULL DEFAULT 0,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS `plans` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `description` text,
  `price` integer NOT NULL,
  `original_price` integer,
  `period` text NOT NULL DEFAULT '/ay',
  `feature_ids` text NOT NULL DEFAULT '[]',
  `highlight` integer NOT NULL DEFAULT 0,
  `badge` text,
  `cta` text NOT NULL DEFAULT 'Hemen Başla',
  `sort_order` integer NOT NULL DEFAULT 0,
  `active` integer NOT NULL DEFAULT 1,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `title` text NOT NULL,
  `body` text NOT NULL,
  `type` text NOT NULL DEFAULT 'SYSTEM',
  `href` text,
  `read_at` text,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);

CREATE INDEX IF NOT EXISTS `idx_notifications_user_unread` ON `notifications` (`user_id`, `read_at`);
CREATE INDEX IF NOT EXISTS `idx_notifications_created` ON `notifications` (`created_at`);

-- Push notification abonelikleri
CREATE TABLE IF NOT EXISTS `push_subscriptions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `endpoint` text NOT NULL,
  `p256dh` text NOT NULL,
  `auth` text NOT NULL,
  `user_agent` text,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);

CREATE INDEX IF NOT EXISTS `idx_push_subscriptions_user` ON `push_subscriptions` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_push_subscriptions_endpoint` ON `push_subscriptions` (`endpoint`);

-- Kasa & Gelir/Gider Hareketleri
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` text PRIMARY KEY NOT NULL,
  `site_id` text NOT NULL,
  `type` text NOT NULL,
  `category` text NOT NULL,
  `title` text NOT NULL,
  `description` text,
  `amount` real NOT NULL,
  `date` text NOT NULL,
  `payment_method` text NOT NULL DEFAULT 'BANK',
  `receipt_no` text,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`)
);

CREATE INDEX IF NOT EXISTS `idx_transactions_site_date` ON `transactions` (`site_id`, `date`);

-- Topluluk & Grup Sohbet Kanalları
CREATE TABLE IF NOT EXISTS `community_channels` (
  `id` text PRIMARY KEY NOT NULL,
  `site_id` text NOT NULL,
  `name` text NOT NULL,
  `slug` text NOT NULL,
  `description` text,
  `icon` text NOT NULL DEFAULT 'MessageSquare',
  `is_announcement_only` integer NOT NULL DEFAULT 0,
  `sort_order` integer NOT NULL DEFAULT 0,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`)
);

CREATE INDEX IF NOT EXISTS `idx_community_channels_site` ON `community_channels` (`site_id`);

-- Site İçi Anketler
CREATE TABLE IF NOT EXISTS `community_polls` (
  `id` text PRIMARY KEY NOT NULL,
  `site_id` text NOT NULL,
  `channel_id` text NOT NULL,
  `created_by` text NOT NULL,
  `question` text NOT NULL,
  `options` text NOT NULL DEFAULT '[]',
  `expires_at` text,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`),
  FOREIGN KEY (`channel_id`) REFERENCES `community_channels`(`id`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`)
);

CREATE INDEX IF NOT EXISTS `idx_community_polls_channel` ON `community_polls` (`channel_id`);

-- Anket Oyları
CREATE TABLE IF NOT EXISTS `community_poll_votes` (
  `id` text PRIMARY KEY NOT NULL,
  `poll_id` text NOT NULL,
  `user_id` text NOT NULL,
  `option_index` integer NOT NULL,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (`poll_id`) REFERENCES `community_polls`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);

CREATE UNIQUE INDEX IF NOT EXISTS `idx_community_poll_vote_unique` ON `community_poll_votes` (`poll_id`, `user_id`);

-- Komşuluk Mesajları
CREATE TABLE IF NOT EXISTS `community_messages` (
  `id` text PRIMARY KEY NOT NULL,
  `site_id` text NOT NULL,
  `channel_id` text NOT NULL,
  `user_id` text NOT NULL,
  `content` text NOT NULL,
  `image_url` text,
  `is_pinned` integer NOT NULL DEFAULT 0,
  `poll_id` text,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`),
  FOREIGN KEY (`channel_id`) REFERENCES `community_channels`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`poll_id`) REFERENCES `community_polls`(`id`)
);

CREATE INDEX IF NOT EXISTS `idx_community_messages_channel_date` ON `community_messages` (`channel_id`, `created_at`);

