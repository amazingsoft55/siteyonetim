import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SiteLogo } from "@/components/SiteLogo";
import { AppDownloadButtons } from "@/components/AppDownloadButtons";
import { getPublicSiteUrl } from "@/lib/site-url";

const base = getPublicSiteUrl();

export const metadata: Metadata = {
  title: "Uygulamayı indir",
  description: "Site Yönetimi — iPhone, Android, Windows ve Linux kurulum rehberi.",
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
            <h1 className="text-3xl font-extrabold tracking-tight">Uygulamayı indir</h1>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400 text-sm">
              Apple, Android, Windows ve Linux — site yönetimi ve süper yönetici ayrı paketler.
            </p>
          </div>
        </div>

        <AppDownloadButtons variant="site" />

        <section id="ios" className="scroll-mt-24 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-2">
          <h2 className="text-lg font-bold">iPhone / iPad (Apple)</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            App Store bağlantısı tanımlı değilse Safari ile{" "}
            <Link href="/login" className="text-indigo-600 font-semibold underline">
              giriş sayfasını
            </Link>{" "}
            açın → <strong>Paylaş</strong> → <strong>Ana Ekrana Ekle</strong>. Süper yönetici için önce{" "}
            <Link href="/super-admin" className="underline">
              /super-admin
            </Link>{" "}
            açık olmalıdır.
          </p>
        </section>

        <section id="android" className="scroll-mt-24 rounded-2xl border border-emerald-200/70 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 p-6 space-y-2">
          <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Android</h2>
          <p className="text-sm text-emerald-950/85 dark:text-emerald-100/85">
            Play Store veya APK adresi <code className="text-xs">NEXT_PUBLIC_SITE_DOWNLOAD_ANDROID</code> ile verilir. Geliştirici
            paketi: <code className="text-xs">npm run mobile:android</code> (site),{" "}
            <code className="text-xs">npm run mobile:android:super</code> (süper yönetici).
          </p>
        </section>

        <section id="windows" className="scroll-mt-24 rounded-2xl border border-sky-200/70 dark:border-sky-900/50 bg-sky-50/30 dark:bg-sky-950/20 p-6 space-y-2">
          <h2 className="text-lg font-bold text-sky-900 dark:text-sky-100">Windows (PC)</h2>
          <p className="text-sm text-sky-950/85 dark:text-sky-100/85">
            Edge veya Chrome ile siteyi açın → adres çubuğundaki <strong>Uygulamayı yükle</strong> / <strong>Yükle</strong>. Mağaza
            (.exe / Microsoft Store) için <code className="text-xs">NEXT_PUBLIC_SITE_DOWNLOAD_WINDOWS</code> tanımlayın.
          </p>
        </section>

        <section id="linux" className="scroll-mt-24 rounded-2xl border border-amber-200/70 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20 p-6 space-y-2">
          <h2 className="text-lg font-bold text-amber-950 dark:text-amber-100">Linux</h2>
          <p className="text-sm text-amber-950/85 dark:text-amber-100/85">
            Chrome / Chromium → menü → <strong>Ana ekrana ekle</strong> veya <strong>Uygulama olarak yükle</strong>. Dağıtım paketi
            (.AppImage / .deb) için <code className="text-xs">NEXT_PUBLIC_SITE_DOWNLOAD_LINUX</code> kullanın.
          </p>
        </section>

        <section className="rounded-2xl border border-violet-200/70 dark:border-violet-900/50 bg-violet-50/30 dark:bg-violet-950/20 p-6 space-y-4">
          <h2 className="text-lg font-bold text-violet-900 dark:text-violet-100">Süper yönetici uygulaması</h2>
          <AppDownloadButtons variant="super-admin" />
        </section>
      </main>
      <Footer />
    </div>
  );
}
