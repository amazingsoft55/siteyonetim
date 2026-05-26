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

### PWA

Ana manifest `public/manifest.json`; süper yönetici için `manifest-super-admin.json` ve `/super-admin` layout kullanılıyor.

---

## drizzle-kit

Geliştirici konsolu için yapı tanımı:

```bash
npx drizzle-kit --help
```

`drizzle.config.ts` içindeki `url`, yerel SQLite dosyasıyla hizalıdır.
