# Site Yönetimi

Modern [Next.js](https://nextjs.org/) (App Router) uygulaması — **SQLite** dosya veritabanı, **JWT** ile oturum, modern PWA katmanı için manifest’ler.

Sunucu API’leri `better-sqlite3` kullanır; barındırma modeli klasik bir **Node.js sürecidir** (`next build` → `next start`). Kalıcı disk üzerinde tek bir `.db` dosyası tutulur — sunucunun dosya sisteminin kalıcı olması beklenir (geçişken serverless görüntüleri için uygun değildir).

## Önkoşullar

- Node.js LTS  
- Projeyi ilk kez kurarken yerel araç zinciri gerekmez; `better-sqlite3` yaygün platformlar için ikili olarak dağıtılır

## Şema ve deme süper kullanıcı

Tüm DDL ve isteğe bağlı ilk yönetici kaydı **tek pakette**:

- `drizzle/full-schema.sql`

Uygulama:

```bash
npm install
npm run db:apply
```

Dosya içinde `[C]` bölümü uygulanırsa deme oturumu:

| Alan | Değer |
|------|-------|
| Giriş (e‑posta) | `yonetici@demo.local` |
| Şifre | `Admin123!` |

Üretimde bunları ilk girişten sonra panelden güvenli şekilde güncelleyin.

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

## Üretim

```bash
npm run build
npm run start
```

`DATABASE_PATH` veya varsayılan `data/` klasörünü kalıcı volume veya dizine bağlayın.

### Cloudflare Workers / Pages ve `wrangler deploy`

**`npm run build` bu projede başarılı olur;** sorun çoğu zaman ikinci adımda çıkar:

- Pipeline’ınız **`npx wrangler deploy`** çalıştırıyorsa: Bu repo **standalone Next (`next start`) + disk üstü SQLite** içindir. Workers ortamında **kalıcı dosya SQLite** beklenen şekilde çalışmaz; Wrangler da sık sık **OpenNext** ile özel çıktı ister (`opennextjs-cloudflare build`).
- **`Cannot find package 'wrangler'`** (`@opennextjs/cloudflare migrate` sırasında): `wrangler` bu projede **`dependencies`** içindedir — bazı ortamlarda `npm ci --omit=dev` veya üretim modu yüzünden `devDependencies` yüklenmezdi; böyle çözülür. **`package-lock.json` her zaman repo ile birlikte commit edilmelidir.**
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
