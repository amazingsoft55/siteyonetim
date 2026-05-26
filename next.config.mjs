import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

/** Yerel `npm run dev` sırasında D1 ve diğer wrangler bağlarını taklit eder (getRequestContext çalışır). */
if (process.env.NODE_ENV === "development" && process.env.SKIP_DEV_PLATFORM !== "1") {
  try {
    await setupDevPlatform();
  } catch (e) {
    console.warn(
      "[siteyonetim] setupDevPlatform başarısız — `wrangler.toml` ve wrangler kurulumunu kontrol edin:",
      e,
    );
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@cloudflare/next-on-pages"],
};

export default nextConfig;
