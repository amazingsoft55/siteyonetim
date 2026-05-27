import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SiteLogo } from "@/components/SiteLogo";
import { getPublicSiteUrl } from "@/lib/site-url";

const base = getPublicSiteUrl();

export const metadata: Metadata = {
  title: "Mobil uygulamalar",
  description: "Site Yönetimi ve süper yönetici mobil uygulaması — PWA ve mağaza (APK) kurulumu.",
  alternates: { canonical: `${base}/mobil` },
};

export default function MobilPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full space-y-10">
        <div className="flex items-center gap-4">
          <SiteLogo width={56} height={56} className="h-14 w-14" />
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Mobil uygulamalar</h1>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400 text-sm">
              İki ayrı uygulama: site yönetimi (sakin / yönetici) ve süper yönetici konsolu.
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-indigo-200/70 dark:border-indigo-900/50 bg-white dark:bg-zinc-900/50 p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">1 · Site Yönetimi (sakin & site yöneticisi)</h2>
          <ul className="text-sm space-y-2 list-disc pl-5 text-zinc-600 dark:text-zinc-400">
            <li>
              <strong>iPhone / Android (PWA):</strong>{" "}
              <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold underline">
                Giriş sayfasını
              </Link>{" "}
              açın → tarayıcı menüsünden <strong>Ana ekrana ekle</strong>.
            </li>
            <li>
              <strong>Play Store APK:</strong> geliştirici{" "}
              <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 rounded">npm run mobile:setup</code> ardından{" "}
              <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 rounded">npm run mobile:android</code> (Android Studio).
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-violet-200/70 dark:border-violet-900/50 bg-violet-50/30 dark:bg-violet-950/20 p-6 space-y-4">
          <h2 className="text-lg font-bold text-violet-900 dark:text-violet-100">2 · Süper yönetici konsolu</h2>
          <ul className="text-sm space-y-2 list-disc pl-5 text-violet-950/85 dark:text-violet-100/85">
            <li>
              <strong>PWA:</strong>{" "}
              <Link href="/super-admin" className="font-semibold underline text-indigo-600 dark:text-indigo-400">
                /super-admin
              </Link>{" "}
              açıkken ana ekrana ekleyin — ayrı manifest ile <strong>SY Süper</strong> adıyla kurulur.
            </li>
            <li>
              <strong>Ayrı APK:</strong>{" "}
              <code className="text-xs bg-white/60 dark:bg-zinc-900/50 px-1 rounded">npm run mobile:android:super</code>{" "}
              (<code className="text-xs">com.siteyonetim.superadmin</code>).
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/40 p-6 text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
          <p>
            Native kabuk canlı siteye bağlanır; <code className="text-xs">CAPACITOR_SERVER_URL</code> veya{" "}
            <code className="text-xs">NEXT_PUBLIC_SITE_URL</code> üretim adresiniz olmalıdır.
          </p>
          <p>
            Uygulama farklı bir adreste barınıyorsa giriş sayfasındaki <strong>Sunucu adresi (gelişmiş)</strong> alanından API
            kökünü kaydedin.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
