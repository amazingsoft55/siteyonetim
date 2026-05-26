This is a [Next.js](https://nextjs.org) application deployed on Cloudflare (**D1** veritabanı, `@cloudflare/next-on-pages`).

## İlk kurulum (özet)

Bu projede **giriş ve API’lar D1 gerektirir**. Boş veritabanında önce şema, sonra seed uygulanmalıdır.

1. **Şema** (tüm tablolar tek dosyada: `drizzle/full-schema.sql`):

```bash
npm run db:apply:local
```

Uzak D1 için: `npm run db:apply:remote`

2. **İlk kurulum (seed)** — Cloudflare Secrets veya yerelde `.dev.vars` içinde tanımlayın (`env.example`):  
   `INITIAL_SUPER_ADMIN_LOGIN`, `INITIAL_SUPER_ADMIN_PASSWORD` (≥8 karakter), `INITIAL_SITE_NAME`  
   İsteğe bağlı: `INITIAL_SITE_ADDRESS`, `INITIAL_SUPER_ADMIN_NAME`  
   Ardından tarayıcıda **`/api/seed`** (GET, bir kez). Yanıtta şifre dönmaz; giriş yalnızca tanımladığınız D1 kullanıcısı ile yapılır.

3. **Giriş** — **`/login`** ile veritabanındaki kullanıcı. Süper yönetici paneli: **`/super-admin`**  
   Yerel bağlantı teşhisi: **`/api/setup/status`** ve rehber: **`/kurulum`**.

Yerelde `npm run dev` sırasında D1 bağlamı için `next.config.mjs` içinde **`setupDevPlatform`** kullanılır (`@cloudflare/next-on-pages/next-dev`). Sorun çıkarsa ortam dosyasında `SKIP_DEV_PLATFORM=1` ile devre dışı bırakılabilir (D1 bağlanmaz; sadece teşhis).

**D1 konsolunda sorgular 0:** Uygulama gerçekte bu D1 ile konuşmuyor olabilir (Workers dışında çalışan site, bağlama eksik veya bağlama adı `DB` değil). Ayrıntı: **`/kurulum`** bölüm 4 ve **`/api/setup/status`**.

## Getting Started (geliştirme sunucusu)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Cloudflare (kısa)

**Hata nedeni:** `npx wrangler deploy` bir **Worker ana dosyası** (`main`) veya **varlık dizini** (`[assets]`) ister; sadece `next build` **Next-on‑Pages çıktısı üretmez** (`.vercel/output/static`), bu yüzden önce **`npm run pages:build`** gerekir.

- **Workers & Pages → Workers (Workers Builds)** — panelde Deploy varsayılanı `npx wrangler deploy`:
  - **Build:** `npm run pages:build`
  - **Deploy:** `npx wrangler deploy` (veya **`npm run deploy:workers`**)
  - Hepsi tek satır: **`npm run cf:workers`**

  `wrangler.toml` içinde **`main = .vercel/output/static/_worker.js`** ve **`[assets]`** ile bu akış uyumludur (Cloudflare’nin Pages Functions → Workers geçiş modeli).

- **Cloudflare Pages (Git ile classic Pages pipeline):**
  - **Build:** `npm run pages:build`
  - **Deploy:** **`npm run deploy:cf`** veya **`npm run cf:publish`**

- **Build alanını hiç dokunmadan düzeltmek:** Deploy = **`npm run cf:workers`** (önce **`pages:build`**, sonra **`wrangler deploy`**). Üretim görüntüsünde `next build` iki kez tetiklenebilir; daha temiz olan yukarıdaki “Build + Deploy” ayrımıdır.

### SEO ve ortam değişkenleri

Üretimde **`NEXT_PUBLIC_SITE_URL`** kök adresinizi ayarlayın (bkz. `env.example`). Sitemap, robots, kanonik bağlantılar, Open Graph ve JSON-LD bu değişkene güvenir.

### D1: platform destek talepleri tablosu

Yöneticilerden süper admin’e talepler için `drizzle/0002_admin_support_tickets.sql` dosyasını D1 üzerinde çalıştırın:

```bash
npx wrangler d1 execute siteyonetim-db --remote --file=./drizzle/0002_admin_support_tickets.sql
```
