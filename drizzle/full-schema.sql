-- Tam şema: boş D1 / yerel SQLite için tek seferde uygulayın.
--   Yerel:  npx wrangler d1 execute siteyonetim-db --local --file=./drizzle/full-schema.sql
--   Uzak:   npx wrangler d1 execute siteyonetim-db --remote --file=./drizzle/full-schema.sql
-- (0001_init.sql + 0002_admin_support_tickets.sql ile aynı tablolar; IF NOT EXISTS kullanır.)

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
  `created_at` text DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`)
);

CREATE UNIQUE INDEX IF NOT EXISTS `users_email_or_phone_unique` ON `users` (`email_or_phone`);

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
  `created_at` text DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`)
);

CREATE TABLE IF NOT EXISTS `requests` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `site_id` text,
  `subject` text NOT NULL,
  `description` text NOT NULL,
  `status` text NOT NULL DEFAULT 'OPEN',
  `created_at` text DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`)
);

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
