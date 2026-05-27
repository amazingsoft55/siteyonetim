-- =============================================================================
-- Manuel örnek: ilk site + süper yönetici (SQLite / Cloudflare D1)
-- =============================================================================
-- Uygulama şifreyi bcrypt (10 round) ile saklar; burada yalnızca hash kullanın.
--
-- Hash üretmek (proje kökünde, bağımlılıklar yüklüyken):
--   node -e "const b=require('bcryptjs'); console.log(b.hashSync('GÜÇLÜ_ŞİFRENİZ',10));"
--
-- Çıkan $2a$... veya $2b$... metnini aşağıdaki BCRYPT_HASH_YERİ satırına yapıştırın.
-- id / e-posta / site adını kendi değerlerinizle değiştirin.
-- Tablolar boşken veya e-posta çakışması olmadan çalıştırın.
-- =============================================================================

BEGIN TRANSACTION;

-- İlk site (id ve name’i özelleştirin)
INSERT INTO sites (id, name, address) VALUES (
  '11111111-1111-4111-8111-111111111111',
  'İlk site adı',
  NULL
);

-- Süper yönetici: site_id NULL, role SUPER_ADMIN
INSERT INTO users (
  id,
  name,
  email_or_phone,
  password_hash,
  role,
  site_id,
  apartment_no,
  last_login_at,
  must_change_password,
  created_at
) VALUES (
  '22222222-2222-4222-8222-222222222222',
  'Sistem yöneticisi',
  'superadmin@alanadiniz.com',
  'BCRYPT_HASH_YERİ',
  'SUPER_ADMIN',
  NULL,
  NULL,
  NULL,
  0,
  datetime('now')
);

COMMIT;
