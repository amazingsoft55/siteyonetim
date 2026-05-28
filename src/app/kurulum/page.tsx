import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { KurulumStatusPanel } from "@/components/KurulumStatusPanel";
import { getPublicSiteUrl } from "@/lib/site-url";

const base = getPublicSiteUrl();

export const metadata: Metadata = {
  title: "Kurulum ve veritabanı",
  description:
    "Site Yönetimi: SQLite veya Cloudflare D1 şema uygulama, ilk kurulum ve sık yapılan hataların çözümü.",
  alternates: { canonical: `${base}/kurulum` },
  robots: { index: false, follow: false },
};

export default function KurulumPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full space-y-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Kurulum rehberi</h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Bu sayfa hosting veya site teknik sorumluları içindir; canlı veritabanı durumu ve kurulum adımları burada gösterilir. Sakin giriş sayfasında bu bilgiler yer almaz.
          </p>
          <div className="mt-6">
            <KurulumStatusPanel />
          </div>
        </div>

        <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold">1 · Bağımlılıklar ve ortam</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Veri <strong>Drizzle ORM</strong> ile tutulur: yerelde <strong>SQLite dosyası</strong>, Cloudflare’de <strong>D1</strong> (
            <code className="text-xs">wrangler.toml</code> içinde <code className="text-xs">DB</code> bağlaması).
          </p>
          <ul className="text-sm space-y-2 text-zinc-600 dark:text-zinc-400 list-disc pl-5">
            <li>
              <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 rounded">npm install</code> — özellikle Windows’ta
              görsel C++ derleme araçları gerekmezse doğrudan indirilir; takılırsa resmi Node LTS kullanın.
            </li>
            <li>
              İsteğe bağlı: <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 rounded">.env</code> içinde{" "}
              <code className="text-xs">DATABASE_PATH</code> (boş ise <code className="text-xs">data/siteyonetim.db</code>).
            </li>
            <li>
              Üretim güvenliği: <code className="text-xs">JWT_SECRET</code> güçlü bir değer atayın;{" "}
              <code className="text-xs">NEXT_PUBLIC_SITE_URL</code> site kök adresinizi taşıır.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 p-6 space-y-4">
          <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">2 · SQL şema (D1 veya yerel SQLite)</h2>
          <p className="text-sm text-emerald-950/85 dark:text-emerald-100/85">
            <strong>Şema tek dosya:</strong> <strong>drizzle/full-schema.sql</strong> (yalnızca tablolar; üretim verisi buraya yazılmaz).
          </p>
          <div className="rounded-xl bg-zinc-950 dark:bg-black text-zinc-100 text-xs sm:text-sm p-4 overflow-x-auto font-mono space-y-2">
            <p className="text-emerald-400"># Yerel / VPS — dosya SQLite</p>
            <p>npm run db:apply</p>
            <p className="text-emerald-400 pt-2"># Cloudflare D1 (wrangler giriş gerekir)</p>
            <p>npm run db:d1:remote</p>
          </div>
        </section>

        <section className="rounded-2xl border border-indigo-200/70 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 p-6 space-y-3">
          <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">3 · Programatik ilk kurulum (boş DB)</h2>
          <p className="text-sm text-indigo-950/80 dark:text-indigo-100/85">
            Tablolar boşken <code className="text-xs">env.example</code> ile tanımladığınız ortam değişkenleriyle{" "}
            <Link href="/api/seed" className="font-bold underline">
              GET /api/seed
            </Link>{" "}
            çağrısı ilk site ve süper yöneticiyi oluşturur.
          </p>
        </section>

        <section className="rounded-2xl border border-violet-200/70 dark:border-violet-900/40 bg-violet-50/30 dark:bg-violet-950/15 p-6 space-y-2">
          <h2 className="text-lg font-bold text-violet-900 dark:text-violet-100">4 · Çalıştırma ve teşhis</h2>
          <ul className="text-sm list-disc pl-5 text-violet-950/90 dark:text-violet-100/85 space-y-1">
            <li>
              Yerel uygulama: <code className="text-xs bg-white/60 dark:bg-zinc-900/50 px-1 rounded">npm run dev</code>
            </li>
            <li>
              Sağlık özeti:{" "}
              <Link href="/api/setup/status" className="font-semibold underline">
                /api/setup/status
              </Link>
            </li>
            <li>
              Üretim: <code className="text-xs">npm run build</code> ardından <code className="text-xs">npm run start</code> — veritabanı dosyası
              barındırıcıda kalıcı bir disk veya mount üzerinde olmalıdır.
            </li>
          </ul>
        </section>

        <section
          id="mobil"
          className="scroll-mt-24 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-4 shadow-sm"
        >
          <h2 className="text-lg font-bold">5 · Mobil uygulama (Android / iOS APK)</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Sakin ve site yöneticileri için <strong>Site Yönetimi</strong>; platform süper yöneticisi için ayrı paket (
            <strong>SY Süper Yönetici</strong>). Capacitor ile native kabuk üretilir; canlı site adresi{" "}
            <code className="text-xs">CAPACITOR_SERVER_URL</code> veya <code className="text-xs">NEXT_PUBLIC_SITE_URL</code> ile
            verilir.
          </p>
          <div className="rounded-xl bg-zinc-950 dark:bg-black text-zinc-100 text-xs sm:text-sm p-4 overflow-x-auto font-mono space-y-2">
            <p className="text-emerald-400"># İlk kez (Capacitor platformları)</p>
            <p>npm run mobile:setup</p>
            <p className="text-emerald-400 pt-2"># Site uygulaması — Android Studio</p>
            <p>npm run mobile:sync</p>
            <p>npm run mobile:android</p>
            <p className="text-emerald-400 pt-2"># Süper yönetici — ayrı paket</p>
            <p>npm run mobile:sync:super</p>
            <p>npm run mobile:android:super</p>
          </div>
          <ul className="text-sm list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>
              Play Store veya APK indirme linki (sakin/yönetici):{" "}
              <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 rounded">NEXT_PUBLIC_SITE_DOWNLOAD_ANDROID</code>
            </li>
            <li>
              Süper yönetici APK / Play:{" "}
              <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 rounded">NEXT_PUBLIC_SUPER_DOWNLOAD_ANDROID</code>
            </li>
            <li>
              Cloudflare Workers ortam değişkenlerine ekleyip yeniden deploy edin; ana sayfadaki Android düğmesi otomatik
              mağaza/APK adresine gider.
            </li>
          </ul>
        </section>

        <section
          id="gmail"
          className="scroll-mt-24 rounded-2xl border border-sky-200/70 dark:border-sky-900/50 bg-sky-50/30 dark:bg-sky-950/20 p-6 space-y-4"
        >
          <h2 className="text-lg font-bold text-sky-900 dark:text-sky-100">6 · E-posta (Google Gmail)</h2>
          <p className="text-sm text-sky-950/85 dark:text-sky-100/85 leading-relaxed">
            Şifre sıfırlama ve bildirimler <strong>ccode4779@gmail.com</strong> üzerinden Gmail API ile gider; maillerde{" "}
            <strong>Site Yönetimi logosu</strong> kullanılır. Cloudflare Workers SMTP desteklemediği için OAuth refresh token
            gerekir (Resend yalnızca yedek).
          </p>
          <ol className="text-sm list-decimal pl-5 space-y-2 text-sky-950/90 dark:text-sky-100/90">
            <li>
              <a href="https://console.cloud.google.com" className="font-bold underline" target="_blank" rel="noreferrer">
                Google Cloud Console
              </a>{" "}
              → yeni proje → <strong>Gmail API</strong> etkinleştir
            </li>
            <li>
              OAuth consent screen → External → test kullanıcısı olarak Gmail adresinizi ekleyin
            </li>
            <li>Credentials → OAuth client ID → <strong>Desktop app</strong></li>
            <li>
              Yerelde: <code className="text-xs bg-white/60 dark:bg-zinc-900/50 px-1 rounded">GMAIL_CLIENT_ID</code> ve{" "}
              <code className="text-xs bg-white/60 dark:bg-zinc-900/50 px-1 rounded">GMAIL_CLIENT_SECRET</code> tanımlayıp{" "}
              <code className="text-xs bg-white/60 dark:bg-zinc-900/50 px-1 rounded">npm run gmail:setup</code>
            </li>
            <li>
              Çıkan <code className="text-xs">GMAIL_REFRESH_TOKEN</code> ve{" "}
              <code className="text-xs">GMAIL_FROM=ccode4779@gmail.com</code> değerlerini Cloudflare Workers → Variables
              bölümüne ekleyin
            </li>
          </ol>
        </section>

        <section className="rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-6 space-y-3">
          <h2 className="text-lg font-bold text-amber-950 dark:text-amber-100">7 · Sık hatalar</h2>
          <ul className="text-sm list-disc pl-5 space-y-2 text-amber-950/85 dark:text-amber-200/85">
            <li>
              <strong>503 / DATABASE_UNAVAILABLE:</strong> Yerelde dosya SQLite: <code className="text-xs">npm install</code>, şema için{" "}
              <code className="text-xs">npm run db:apply</code>, <code className="text-xs">DATABASE_PATH</code> ve klasör izinleri. Cloudflare D1:
              Worker’da <code className="text-xs">DB</code> bağlaması (<code className="text-xs">wrangler.toml</code>) ve{" "}
              <code className="text-xs">npm run db:d1:remote</code> ile tabloların oluşturulmuş olması gerekir.
            </li>
            <li>
              <strong>no such table:</strong> Yerelde <code className="text-xs">npm run db:apply</code>; D1’de{" "}
              <code className="text-xs">npm run db:d1:remote</code> ile <code className="text-xs">full-schema.sql</code> henüz uygulanmamış olabilir.
            </li>
            <li>
              <strong>Cloudflare Workers:</strong> Uygulama <strong>D1</strong> ile bağlanır — kalıcı dosya SQLite değildir;{" "}
              <code className="text-xs">better-sqlite3</code> yalnızca yerel/VPS kod yolunda çalışır.
            </li>
          </ul>
        </section>

        <div className="flex flex-wrap gap-3 pt-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500"
          >
            Giriş sayfası
          </Link>
          <Link
            href="/super-admin"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-zinc-300 dark:border-zinc-600 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Süper yönetici (giriş gerekli)
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
