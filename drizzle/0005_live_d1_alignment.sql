-- Canlı yapı (mevcut D1 için bir kez). Yeni kurulumlar full-schema.sql ile zaten kapsamlıdır.
ALTER TABLE announcements ADD COLUMN category text;
ALTER TABLE requests ADD COLUMN category text;

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
