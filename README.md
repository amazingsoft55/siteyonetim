# Site Yönetimi

Modern [Next.js](https://nextjs.org/) (App Router) uygulaması — **gerçek ilişkisel veritabanı** (**SQLite**, dosya biçiminde), **JWT** ile oturum, PWA manifest’leri.

### Canlı sistem: veriler nerede?

Üretimde tüm liste ve kayıtlar **Drizzle ORM** ile saklanır; istemcilere gelen JSON **sunucunun veritabanından okunan satırların** çıktısıdır (sabit “mock” listeler yok).

İki barındırma yolu desteklenir:

1. **Node + dosya SQLite** (`better-sqlite3`) — `npm run db:apply` ile `drizzle/full-schema.sql` uygulanır; `DATABASE_PATH` veya `data/siteyonetim.db` kalıcı diskte kalır.

2. **Cloudflare Workers + D1** — `wrangler.toml` içindeki **`binding = "DB"`** üzerinden aynı şema Drizzle **`drizzle-orm/d1`** ile bağlanır. Şema yükleme: `npm run db:d1:remote`.

Kod **`getPlatformDb()`** ile önce Workers bağlamında D1 (`env.DB`), yoksa yerel SQLite’a düşer (`next.config.mjs` içinde `initOpenNextCloudflareForDev()` geliştirme için gerekli).

## Önkoşullar

- Node.js LTS  
- Projeyi ilk kez kurarken yerel araç zinciri gerekmez; `better-sqlite3` yaygün platformlar için ikili olarak dağıtılır

## Şema SQL (üretim verisi burada değil)

- **`drizzle/full-schema.sql`** — yalnızca tablolar ve indeksler (D1 veya yerel SQLite için aynı dosya).

### Yerel / VPS (dosya SQLite)

```bash
npm install
npm run db:apply
```

### Cloudflare D1 (canlı)

`wrangler.toml` içinde `database_id` ve `database_name` kendi D1 kaynağınıza göre güncellenmelidir. Oturum: `npx wrangler login`.

```bash
npm run db:d1:remote
```

Uygulama dağıtımı (OpenNext):

- Yerel tek komut: `npm run deploy` veya önizleme: `npm run preview`.
- **Cloudflare Workers Builds (panel varsayılanı):** Build = `npm run build`, Deploy = `npx wrangler deploy` yeterlidir. `WORKERS_CI=1` ortamında `npm run build` otomatik olarak **OpenNext** derlemesini çalıştırır (`.open-next/worker.js`); ardından Wrangler `opennextjs-cloudflare deploy` ile devam eder.
- Manuel: `npm run build:cf` veya `npm run ci:cloudflare`. Yerel Windows’ta OpenNext için WSL önerilir.

`GET /api/seed` — tablolar **tamamen boşken** `.env` ile ilk site + süper admin eklemek için (D1 uyumlu).

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
| `db/schema.ts`, `db/platform.ts`, `db/sqlite-internal.ts` | Drizzle şeması; D1 veya dosya SQLite bağlantısı |
| `app/api/**` | REST uçları (Cloudflare’de D1, Node’da dosya SQLite) |

## Üretim (canlı)

```bash
npm run build
npm run start
```

- Sunucunun **aynı süre ömrü boyunca tek bir SQLite dosyası** kullanması gerekir: `DATABASE_PATH` veya varsayılan **`data/`** için kalıcı volume / mount (Docker: named volume veya bağlı klasör).
- Dağıtımdan sonra `DATABASE_UNAVAILABLE` görürseniz ilk kontrol: bu dosyanın yazılabildiği ve süreç yeniden başlayınca **aynı yol** üzerinde kaldığı yerdir.

### Cloudflare Workers + D1

- Bu repo **OpenNext** (`@opennextjs/cloudflare`) ile Workers üzerinde çalışacak şekilde yapılandırılabilir; kökte **`wrangler.toml`** D1 bağını **`DB`** adıyla tanımlar (senin veritabanı kimliğinle).
- API route’lar **`await getPlatformDb()`** / **`await acquireDatabase()`** kullanır; Workers’ta **D1**, yerelde **dosya SQLite** devreye girer.
- Şema: `npm run db:d1:remote` (`drizzle/full-schema.sql`).
- Dağıtım: `npm run deploy` veya `npm run preview` (önce `npx wrangler login`).
- `better-sqlite3` yalnızca **Node yolu** içindir; paket Workers paketinden `serverExternalPackages` ile dışarıda bırakılır.

Eski not: Saf `npx wrangler deploy` + düz `.next` çıktısı bu mimariyle uyumlu değildir; OpenNext derlemesi gerekir.

### PWA

Ana manifest `public/manifest.json`; süper yönetici için `manifest-super-admin.json`. Uygulama logosu **`public/icons/app-mark.svg`** (web + mobil PWA ile aynı kaynak).

---

## drizzle-kit

Geliştirici konsolu için yapı tanımı:

```bash
npx drizzle-kit --help
```

`drizzle.config.ts` içindeki `url`, yerel SQLite dosyasıyla hizalıdır.
