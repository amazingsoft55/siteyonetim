import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AppDownloadButtons } from "@/components/AppDownloadButtons";
import {
  CreditCard, Megaphone, Wrench, ArrowRight, Shield, Sparkles,
  Users, BarChart3, Bell, CheckCircle, Clock, Star, Building2,
  Smartphone, HeadphonesIcon, ChevronRight,
} from "lucide-react";
import { getPublicSiteUrl } from "@/lib/site-url";

const homeUrl = getPublicSiteUrl();

export const metadata: Metadata = {
  title: "Apartman ve site yönetimi — Aidat, duyuru ve arıza talepleri tek uygulamada",
  description:
    "Site sakinleri ve yöneticiler için dijital platform: kullanıcı paneli ile aidat görüntüleme ve talep bildirimi; yönetici paneli ile duyuru yönetimi ve operasyon takibi.",
  keywords: ["apartman yönetim uygulaması", "site sakini portalı", "aidat yönetimi", "bakım ve arıza kaydı"],
  alternates: { canonical: homeUrl },
  openGraph: {
    url: homeUrl,
    title: "Apartman ve site yönetimi — Aidat, duyuru ve arıza talepleri tek uygulamada",
    description: "Site Sakinleri için kullanıcı deneyimi; yöneticiler için kontrol paneli.",
  },
};

const stats = [
  { value: "500+", label: "Aktif Site" },
  { value: "12.000+", label: "Kayıtlı Sakin" },
  { value: "%98", label: "Müşteri Memnuniyeti" },
  { value: "7/24", label: "Teknik Destek" },
];

const features = [
  {
    title: "Kolay Aidat Takibi",
    description: "Ödenmemiş aidatlarınızı anında görün, geçmiş dekontlara tek tıkla ulaşın. Borç durumunuz her zaman şeffaf.",
    icon: CreditCard,
    color: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    badge: "Yeni",
  },
  {
    title: "Anında Duyurular",
    description: "Yönetimden gelen önemli mesajları push bildirim olarak alın. Toplantı duyuruları, bakım günleri, önemli haberler.",
    icon: Megaphone,
    color: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
    badge: null,
  },
  {
    title: "Arıza & Talep Sistemi",
    description: "Teknik arızaları kategorize ederek iletin. Her adımda bildirim alın, çözüm sürecini gerçek zamanlı izleyin.",
    icon: Wrench,
    color: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
    badge: null,
  },
  {
    title: "Çoklu Rol Yönetimi",
    description: "Sakin, site yöneticisi ve platform yöneticisi rolleri. Her kullanıcı yalnızca kendi panelindeki verilere erişir.",
    icon: Shield,
    color: "bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400",
    badge: null,
  },
  {
    title: "Anlık Bildirimler",
    description: "Duyuru, aidat ve talep güncellemeleri için gerçek zamanlı bildirim altyapısı. Hiçbir gelişmeyi kaçırmayın.",
    icon: Bell,
    color: "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400",
    badge: "Yakında",
  },
  {
    title: "Detaylı Raporlama",
    description: "Aylık gelir/gider grafikleri, aidat tahsilat oranları, aktif talep analizleri. Tüm veriler tek panelde.",
    icon: BarChart3,
    color: "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400",
    badge: null,
  },
];

const howItWorks = [
  { step: "01", title: "Hesabınızı Açın", desc: "Yöneticiniz sizi sisteme ekler ve aktivasyon bağlantısı gönderir.", icon: Users },
  { step: "02", title: "Panele Giriş Yapın", desc: "Web veya mobil uygulama ile saniyeler içinde oturum açın.", icon: Smartphone },
  { step: "03", title: "Taleplerinizi İletin", desc: "Arıza, öneri veya şikayetlerinizi kategorize ederek yöneticiye gönderin.", icon: HeadphonesIcon },
  { step: "04", title: "Süreci Takip Edin", desc: "Her güncelleme anında size ulaşır, çözüm adımlarını izleyin.", icon: CheckCircle },
];

const testimonials = [
  {
    name: "Ayşe Kaya",
    role: "Site Sakini — İstanbul",
    text: "Aidatlarımı artık uygulamadan görüyorum. Yöneticiyi aramak zorunda kalmıyorum, her şey çok şeffaf.",
    stars: 5,
  },
  {
    name: "Mehmet Demir",
    role: "Site Yöneticisi — Ankara",
    text: "50 dairenin aidat takibini tek ekrandan yapıyorum. Talepleri kategorize edebilmek büyük kolaylık oldu.",
    stars: 5,
  },
  {
    name: "Zeynep Arslan",
    role: "Site Sakini — İzmir",
    text: "Asansör arızasını uygulamadan bildirdim, 2 saat içinde teknik geri döndü. Harika bir sistem.",
    stars: 5,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      <Navbar />

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden px-6 pt-24 pb-20 sm:pt-36 sm:pb-28">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#818cf8] to-[#c084fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
          </div>
          <div className="absolute right-0 top-1/3 -z-10 h-96 w-96 rounded-full bg-gradient-to-br from-cyan-400/15 to-indigo-600/15 blur-3xl" aria-hidden="true" />
          <div className="absolute left-0 bottom-0 -z-10 h-64 w-64 rounded-full bg-gradient-to-tr from-violet-400/10 to-pink-600/10 blur-3xl" aria-hidden="true" />

          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 ring-1 ring-inset ring-indigo-600/20 dark:ring-indigo-400/30 mb-8 bg-indigo-50/80 dark:bg-indigo-950/30">
              <Sparkles className="h-4 w-4" />
              Türkiye&apos;nin en modern site yönetim platformu
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl text-balance bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 via-indigo-800 to-violet-700 dark:from-white dark:via-indigo-200 dark:to-violet-300 leading-[1.1] pb-2">
              Sitenizi akıllıca yönetin
            </h1>
            <p className="mt-6 text-lg sm:text-xl leading-8 text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Aidat takibi, yönetim duyuruları ve arıza talepleri tek çatı altında. Sakinler şeffaflıkla takip eder; yöneticiler veritabanı destekli panelden operasyonu yürütür.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4 flex-col sm:flex-row">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-full shadow-xl shadow-indigo-600/30 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:scale-[1.03] active:scale-[0.98]"
              >
                Panele Giriş Yapın
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/destek"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-zinc-900 dark:text-white bg-white/90 dark:bg-zinc-900/90 backdrop-blur border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600 rounded-full shadow-md transition-all group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
              >
                Demo Talep Edin
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Mini özellik rozetleri */}
            <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
              {[
                { title: "Rol bazlı paneller", sub: "Sakin, yönetici ve süper admin ayrımı.", icon: Shield },
                { title: "Gerçek veri katmanı", sub: "SQLite ile kalıcı ve hızlı kayıtlar.", icon: Sparkles },
                { title: "Anlık bildirimler", sub: "Duyuru ve talepler anında düşer.", icon: Bell },
              ].map((b) => (
                <div
                  key={b.title}
                  className="rounded-2xl border border-white/60 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  <b.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mb-3" />
                  <p className="font-bold text-sm text-zinc-900 dark:text-zinc-50">{b.title}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{b.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── İstatistikler ── */}
        <section className="py-14 px-6 border-y border-zinc-100 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">{s.value}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Özellikler ── */}
        <section id="ozellikler" className="py-28 px-6 bg-zinc-50 dark:bg-zinc-950">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">
                <Sparkles className="h-3.5 w-3.5" /> Özellikler
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-balance">
                Size neler sunuyoruz?
              </h2>
              <p className="mt-4 text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
                Günlük site yönetimini kolaylaştıran, sakinleri ve yöneticileri tek platformda buluşturan modern çözümler.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group flex flex-col p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                >
                  {feature.badge && (
                    <span className={`absolute top-5 right-5 text-[10px] font-extrabold px-2.5 py-1 rounded-full ${feature.badge === "Yakında" ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300" : "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"}`}>
                      {feature.badge}
                    </span>
                  )}
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-5 ${feature.color} transition-transform group-hover:scale-110 duration-200`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-zinc-900 dark:text-zinc-50">{feature.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed flex-1">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Nasıl Çalışır ── */}
        <section className="py-28 px-6 bg-white dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">
                <Clock className="h-3.5 w-3.5" /> Başlamak çok kolay
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Nasıl çalışır?</h2>
              <p className="mt-4 text-zinc-500 dark:text-zinc-400 text-lg max-w-xl mx-auto">
                4 adımda sitenizin dijital yönetimine başlayın.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              <div className="hidden lg:block absolute top-10 left-[calc(25%+1rem)] right-[calc(25%+1rem)] h-px bg-gradient-to-r from-transparent via-indigo-300 dark:via-indigo-700 to-transparent" />
              {howItWorks.map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                  <div className="relative mb-5">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <span className="absolute -top-2 -right-2 text-[10px] font-black bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-full px-1.5 py-0.5">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-50 mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Kullanıcı Yorumları ── */}
        <section className="py-28 px-6 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 border-t border-zinc-100 dark:border-zinc-800/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">
                <Star className="h-3.5 w-3.5 fill-current" /> Kullanıcı yorumları
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Sakinler ne diyor?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.name} className="p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4">
                  <div className="flex gap-1">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed italic flex-1">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-zinc-900 dark:text-zinc-50">{t.name}</p>
                      <p className="text-xs text-zinc-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Uygulama İndir ── */}
        <section className="py-20 px-6 border-t border-zinc-100 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-900/40">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">
                <Smartphone className="h-3.5 w-3.5" /> Mobil uygulama
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-4xl">Cebinizde taşıyın</h2>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
                Android ve iPhone için optimize edilmiş PWA uygulamamızı indirin. Tek düğme ile kurulum, bildirim desteği dahil.
              </p>
            </div>
            <AppDownloadButtons variant="site" />
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 px-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 relative overflow-hidden">
          <div className="absolute inset-0 -z-0 opacity-10" aria-hidden>
            <Building2 className="absolute h-96 w-96 -right-20 -bottom-20 text-white" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto text-center text-white">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-balance">
              Sitenizi dijital çağa taşıyın
            </h2>
            <p className="mt-4 text-indigo-200 text-lg">
              Kurulum ücreti yok. İlk ay ücretsiz. Hemen başlayın.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4 flex-col sm:flex-row">
              <Link
                href="/destek"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-indigo-700 bg-white hover:bg-indigo-50 rounded-full shadow-xl transition-all hover:scale-[1.03]"
              >
                Ücretsiz Deneyin <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/iletisim"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border border-white/30 hover:border-white/60 bg-white/10 hover:bg-white/20 rounded-full transition-all"
              >
                Bize Ulaşın
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
