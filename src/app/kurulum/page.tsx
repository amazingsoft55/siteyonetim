import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getPublicSiteUrl } from "@/lib/site-url";

const base = getPublicSiteUrl();

export const metadata: Metadata = {
  title: "Kurulum ve veritabanı",
  description:
    "Site Yönetimi: D1 şeması, yerel geliştirme, süper yönetici seed ve sık yapılan hataların çözümü.",
  alternates: { canonical: `${base}/kurulum` },
  robots: { index: true, follow: true },
};

export default function KurulumPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full space-y-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Profesyonel kurulum özeti</h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Bu arayüz ve API’lar <strong>Cloudflare D1</strong> üzerinden çalışır. Yerelde <code>npm run dev</code> kullanırken
            bağlam oluşturmak için projede{" "}
            <code className="text-sm bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded">next.config.mjs</code> içinde{" "}
            <code className="text-sm bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded">setupDevPlatform</code> tanımlıdır.
          </p>
        </div>

        <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold">1 · Veritabanı şeması (boş D1 için zorunlu)</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Tek dosyada tüm tablolar: <strong>drizzle/full-schema.sql</strong>
          </p>
          <div className="rounded-xl bg-zinc-950 dark:bg-black text-zinc-100 text-xs sm:text-sm p-4 overflow-x-auto font-mono">
            <p className="text-emerald-400 mb-2"># Yerel D1 (.wrangler/state)</p>
            <p>npx wrangler d1 execute siteyonetim-db --local --file=./drizzle/full-schema.sql</p>
            <p className="text-emerald-400 mt-4 mb-2"># Uzak Cloudflare D1</p>
            <p>npx wrangler d1 execute siteyonetim-db --remote --file=./drizzle/full-schema.sql</p>
          </div>
          <p className="text-xs text-zinc-500">
            Veritaban adınız farklıysa <code>wrangler.toml</code> içindeki <code>database_name</code> ile komuttaki adı değiştirin.
          </p>
        </section>

        <section className="rounded-2xl border border-indigo-200/70 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 p-6 space-y-3">
          <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">2 · Süper admin ve örnek site (seed)</h2>
          <p className="text-sm text-indigo-950/80 dark:text-indigo-100/85">
            Şema uygulandıktan sonra tarayıcıda{" "}
            <Link href="/api/seed" className="font-bold underline">
              GET /api/seed
            </Link>{" "}
            adresini açın. İlk kez oluşturur: örnek site + süper admin.
          </p>
          <ul className="text-sm list-disc pl-5 space-y-1 text-indigo-900/90 dark:text-indigo-200/90">
            <li>
              Varsayılan giriş (hemen üretimde değiştirin): <strong>superadmin</strong> / <strong>admin123</strong>
            </li>
            <li>
              Panele sonra <Link href="/super-admin/kullanicilar" className="underline font-semibold">Siteler ve kullanıcılar</Link> ile
              yönetici ve sakin hesapları açın.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-3">
          <h2 className="text-lg font-bold">3 · Yerel geliştirme ipuçları</h2>
          <ul className="text-sm space-y-2 text-zinc-600 dark:text-zinc-400 list-disc pl-5">
            <li>Giriş 503 ise canlı bağlam özeti için: <Link href="/api/setup/status" className="font-semibold text-indigo-600 dark:text-indigo-400 underline">/api/setup/status</Link></li>
            <li>
              <code>setupDevPlatform</code> çıkmıyorsa geçici:{" "}
              <code className="text-xs bg-zinc-200 dark:bg-zinc-800 px-1 rounded">SKIP_DEV_PLATFORM=1</code> (D1 bağlanmaz —
              kullanmayın; sorunu giderene kadar sadece teşhis).
            </li>
            <li>Üretime çıkmadan önce Cloudflare’in önerdiği gibi <code>npm run build</code> + <code>wrangler pages dev</code> ile de doğrulayın.</li>
          </ul>
        </section>

        <div className="flex flex-wrap gap-3 pt-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500"
          >
            Giriş sayfasına dön
          </Link>
          <Link
            href="/super-admin"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-zinc-300 dark:border-zinc-600 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Süper admin paneli (giriş gerekli)
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
