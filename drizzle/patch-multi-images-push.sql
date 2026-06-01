-- Duyurulara çoklu görsel desteği
ALTER TABLE `announcements` ADD COLUMN `images` text DEFAULT '[]';

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
