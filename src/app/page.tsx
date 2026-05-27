import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AppDownloadButtons } from "@/components/AppDownloadButtons";
import { CreditCard, Megaphone, Wrench, ArrowRight, Shield, Sparkles } from "lucide-react";
import { getPublicSiteUrl } from "@/lib/site-url";

const homeUrl = getPublicSiteUrl();

export const metadata: Metadata = {
  title:
    "Apartman ve site yönetimi — Aidat, duyuru ve arıza talepleri tek uygulamada",
  description:
    "Site sakinleri ve yöneticiler için dijital platform: kullanıcı paneli ile aidat görüntüleme ve talep bildirimi; yönetici paneli ile duyuru yönetimi ve operasyon takibi.",
  keywords: [
    "apartman yönetim uygulaması",
    "site sakini portalı",
    "aidat yönetimi",
    "bakım ve arıza kaydı",
  ],
  alternates: { canonical: homeUrl },
  openGraph: {
    url: homeUrl,
    title:
      "Apartman ve site yönetimi — Aidat, duyuru ve arıza talepleri tek uygulamada",
    description:
      "Site Sakinleri için kullanıcı deneyimi; yöneticiler için kontrol paneli. Site Yönetimi ile yaşam alanınızın dijital merkezi.",
  },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pt-24 pb-20 sm:pt-32 sm:pb-28 lg:pb-36">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-25 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
          </div>
          <div
            className="absolute right-0 top-1/3 -z-10 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-400/20 to-indigo-600/20 blur-3xl"
            aria-hidden="true"
          />

          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 ring-1 ring-inset ring-indigo-600/20 dark:ring-indigo-400/30 mb-8 bg-indigo-50/80 dark:bg-indigo-950/30">
              <Sparkles className="h-4 w-4" />
              Yeni nesil site &amp; apartman yönetimi
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-balance bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-indigo-800 to-violet-700 dark:from-white dark:via-indigo-200 dark:to-violet-200">
              Siteniz parmaklarınızın ucunda
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Aidat görünürlüğü, yönetim duyuruları, arıza ve talepler tek çatı altında. Sakinler şeffaflıkla takip eder;
              yöneticiler veritabanı destekli panellerden operasyonu yürütür.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 flex-col sm:flex-row gap-y-4">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-full shadow-lg shadow-indigo-600/25 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:scale-[1.02] active:scale-[0.98]"
              >
                Panele giriş yapın
              </Link>
              <Link
                href="/destek"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-zinc-900 dark:text-white bg-white/90 dark:bg-zinc-900/90 backdrop-blur border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600 rounded-full shadow-md transition-all group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
              >
                Destek ve satış iletişimi
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
              {[
                { title: "Rol bazlı paneller", sub: "Sakin, site yönetimi ve süper admin ayrımı.", icon: Shield },
                { title: "Gerçek veri katmanı", sub: "SQLite dosyasında kalıcı kayıtlar.", icon: Sparkles },
                { title: "Hızlı bildirim", sub: "Duyuru ve talepler anında panele düşer.", icon: Megaphone },
              ].map((b) => (
                <div
                  key={b.title}
                  className="rounded-2xl border border-white/60 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <b.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mb-2" />
                  <p className="font-bold text-sm text-zinc-900 dark:text-zinc-50">{b.title}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{b.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6 border-t border-zinc-100 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-900/40">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Mobil uygulamayı indirin</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                iPhone, Android, Windows ve Linux — site sakinleri ve yöneticiler için.
              </p>
            </div>
            <AppDownloadButtons variant="site" />
          </div>
        </section>

        {/* Features Section */}
        <section id="ozellikler" className="py-24 bg-white dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800/50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Size Neler Sunuyoruz?</h2>
              <p className="mt-4 text-zinc-600 dark:text-zinc-400 text-lg">Günlük yaşamınızı kolaylaştıran modern çözümler.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Kolay Aidat Ödeme",
                  description: "Kredi kartı veya havale ile aidatlarınızı saniyeler içinde, güvenle ödeyin. Geçmiş dekontlarınıza anında ulaşın.",
                  icon: CreditCard,
                  color: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                },
                {
                  title: "Anında Duyurular",
                  description: "Yönetimden gelen önemli mesajları anında bildirim olarak alın. Hiçbir gelişmeyi kaçırmayın.",
                  icon: Megaphone,
                  color: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                },
                {
                  title: "Arıza ve Talep",
                  description: "Teknik sorunları veya taleplerinizi doğrudan yönetime iletin. Süreci adım adım takip edin.",
                  icon: Wrench,
                  color: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-6 ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 flex-1">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
