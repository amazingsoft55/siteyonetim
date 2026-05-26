import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getPublicSiteUrl } from "@/lib/site-url";

const base = getPublicSiteUrl();

export const metadata: Metadata = {
  title: "Kurulum ve veritabanı",
  description:
    "Site Yönetimi: D1 şeması, yerel geliştirme, ilk kullanıcı (ortam + seed) ve sık yapılan hataların çözümü.",
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
          <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">2 · İlk site ve süper yönetici (seed)</h2>
          <p className="text-sm text-indigo-950/80 dark:text-indigo-100/85">
            Kodda sabit kullanıcı veya şifre yok. Yerelde <code className="text-xs bg-white/60 dark:bg-zinc-900/60 px-1 rounded">.dev.vars</code>,
            üretimde Cloudflare <strong>Secrets</strong> ile şu değişkenleri tanımlayın (bkz. <code>env.example</code>):
          </p>
          <ul className="text-sm list-disc pl-5 space-y-1 text-indigo-900/90 dark:text-indigo-200/90 font-mono text-xs sm:text-sm">
            <li>INITIAL_SUPER_ADMIN_LOGIN</li>
            <li>INITIAL_SUPER_ADMIN_PASSWORD (en az 8 karakter)</li>
            <li>INITIAL_SITE_NAME</li>
            <li className="list-none pl-0 text-indigo-800/80 dark:text-indigo-300/80 font-sans text-xs">
              İsteğe bağlı: INITIAL_SITE_ADDRESS, INITIAL_SUPER_ADMIN_NAME
            </li>
          </ul>
          <p className="text-sm text-indigo-950/80 dark:text-indigo-100/85">
            Şema uygulandıktan sonra tarayıcıda{" "}
            <Link href="/api/seed" className="font-bold underline">
              GET /api/seed
            </Link>{" "}
            çağrısı ilk siteyi ve süper yöneticiyi D1&apos;e yazar. Yanıtta şifre dönmez; giriş için yalnızca sizin
            belirlediğiniz oturum adı ve şifre geçerlidir.
          </p>
          <p className="text-sm text-indigo-950/80 dark:text-indigo-100/85">
            Ardından{" "}
            <Link href="/super-admin/kullanicilar" className="underline font-semibold">
              Siteler ve kullanıcılar
            </Link>{" "}
            üzerinden diğer yönetici ve sakin hesaplarını oluşturun.
          </p>
        </section>

        <section className="rounded-2xl border border-violet-200/70 dark:border-violet-900/40 bg-violet-50/30 dark:bg-violet-950/15 p-6 space-y-2">
          <h2 className="text-lg font-bold text-violet-900 dark:text-violet-100">3 · Şifre akışı (kalıcı şifre + e-posta)</h2>
          <p className="text-sm text-violet-950/85 dark:text-violet-100/80">
            D1&apos;de <code className="text-xs bg-white/60 dark:bg-zinc-900/50 px-1 rounded">drizzle/full-schema.sql</code> ile şema oluşturulur; içinde{" "}
            <code className="text-xs">must_change_password</code> sütunu ve <code className="text-xs">password_reset_tokens</code> tablosu yer alır.
          </p>
          <ul className="text-sm list-disc pl-5 text-violet-950/90 dark:text-violet-100/85 space-y-1">
            <li>
              Süper yönetici şifre sıfırlama: <Link href="/sifremi-unuttum" className="font-semibold underline">/sifremi-unuttum</Link> —{" "}
              <code className="text-[11px]">RESEND_API_KEY</code>, <code className="text-[11px]">EMAIL_FROM</code>,{" "}
              <code className="text-[11px]">NEXT_PUBLIC_SITE_URL</code> zorunlu.
            </li>
            <li>İlk giriş şifresi zorlaması: kullanıcıda <code className="text-[11px]">must_change_password=1</code> veya panelde “İlk girişte kalıcı şifre” seçeneği.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-3">
          <h2 className="text-lg font-bold">4 · Yerel geliştirme ipuçları</h2>
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

        <section className="rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-6 space-y-3">
          <h2 className="text-lg font-bold text-amber-950 dark:text-amber-100">5 · “Site oluşturulamadı” / D1’de sorgu sayısı 0</h2>
          <p className="text-sm text-amber-950/90 dark:text-amber-100/85 leading-relaxed">
            Kod, veritabanını yalnızca <strong>Cloudflare Workers içinde env.DB ile</strong> görür (<code className="text-xs bg-white/70 dark:bg-zinc-900/60 px-1 rounded">wrangler.toml</code>{" "}
            içinde binding adı tam olarak <code className="text-xs px-1">DB</code> ve <code className="text-xs px-1">database_id</code> doğru olmalı).
            Yerelde doğrudan <code>Vercel</code> veya <code>next start</code> ile yayınlıyorsanız D1 <strong>çalışmaz</strong>; panoda tablolar olsa bile uygulama sorgu göndermez.
          </p>
          <ul className="text-sm list-disc pl-5 space-y-2 text-amber-950/85 dark:text-amber-200/85">
            <li>
              Uygulamayı dağıttığınız Worker’a gidin → <strong>Bağlamalar</strong>: D1 içinde bir kayıt var mı? Değişken adı tam olarak{" "}
              <code className="text-[11px]">DB</code> olmalı.
            </li>
            <li>
              Repo kökünden <code className="text-xs bg-white/70 dark:bg-zinc-900/50 px-1 rounded">npm run build</code> (veya projenizdeki next-on-pages build) ardından{" "}
              <code className="text-xs bg-white/70 dark:bg-zinc-900/50 px-1 rounded">npx wrangler deploy</code> kullanın — böylece{" "}
              <code className="text-xs">wrangler.toml</code> içindeki D1 satırı Worker’a işlenir.
            </li>
            <li>
              Tarayıcıda <Link href="/api/setup/status" className="underline font-semibold">/api/setup/status</Link>{" "}
              açın; 503 ise mesajda <code className="text-[11px]">NO_CLOUDFLARE_CONTEXT</code> veya bağlama uyarısı görürsünüz.
              API tarafında 503 yanıtta <code className="text-[11px]">code</code> alanı da döner (<code className="text-[11px]">NO_DB_BINDING</code> vb.).
            </li>
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
