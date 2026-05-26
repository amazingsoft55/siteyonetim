-- Yöneticilerden süper admin'e destek talepleri (schema ile uyumlu)
-- Çalıştırma: wrangler d1 execute ... --file=./drizzle/0002_admin_support_tickets.sql

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
