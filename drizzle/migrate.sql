-- =============================================================================
-- MIGRASYON: Mevcut DB'ye yeni kolon ve tabloları ekler
-- Veri SİLMEZ, sadece eksik parçaları ekler
-- Kullanım: sqlite3 data/siteyonetim.db < drizzle/migrate.sql
-- =============================================================================

-- announcements tablosuna images kolonu ekle (eğer yoksa)
-- SQLite'ta ALTER TABLE ADD COLUMN IF NOT EXISTS desteklenmez,
-- bu yüzden hata yakalayarak çalıştırırız.
-- Eğer zaten varsa "duplicate column" hatası verir ve devam eder.
CREATE TABLE IF NOT EXISTS `_announcements_backup` (
  `id` text PRIMARY KEY NOT NULL,
  `site_id` text,
  `title` text NOT NULL,
  `content` text NOT NULL,
  `category` text,
  `image_url` text,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP)
);

INSERT OR IGNORE INTO `_announcements_backup` SELECT `id`,`site_id`,`title`,`content`,`category`,`image_url`,`created_at` FROM `announcements`;

DROP TABLE IF EXISTS `announcements`;
CREATE TABLE `announcements` (
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

INSERT OR IGNORE INTO `announcements` SELECT `id`,`site_id`,`title`,`content`,`category`,`image_url`,`created_at`,`[]` FROM `_announcements_backup`;
DROP TABLE IF EXISTS `_announcements_backup`;

-- push_subscriptions tablosu (yeni)
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
