# Site Yönetimi

Modern [Next.js](https://nextjs.org/) (App Router) uygulaması — **gerçek ilişkisel veritabanı** (**SQLite**, dosya biçiminde), **JWT** ile oturum, PWA manifest’leri.

### Canlı sistem: veritabanı mı, “statik JSON” mu?

Bu proje **canlı kullanıcı / site / talep / duyuru** verilerini **sunucuda veritabanı dosyasında** tutar (**Drizzle ORM + `better-sqlite3`**). İstemcilere gelen **`application/json`** yanıtlar, REST API’nin DB’den okuduğu kayıtların serileştirilmesidir; paneller için kod içinde **gömülü sabit liste** kullanılmaz.

Canlı kullanımda gerekenler:

1. **Her zaman çalışan bir Node süreci** (`next build` sonrası `npm run start`).
2. **Kalıcı disk** üzerinde kalan bir `.db` dosyası — `DATABASE_PATH` veya varsayılan `data/siteyonetim.db`; konteyner/servis üretiminden sonra dosya kaybolmayacak volume veya klasör bağlayın.
3. İlk yayında bir kez şema yükleme: `npm run db:apply` (`drizzle/full-schema.sql`).

Yalnızca statik site barındırması (DB’siz CDN) veya kalıcı diski olmayan serverless ortam bu mimariyle **aynı canlı veritabanını** sunamaz; o durumda farklı barındırıcı veya farklı veri katmanı gerekir (README’deki Cloudflare başlığına bakın).

Sunucu API’leri dosya SQLite kullanır; barındırma modeli klasik bir **Node.js sürecidir**. Geçişken (her istekte sıfırlanan) filesystem sunan platformlar bu model için uygun değildir.

## Önkoşullar

- Node.js LTS  
- Projeyi ilk kez kurarken yerel araç zinciri gerekmez; `better-sqlite3` yaygün platformlar için ikili olarak dağıtılır

## Şema ve deme süper kullanıcı

Tüm DDL, indeksler ve varsayılan **tam deme içeriği** (**tek paket**, başka `.sql` yok):

- `drizzle/full-schema.sql`

Uygulama (API ile **aynı** SQLite dosyasını oluşturur):

```bash
npm install
npm run db:apply
```

Uygulanan deme oturumları (**üretimde mutlaka güncelleyin veya kullanıcıları silin**):

| Rol | Giriş (oturum) | Şifre |
|-----|----------------|-------|
| Süper admin | `yonetici@demo.local` | `Admin123!` |
| Site yöneticisi | `admin@demo.local` | `SiteAdmin123!` |
| Sakin | `sakin@demo.local` | `Sakin123!` |

Dosya şunları da ekler (tek SQL içinde): `sites`, `site_settings`, örnek duyuru, sakine bağlı borç kalemi (`payments`) ve açık talep (`requests`) — dashboard’ların boş olmaması için.

Şema yüklendiği hâlde tablolar boşsa `.env` değişkenleriyle **`GET /api/seed`** (bkz. `env.example`) de kullanılabilir.

## Geliştirme

```bash
npm run dev
```

Tarayıcı: http://localhost:3000  

- Giriş: `/login`
- Süper yönetici: `/super-admin` (kurulum uygun rol ile)
- Sağlık: `/api/setup/status`

## Ortam değişkenleri

`env.example` dosyasına bakın:

- **`DATABASE_PATH`** — boş ise `data/siteyonetim.db`
- **`JWT_SECRET`** — üretimde zorunlu
- **`NEXT_PUBLIC_SITE_URL`** — canonical, OG, SEO (üretim)
- **`GOOGLE_PAGESPEED_API_KEY`**, **`RESEND_API_KEY`** — isteğe bağlı entegrasyonlar

## Mimari özeti (`src/`)

| Bölüm | Açıklama |
|-------|----------|
| `server/database/access.ts` | Route’ların ortak bağlantı açması |
| `server/database/meta.ts` | Teşhis meta verisi |
| `db/schema.ts`, `db/index.ts` | Drizzle şeması ve SQLite bağlayıcı |
| `app/api/**` | REST endpoint’leri (`runtime = "nodejs"`) |

## Üretim (canlı)

```bash
npm run build
npm run start
```

- Sunucunun **aynı süre ömrü boyunca tek bir SQLite dosyası** kullanması gerekir: `DATABASE_PATH` veya varsayılan **`data/`** için kalıcı volume / mount (Docker: named volume veya bağlı klasör).
- Dağıtımdan sonra `DATABASE_UNAVAILABLE` görürseniz ilk kontrol: bu dosyanın yazılabildiği ve süreç yeniden başlayınca **aynı yol** üzerinde kaldığı yerdir.

### Cloudflare Workers / Pages ve `wrangler deploy`

**`npm run build` bu projede başarılı olur;** sorun çoğu zaman ikinci adımda çıkar:

- Pipeline’ınız **`npx wrangler deploy`** çalıştırıyorsa: Bu repo **standalone Next (`next start`) + disk üstü SQLite** içindir. Workers ortamında **kalıcı dosya SQLite** beklenen şekilde çalışmaz; Wrangler da sık sık **OpenNext** ile özel çıktı ister (`opennextjs-cloudflare build`).
- **`Cannot find package 'wrangler'`** (`@opennextjs/cloudflare migrate` / `populate-cache.js` sırasında): Wrangler ilk kurulumda **`npx`** ile **`@opennextjs/cloudflare`** indiriyor; paket projede yüklü değilse kopyası izole `_npx/...` ağacına gider ve oradan yapılan `import 'wrangler'` kök **`node_modules/wrangler`**’ı görmez — bu yüzden **`@opennextjs/cloudflare`** bu repoda doğrudan **`dependencies`** olarak tutulur (Wrangler **`npx`'i yerel sürümle** kullanır). **`wrangler`** da **`dependencies`** içinde kalmalı; **`package-lock.json`** her zaman repoya commit edilmelidir.
- Yukarısı düzelse bile **`better-sqlite3` ile dosya tabanlı SQLite**, Workers ortamında **güvenilir şekilde üretime uygun değildir.** Bu repo için **Önerilen:** Cloudflare **Deploy / production branch command** alanından **`npx wrangler deploy`’u kaldırın** — yalnızca `npm run build` kullanın — ve gerçek servisi **`npm run start`** veren kalıcı diski olan bir Node sunucunda çalıştırın. Geçici yeşil pipeline için Deploy komutu: **`npm run deploy:noop`** (yayınlamaz, yalnızca adımı geçirir).

**Ne yapmalı?**

| Hedef | Öneri |
|--------|--------|
| SQLite + mevcut kod | **Cloudflare’e `wrangler deploy` bağlamayın.** Node barındırıcı (kalıcı disk): ör. VPS, Railway/Render ile volume, Fly.io volume, Docker host. Kurulum: `npm ci`, `npm run build`, ilk deploy’da bir kez `npm run db:apply` veya doğrudan SQLite dosyanızı kopyalayın, sonra `npm run start`. |
| Mutlaka Cloudflare | Mimariyi değiştirmeniz gerekir: **OpenNext + Cloudflare** dokümantasyonuna göre derleme + **D1/Turso/Postgres** gibi Worker uyumlu veri katmanı. Bu repodaki `better-sqlite3` tek başına Workers’ta uygun değildir. |

### PWA

Ana manifest `public/manifest.json`; süper yönetici için `manifest-super-admin.json` ve `/super-admin` layout kullanılıyor. Raster logo isterseniz isteğe bağlı olarak `public/logo.png` ekleyin — arayüzde `SiteLogo` önce bunu dener; yoksa `public/icons/app-mark.svg` yüklenir.

---

## drizzle-kit

Geliştirici konsolu için yapı tanımı:

```bash
npx drizzle-kit --help
```

`drizzle.config.ts` içindeki `url`, yerel SQLite dosyasıyla hizalıdır.
