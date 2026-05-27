-- Mevcut D1 / SQLite veritabanları için (tek seferlik).
-- Cloudflare: npx wrangler d1 execute siteyonetim-db --remote --file=drizzle/patch-account-security.sql

ALTER TABLE users ADD COLUMN account_changes_count integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS email_verification_codes (
  id text PRIMARY KEY NOT NULL,
  user_id text NOT NULL,
  code_hash text NOT NULL,
  purpose text NOT NULL DEFAULT 'account_change',
  expires_at text NOT NULL,
  created_at text DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
