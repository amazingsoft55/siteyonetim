#!/usr/bin/env node
// =============================================================================
// Tüm seed: site + admin + özellikler + paketler
// =============================================================================
// Kullanım:
//   node scripts/seed-all.mjs
//
// Giriş: mustafakeskin2655@gmail.com / M.ustafa536
// =============================================================================

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const bcrypt = require("bcryptjs");
const crypto = require("crypto");

function uuid() {
  return crypto.randomUUID().replace(/-/g, "").toLowerCase();
}

const passwordHash = bcrypt.hashSync("M.ustafa536", 10);
const siteId = uuid();
const userId = uuid();

// Platform özellikleri
const allFeatures = [
  { id: uuid(), name: "Aidat Takibi", description: "Aidat borçlarınızı ve ödemelerinizi takip edin", category: "Aidat Yönetimi", sortOrder: 0 },
  { id: uuid(), name: "Otomatik Hatırlatma", description: "Geciken aidatlar için otomatik bildirim", category: "Aidat Yönetimi", sortOrder: 1 },
  { id: uuid(), name: "Dekont Yükleme", description: "Ödeme dekontlarını sisteme yükleyin", category: "Aidat Yönetimi", sortOrder: 2 },
  { id: uuid(), name: "Duyuru Yönetimi", description: "Site sakinlerine duyuru gönderin", category: "Duyuru Sistemi", sortOrder: 3 },
  { id: uuid(), name: "Kategori Duyuruları", description: "Duyuruları kategorilere ayırın", category: "Duyuru Sistemi", sortOrder: 4 },
  { id: uuid(), name: "Arıza Talebi", description: "Arıza ve bakım talepleri oluşturun", category: "Talep Yönetimi", sortOrder: 5 },
  { id: uuid(), name: "Talep Takibi", description: "Taleplerin durumunu takip edin", category: "Talep Yönetimi", sortOrder: 6 },
  { id: uuid(), name: "Talep Kategorileri", description: "Talepleri kategorilere ayırın", category: "Talep Yönetimi", sortOrder: 7 },
  { id: uuid(), name: "Aylık Rapor", description: "Aylık aidat ve ödeme raporları", category: "Raporlama", sortOrder: 8 },
  { id: uuid(), name: "Gelir/Gider Grafiği", description: "Gelir ve gider grafiklerini görüntüleyin", category: "Raporlama", sortOrder: 9 },
  { id: uuid(), name: "Push Bildirimi", description: "Anlık mobil bildirimler", category: "Bildirimler", sortOrder: 10 },
  { id: uuid(), name: "E-posta Bildirimi", description: "E-posta ile bildirim gönderimi", category: "Bildirimler", sortOrder: 11 },
  { id: uuid(), name: "SMS Bildirimi", description: "SMS ile bildirim gönderimi", category: "Bildirimler", sortOrder: 12 },
  { id: uuid(), name: "Mobil Uygulama (PWA)", description: "Tarayıcıdan yüklenen mobil uygulama", category: "Mobil", sortOrder: 13 },
  { id: uuid(), name: "Web Paneli", description: "Tarayıcı üzerinden yönetim paneli", category: "Genel", sortOrder: 14 },
  { id: uuid(), name: "Çoklu Site", description: "Birden fazla siteyi aynı anda yönetin", category: "Genel", sortOrder: 15 },
  { id: uuid(), name: "API Erişimi", description: "Harici entegrasyonlar için API", category: "Genel", sortOrder: 16 },
  { id: uuid(), name: "Öncelikli Destek", description: "Hızlı teknik destek", category: "Destek", sortOrder: 17 },
  { id: uuid(), name: "Dedicated Hesap Yöneticisi", description: "Size özel hesap yöneticisi", category: "Destek", sortOrder: 18 },
  { id: uuid(), name: "SLA Garanti", description: "Hizmet seviyesi garanti süresi", category: "Genel", sortOrder: 19 },
];

// Paketler (özellik ID'leri ile)
const plan1Features = allFeatures.filter((f) => [0, 1, 2, 3, 4, 5, 6, 7, 14].includes(f.sortOrder)).map((f) => f.id);
const plan2Features = allFeatures.filter((f) => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 17].includes(f.sortOrder)).map((f) => f.id);
const plan3Features = allFeatures.map((f) => f.id);

const sql = `
-- İlk site
INSERT OR IGNORE INTO sites (id, name, address) VALUES ('${siteId}', 'Site Yönetimi Demo', NULL);

-- Süper yönetici
INSERT OR IGNORE INTO users (id, name, email_or_phone, password_hash, role, site_id, must_change_password, created_at) VALUES ('${userId}', 'Mustafa Keskın', 'mustafakeskin2655@gmail.com', '${passwordHash}', 'SUPER_ADMIN', '${siteId}', 0, datetime('now'));

-- Platform özellikleri
${allFeatures.map((f) => `INSERT OR IGNORE INTO features (id, name, description, category, sort_order, active) VALUES ('${f.id}', '${f.name}', '${f.description}', '${f.category}', ${f.sortOrder}, 1);`).join('\n')}

-- Fiyatlandırma paketleri
INSERT OR IGNORE INTO plans (id, name, description, price, original_price, period, feature_ids, highlight, badge, cta, sort_order, active) VALUES ('${uuid()}', 'Başlangıç', 'Küçük siteler için ideal', 49, 99, '/ay', '${JSON.stringify(plan1Features)}', 0, NULL, '14 Gün Ücretsiz Dene', 0, 1);

INSERT OR IGNORE INTO plans (id, name, description, price, original_price, period, feature_ids, highlight, badge, cta, sort_order, active) VALUES ('${uuid()}', 'Profesyonel', 'Büyüyen siteler için en popüler', 99, 199, '/ay', '${JSON.stringify(plan2Features)}', 1, 'En Popüler', 'Hemen Başla', 1, 1);

INSERT OR IGNORE INTO plans (id, name, description, price, original_price, period, feature_ids, highlight, badge, cta, sort_order, active) VALUES ('${uuid()}', 'Kurumsal', 'Çoklu site yönetimi için', 199, 399, '/ay', '${JSON.stringify(plan3Features)}', 0, NULL, 'İletişime Geçin', 2, 1);
`;

console.log("=".repeat(60));
console.log("SEED BAŞARILI!");
console.log("=".repeat(60));
console.log("");
console.log("Giriş bilgileri:");
console.log("  Email: mustafakeskin2655@gmail.com");
console.log("  Şifre: M.ustafa536");
console.log("");
console.log("Özellik sayısı:", allFeatures.length);
console.log("Paket sayısı: 3");
console.log("");
console.log("=".repeat(60));

import { writeFileSync } from "fs";
writeFileSync("drizzle/seed-generated.sql", sql);
console.log("SQL dosyası oluşturuldu: drizzle/seed-generated.sql");
console.log("");
console.log("Çalıştır:");
console.log("  sqlite3 data/siteyonetim.db < drizzle/seed-generated.sql");
