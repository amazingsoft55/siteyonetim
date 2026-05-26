-- siteyonetim D1 ilk şema (src/db/schema.ts ile uyumlu)
-- Çalıştırma:
--   1) Cloudflare D1 Studio > Query içine yapıştır → Run
--   2) veya: npx wrangler d1 execute siteyonetim-db --remote --file=./drizzle/0001_init.sql

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
