-- Süper admin canlı göstergeler: çevrimiçi yaklaşımı, Lighthouse önbelleği, genel görüntülemeler

ALTER TABLE users ADD COLUMN last_login_at text;

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
