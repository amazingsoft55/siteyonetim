import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SiteLogo } from "@/components/SiteLogo";
import { AppDownloadButtons } from "@/components/AppDownloadButtons";
import { getAppDownloadUrl } from "@/lib/app-download-links";
import { getPublicSiteUrl } from "@/lib/site-url";

const base = getPublicSiteUrl();
const siteAndroidUrl = getAppDownloadUrl("site", "android");

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
              Tek dokunuşla kurulum — site sakinleri ve yöneticiler için.
            </p>
          </div>
        </div>

        <AppDownloadButtons variant="site" />

        <section id="ios" className="scroll-mt-24 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-2">
          <h2 className="text-lg font-bold">iPhone / iPad (Apple)</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            App Store bağlantısı tanımlı değilse Safari ile{" "}
            <Link href="/" className="text-indigo-600 font-semibold underline">
              ana sayfayı
            </Link>{" "}
            veya{" "}
            <Link href="/login" className="text-indigo-600 font-semibold underline">
              giriş sayfasını
            </Link>{" "}
            açın → <strong>Paylaş</strong> → <strong>Ana Ekrana Ekle</strong>. Uygulama adı{" "}
            <strong>Site Yönetimi</strong> olarak görünür.
          </p>
        </section>

        <section id="android" className="scroll-mt-24 rounded-2xl border border-emerald-200/70 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 p-6 space-y-4">
          <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Android</h2>
          {siteAndroidUrl ? (
            <div className="space-y-2">
              <p className="text-sm text-emerald-950/85 dark:text-emerald-100/85">
                Resmi indirme bağlantınız hazır. Aşağıdaki düğme Google Play veya APK dosyasına gider.
              </p>
              <a
                href={siteAndroidUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold px-5 py-3"
              >
                Site Yönetimi — Android indir
              </a>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-emerald-950/85 dark:text-emerald-100/85">
              <p>
                <strong>1 — Uygulama olarak kur (önerilen):</strong> Chrome ile{" "}
                <Link href="/" className="text-emerald-800 dark:text-emerald-200 font-semibold underline">
                  ana sayfayı
                </Link>{" "}
                açın. Menü (⋮) → <strong>Uygulamayı yükle</strong> veya <strong>Ana ekrana ekle</strong>. Kısayol adı{" "}
                <strong>Site Yönetim</strong> olur; giriş yaptıktan sonra panele erişirsiniz.
              </p>
              <p>
                <strong>2 — Play Store / APK:</strong> Site yöneticiniz mağaza veya APK bağlantısı paylaşmadıysa{" "}
                <Link href="/destek" className="font-semibold underline">
                  destek
                </Link>{" "}
                üzerinden talep edin.
              </p>
              <p className="text-xs text-emerald-900/70 dark:text-emerald-200/70">
                Teknik ekip: indirme adresi ve APK derleme adımları için{" "}
                <Link href="/kurulum#mobil" className="underline font-semibold">
                  kurulum rehberi → Mobil uygulama
                </Link>
                .
              </p>
            </div>
          )}
        </section>

        <section id="windows" className="scroll-mt-24 rounded-2xl border border-sky-200/70 dark:border-sky-900/50 bg-sky-50/30 dark:bg-sky-950/20 p-6 space-y-2">
          <h2 className="text-lg font-bold text-sky-900 dark:text-sky-100">Windows (PC)</h2>
          <p className="text-sm text-sky-950/85 dark:text-sky-100/85">
            Edge veya Chrome ile{" "}
            <Link href="/" className="font-semibold underline">
              ana sayfayı
            </Link>{" "}
            açın → adres çubuğundaki <strong>Uygulamayı yükle</strong> / <strong>Yükle</strong>. Masaüstü kısayolu{" "}
            <strong>Site Yönetimi</strong> adıyla açılır.
          </p>
        </section>

        <section id="linux" className="scroll-mt-24 rounded-2xl border border-amber-200/70 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20 p-6 space-y-2">
          <h2 className="text-lg font-bold text-amber-950 dark:text-amber-100">Linux</h2>
          <p className="text-sm text-amber-950/85 dark:text-amber-100/85">
            Chrome / Chromium ile{" "}
            <Link href="/" className="font-semibold underline">
              ana sayfayı
            </Link>{" "}
            açın → menü → <strong>Ana ekrana ekle</strong> veya <strong>Uygulama olarak yükle</strong>.
          </p>
        </section>

        <section className="rounded-2xl border border-violet-200/70 dark:border-violet-900/50 bg-violet-50/30 dark:bg-violet-950/20 p-6 space-y-4">
          <h2 className="text-lg font-bold text-violet-900 dark:text-violet-100">Süper yönetici uygulaması (ayrı paket)</h2>
          <p className="text-sm text-violet-950/85 dark:text-violet-100/85">
            Bu bölüm yalnızca platform süper yöneticileri içindir. Sakin ve site yöneticileri yukarıdaki{" "}
            <strong>Site Yönetimi</strong> indirme alanını kullanmalıdır.
          </p>
          <AppDownloadButtons variant="super-admin" />
          <p className="text-xs text-violet-900/80 dark:text-violet-200/80">
            iPhone: önce{" "}
            <Link href="/super-admin" className="underline font-semibold">
              süper yönetici panelini
            </Link>{" "}
            açıp Ana Ekrana Ekleyin — ad <strong>SY Süper</strong> olur. Android: aynı panel Chrome ile açıkken menüden{" "}
            <strong>Uygulamayı yükle</strong>.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
