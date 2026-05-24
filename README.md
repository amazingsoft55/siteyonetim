This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Cloudflare Workers Builds / Pages

Bu repo **[@cloudflare/next-on-pages](https://github.com/cloudflare/next-on-pages)** ile uyumludur.

1. **Build komutu:** `npm run build` (`next build` + `next-on-pages` ile `.vercel/output/static` üretilir.)
2. **Deploy komutu (Dashboard’daki ikinci adım):** **`npm run deploy:cf`** veya:

   ```bash
   npx wrangler pages deploy .vercel/output/static --project-name=siteyonetim
   ```

**`npx wrangler deploy`** bu projeye uygun değildir — standart Workers girişi / eski Workers Sites akışı `workers-site/index.js` bekler; Next‑on‑Pages çıktısı ise **`.vercel/output/static`** altında Pages için paketlenir. Yayın **`npm run deploy:cf`** (veya üstteki `wrangler pages deploy`) ile yapılmalıdır. `wrangler.toml` içinde kök dizinde D1 bağlamaları için `[[d1_databases]]` tanımlıdır; bağlar Pages projesinin ayarlarıyla da doğrulanmalıdır.

Üretim/önizleme ortamında **Functions uyumluluğu**: Cloudflare konsolunda `nodejs_compat` ve uygun compatibility date’nin tanımlı olduğundan emin olun (Next‑on‑Pages belgeleri).

## Cloudflare (iki GitHub reposu uyarısı)

Bu proje bağımlılıkları güncellenmiş olduğunda **`origin` (yerelde `amazingsoft55/siteyonetim`) ile Cloudflare’nin bağlı olduğu repo aynı olmalı.**

Cloudflare bağlantısı **başka bir GitHub reposuna** (`ör. MustafaKeskin55/siteyonetim`) aitse ve o repoda kod eskiyse derlemede sürekki `next@16` ile `next-on-pages` uyumsuzlukları görülür — çünkü orada **`package.json` hâlâ Next 16.2.6.** Çözüm: ya Cloudflare üzerinden deploy kaynağını güncellenmiş repoya bağlayın ya da aynı `main` dallarını iki repoya senkron (push/pr) yapın.
