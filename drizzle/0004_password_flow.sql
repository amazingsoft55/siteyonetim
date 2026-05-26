-- Kalıcı şifre zorunluluğu + süper yönetici e-posta ile şifre sıfırlama

ALTER TABLE users ADD COLUMN must_change_password integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `token` text NOT NULL UNIQUE,
  `expires_at` text NOT NULL,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);

CREATE INDEX IF NOT EXISTS `idx_password_reset_tokens_user` ON `password_reset_tokens` (`user_id`);
