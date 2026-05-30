-- =============================================================================
-- Süper yönetici + ilk site (otomatik ID)
-- =============================================================================
-- Kullanım:
--   Yerel SQLite:    sqlite3 data/siteyonetim.db < drizzle/seed-super-admin.sql
--   Cloudflare D1:   wrangler d1 execute siteyon --remote --file drizzle/seed-super-admin.sql
--
-- Giriş: mustafakeskin2655@gmail.com / M.ustafa536
-- =============================================================================

BEGIN TRANSACTION;

-- İlk site (ID otomatik)
INSERT OR IGNORE INTO sites (id, name, address) VALUES (
  lower(hex(randomblob(16))),
  'Site Yönetimi Demo',
  NULL
);

-- Süper yönetici (ID otomatik, site_id ilk siteye bağlanır)
INSERT OR IGNORE INTO users (
  id,
  name,
  email_or_phone,
  password_hash,
  role,
  site_id,
  must_change_password,
  created_at
) VALUES (
  lower(hex(randomblob(16))),
  'Mustafa Keskın',
  'mustafakeskin2655@gmail.com',
  '$2b$10$hvGbssXBNWMToJNBp.R1lOTWtZw8JnBRPgYUxteXKoftWpfYQIpGi',
  'SUPER_ADMIN',
  (SELECT id FROM sites WHERE name = 'Site Yönetimi Demo' LIMIT 1),
  0,
  datetime('now')
);

COMMIT;
