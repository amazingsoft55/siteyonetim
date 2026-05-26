import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CreditCard, Megaphone, Wrench, ArrowRight } from "lucide-react";
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
        <section className="relative overflow-hidden px-6 pt-24 pb-32 sm:pt-32 sm:pb-40 lg:pb-48">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 ring-1 ring-inset ring-indigo-600/20 dark:ring-indigo-400/30 mb-8 bg-indigo-50/50 dark:bg-indigo-950/20">
              Yeni Nesil Yaşam Alanı Yönetimi
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-balance bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
              Siteniz Parmaklarınızın Ucunda
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Aidat takibi, duyurular, arıza bildirimleri ve daha fazlası. Hem webden hem cepten sitenizi tek bir merkezden kolayca yönetin.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 flex-col sm:flex-row gap-y-4">
              <a href="/login" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:scale-105 active:scale-95">
                Hesabınıza Giriş Yapın
              </a>
              <button className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-zinc-900 dark:text-white bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-full shadow-sm transition-all group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500">
                Uygulamayı İndir
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
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
