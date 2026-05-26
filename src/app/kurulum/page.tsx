import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getPublicSiteUrl } from "@/lib/site-url";

const base = getPublicSiteUrl();

export const metadata: Metadata = {
  title: "Kurulum ve veritabanı",
  description:
    "Site Yönetimi: yerel SQLite, şema uygulama, deme süper yöneticisi ve sık yapılan hataların çözümü.",
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
            Bu uygulama <strong>Node.js sürecinde SQLite</strong> kullanır. API route’ları `better-sqlite3` ile diskteki tek bir
            `.db` dosyasına yazar; klasik SSR / `next dev` ile tamamen çalışır (ek platform bağlayıcısı gerekmez).
          </p>
        </div>

        <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold">1 · Bağımlılıklar ve ortam</h2>
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
          <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">2 · Tek SQL dosyası (şema + deme yöneticisi)</h2>
          <p className="text-sm text-emerald-950/85 dark:text-emerald-100/85">
            Tüm tablolar ve isteğe bağlı ilk süper kullanıcı: <strong>drizzle/full-schema.sql</strong>
          </p>
          <div className="rounded-xl bg-zinc-950 dark:bg-black text-zinc-100 text-xs sm:text-sm p-4 overflow-x-auto font-mono">
            <p className="text-emerald-400 mb-2"># Proje kökünden</p>
            <p>npm run db:apply</p>
          </div>
          <p className="text-xs text-emerald-900/80 dark:text-emerald-300/85">
            Deme blok uygulanırsa giriş: <code className="text-[11px]">yonetici@demo.local</code> — şifre{" "}
            <code className="text-[11px]">Admin123!</code> (üretimde mutlaka değiştirin).
          </p>
        </section>

        <section className="rounded-2xl border border-indigo-200/70 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 p-6 space-y-3">
          <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">3 · Programatik ilk kurulum (boş DB)</h2>
          <p className="text-sm text-indigo-950/80 dark:text-indigo-100/85">
            SQL ile deme yüklemek istemezseniz, tablo boşken <code className="text-xs">env.example</code> ile tanımladığınız
            ortam değişkenleriyle{" "}
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

        <section className="rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-6 space-y-3">
          <h2 className="text-lg font-bold text-amber-950 dark:text-amber-100">5 · Sık hatalar</h2>
          <ul className="text-sm list-disc pl-5 space-y-2 text-amber-950/85 dark:text-amber-200/85">
            <li>
              <strong>503 / DATABASE_UNAVAILABLE:</strong> dosya yolu yazılamıyor veya native modül yüklenemiyor — `DATABASE_PATH` ve klasör izinlerini
              kontrol edin.
            </li>
            <li>
              <strong>no such table:</strong> `npm run db:apply` henüz çalıştırılmamış veya eski bir dosya kullanılıyor.
            </li>
            <li>
              <strong>Serverless kısıtı:</strong> tek dosya SQLite, kalıcı diski olmayan veya her istekte izole kopya sunan platformlarda uygun değildir;
              bu durumda harici bir veritabanına geçin.
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
