-- =============================================================================
-- Site Yönetimi — TEK DOSYADA TÜM SQL (SQLite)
-- =============================================================================
--
-- Bu dosya hem tablo oluşturur hem varsayılan / deme verisini içerir. Başka
-- SQL kaynağı yoktur: `npm run db:apply` yalnızca bunu çalıştırır (API bağlantısı
-- Drizzle ile aynı SQLite dosyasını kullanır).
--
-- Bölümler:
--
--   [A] OPSİYONEL sıfırlama (DROP): varsayılan kapalı — gerekiyorsa yorumları kaldırın.
--   [B] Şema (CREATE IF NOT EXISTS + indeksler)
--   [C] Deme site + üç kullanıcı (üretimde şifreleri değiştirin)
--   [D] Deme ayarlar, duyuru, örnek borç kalemi ve talep
--
-- Yerelde çalıştırma:
--   npm run db:apply
--
-- =============================================================================

-- -----------------------------------------------------------------------------
-- [A] TÜM TABLOLARI SİL (sıfırlama) — varsayılan kapalı
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
  `created_at` text DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`)
);

CREATE UNIQUE INDEX IF NOT EXISTS `users_email_or_phone_unique` ON `users` (`email_or_phone`);

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

-- -----------------------------------------------------------------------------
-- [C] Deme kullanıcılar ve demo sitesi — bcrypt ile (düz metin saklanmaz)
-- -----------------------------------------------------------------------------
-- Süper admin:          yonetici@demo.local   — Admin123!
-- Site admin:           admin@demo.local      — SiteAdmin123!
-- Sakin:                sakin@demo.local      — Sakin123!
-- ÜRETİMDE ilk girişten sonra bunları panele uygun güvenli şifrelerle değiştirin.

INSERT OR IGNORE INTO `sites` (`id`, `name`, `address`) VALUES (
  'seed-site-001',
  'Demo Sitesi',
  'Örnek Mah. Güvenlik Sok. No 1 — İstanbul'
);

INSERT OR IGNORE INTO `users` (
  `id`,
  `name`,
  `email_or_phone`,
  `password_hash`,
  `role`,
  `site_id`,
  `apartment_no`,
  `must_change_password`
) VALUES (
  'seed-super-admin-001',
  'Demir Süper Yönetici',
  'yonetici@demo.local',
  '$2b$10$MuBfPOngwL5IPpP9ZyZkq.ePPoFSHDYnzIevjpoDbtYs7JDmONypC',
  'SUPER_ADMIN',
  NULL,
  NULL,
  0
);

INSERT OR IGNORE INTO `users` (
  `id`,
  `name`,
  `email_or_phone`,
  `password_hash`,
  `role`,
  `site_id`,
  `apartment_no`,
  `must_change_password`
) VALUES (
  'seed-admin-001',
  'Demo Site Yöneticisi',
  'admin@demo.local',
  '$2b$10$FOHIsJRPZgsftrf6PboUbuYmLEuogY6ZvnvHShF0G1I68VPRunZbq',
  'ADMIN',
  'seed-site-001',
  NULL,
  0
);

INSERT OR IGNORE INTO `users` (
  `id`,
  `name`,
  `email_or_phone`,
  `password_hash`,
  `role`,
  `site_id`,
  `apartment_no`,
  `must_change_password`
) VALUES (
  'seed-user-001',
  'Demo Sakin',
  'sakin@demo.local',
  '$2b$10$Q8pyZqZ5upi3yX.bzGvmpeAKOReTpBiGV9kSvRliFUOHpeZ1IAkEO',
  'USER',
  'seed-site-001',
  'A-1',
  0
);

-- -----------------------------------------------------------------------------
-- [D] Deme iş verisi — panelde boş liste görmemeniz için örnek satırlar
-- -----------------------------------------------------------------------------

INSERT OR IGNORE INTO `site_settings` (
  `site_id`,
  `default_aidat`,
  `manager_name`,
  `iban`,
  `bank_name`,
  `phone`,
  `updated_at`
) VALUES (
  'seed-site-001',
  '950',
  'Demo Yöneticisi',
  'TR00 0000 0000 0000 0000 0000 01',
  'Demo Bankası AŞ',
  '+90 212 000 00 00',
  CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO `announcements` (`id`, `site_id`, `title`, `content`, `category`) VALUES (
  'seed-announcement-001',
  'seed-site-001',
  'Hoş geldiniz — veritabanı canlı bağlantılı çalışıyor',
  'Bu metin doğrudan SQLite tablosundan okunur (statik JSON dosyası değildir). Üretimde duyuruları yönetim panelinden düzenlersiniz.',
  'Genel'
);

INSERT OR IGNORE INTO `payments` (
  `id`,
  `user_id`,
  `site_id`,
  `amount`,
  `title`,
  `status`,
  `due_date`
) VALUES (
  'seed-payment-001',
  'seed-user-001',
  'seed-site-001',
  950.00,
  'Mart aidat ödemesi',
  'UNPAID',
  date('now', '+14 day')
);

INSERT OR IGNORE INTO `requests` (
  `id`,
  `user_id`,
  `site_id`,
  `subject`,
  `description`,
  `category`,
  `status`
) VALUES (
  'seed-request-001',
  'seed-user-001',
  'seed-site-001',
  'Örnek arıza kaydı',
  'Asansör aydınlatması arızalı bildirilmiştir. Bu talep SQLite üzerinden listelenir.',
  'Arıza',
  'OPEN'
);
