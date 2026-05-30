import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AppDownloadButtons } from "@/components/AppDownloadButtons";
import { PlatformDownloadButtons } from "@/components/PlatformDownloadButtons";
import { PricingSection } from "@/components/PricingSection";
import {
  CreditCard, Megaphone, Wrench, ArrowRight, Shield, Sparkles,
  Users, BarChart3, Bell, CheckCircle, Clock, Star, Building2,
  Smartphone, HeadphonesIcon, ChevronRight, Zap, Globe, Lock,
  MessageSquare, FileText, Gauge, Infinity, Phone,
  TrendingUp, Award, Heart, ThumbsUp, Flame, Crown, Gift,
  Percent, Timer, ShieldCheck, BadgeCheck, Rocket,
} from "lucide-react";
import { getPublicSiteUrl } from "@/lib/site-url";

const homeUrl = getPublicSiteUrl();

export const metadata: Metadata = {
  title: "Apartman ve site yönetimi — Aidat, duyuru ve arıza talepleri tek uygulamada",
  description:
    "Site sakinleri ve yöneticiler için dijital platform: aidat takibi, duyuru yönetimi, arıza talepleri ve more. Ücretsiz başlayın.",
  keywords: ["apartman yönetim uygulaması", "site sakini portalı", "aidat yönetimi", "bakım ve arıza kaydı", "site yönetim yazılımı"],
  alternates: { canonical: homeUrl },
  openGraph: {
    url: homeUrl,
    title: "Site Yönetimi — Apartman ve Site Yönetimi Platformu",
    description: "Aidat takibi, duyuru yönetimi ve arıza talepleri tek platformda.",
  },
};

const stats = [
  { value: "Ücretsiz Deneme", label: "14 Gün", icon: Clock },
  { value: "49 TL", label: "Başlangıç Fiyatı", icon: CreditCard },
  { value: "%99.9", label: "Çalışma Süresi", icon: Shield },
  { value: "7/24", label: "Teknik Destek", icon: HeadphonesIcon },
];

const features = [
  {
    title: "Aidat Takibi",
    description: "Aidat borçlarınızı, ödemelerinizi ve dekontlarınızı tek ekrandan takip edin. Otomatik hatırlatmalarla gecikme yaşanmaz.",
    icon: CreditCard,
    color: "from-emerald-400 to-emerald-600",
    bgLight: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    title: "Duyuru Yönetimi",
    description: "Yönetim duyuruları, toplantı bilgileri ve önemli haberler anında tüm sakinlere ulaşır. Email ve push bildirim desteği.",
    icon: Megaphone,
    color: "from-amber-400 to-orange-500",
    bgLight: "bg-amber-50 dark:bg-amber-500/10",
  },
  {
    title: "Arıza & Talep",
    description: "Asansör arızası, su kaçağı, elektrik sorunu... Taleplerinizi kategorize edin, sürecin her adımını takip edin.",
    icon: Wrench,
    color: "from-blue-400 to-blue-600",
    bgLight: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    title: "Güvenli Altyapı",
    description: "Cloudflare Workers ve D1 veritabanı ile dünya çapında hızlı ve güvenli erişim. Verileriniz güvende.",
    icon: Shield,
    color: "from-violet-400 to-purple-600",
    bgLight: "bg-violet-50 dark:bg-violet-500/10",
  },
  {
    title: "Anlık Bildirimler",
    description: "Duyuru, aidat ve talep güncellemeleri için gerçek zamanlı push bildirimleri. Hiçbir gelişmeyi kaçırmayın.",
    icon: Bell,
    color: "from-rose-400 to-pink-600",
    bgLight: "bg-rose-50 dark:bg-rose-500/10",
  },
  {
    title: "Raporlama",
    description: "Aylık aidat tahsilat oranları, aktif talep analizleri ve gelir/gider grafikleri. Veriye dayalı kararlar verin.",
    icon: BarChart3,
    color: "from-cyan-400 to-teal-500",
    bgLight: "bg-cyan-50 dark:bg-cyan-500/10",
  },
];

const howItWorks = [
  { step: "01", title: "Kayıt Olun", desc: "Ücretsiz hesabınızı oluşturun veya yöneticiniz sizi sisteme eklesin.", icon: Users },
  { step: "02", title: "Sitenizi Tanımlayın", desc: "Site bilgilerinizi girin, sakinlerinizi ekleyin.", icon: Building2 },
  { step: "03", title: "Yönetmeye Başlayın", desc: "Aidatlarınızı girin, duyurularınızı paylaşın.", icon: Zap },
  { step: "04", title: "Her Şey Takipte", desc: "Raporlar, bildirimler ve anlık durum takibi.", icon: Gauge },
];

const testimonials = [
  {
    name: "Beta Kullanıcı",
    role: "Site Yöneticisi — İstanbul",
    text: "Uygulamayı test ediyorum, aidat takibi ve duyuru sistemi çok kullanışlı. Site sakinleri de memnun.",
    stars: 5,
  },
  {
    name: "Beta Kullanıcı",
    role: "Site Sakini — Ankara",
    text: "Yöneticimiz bu uygulamayı deniyor. Aidatlarımı görebiliyorum, taleplerimi iletebiliyorum. Güzel bir girişim.",
    stars: 4,
  },
  {
    name: "Beta Kullanıcı",
    role: "Yönetici Adayı — İzmir",
    text: "Henüz yeni bir platform ama potansiyeli var. Ücretsiz deneme süresi olması büyük avantaj.",
    stars: 4,
  },
];

const faqs = [
  {
    q: "Ücretsiz deneme süresi var mı?",
    a: "Evet! Tüm paketlerimizde 14 günlük ücretsiz deneme süresi bulunur. Kredi kartı gerekmez.",
  },
  {
    q: "Verilerim güvende mi?",
    a: "Evet. Cloudflare altyapısı ve D1 veritabanı ile dünya çapında şifreli veri saklama sağlanır. Hiçbir veriniz üçüncü taraflarla paylaşılmaz.",
  },
  {
    q: "Mobil uygulama var mı?",
    a: "Evet. Android ve iOS için PWA uygulamamız mevcuttur. Uygulama mağazasından indirmenize gerek yok, tarayıcınızdan yükleyebilirsiniz.",
  },
  {
    q: "Birden fazla siteyi aynı anda yönetebilir miyim?",
    a: "Profesyonel pakette 3, Kurumsal pakette sınırsız site yönetebilirsiniz. Tüm siteleriniz tek panelden kontrol edilir.",
  },
  {
    q: "Nasıl ödeme yapılır?",
    a: "Kredi kartı, banka havalesi ve EFT ile ödeme kabul edilir. Faturalandurma aylık olarak yapılır.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      <Navbar />

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden px-6 pt-20 pb-20 sm:pt-32 sm:pb-28 lg:pt-40 lg:pb-36">
          {/* Animated background blobs */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-indigo-400/20 to-cyan-400/20 blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-violet-400/20 to-pink-400/20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-amber-400/10 to-orange-400/10 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
          </div>

          <div className="mx-auto max-w-5xl text-center">
            {/* Promo badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 mb-8 animate-bounce">
              <Flame className="h-4 w-4" />
              Ayda sadece 49 TL&apos;den başlıyor!
              <Flame className="h-4 w-4" />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 ring-1 ring-inset ring-indigo-600/20 dark:ring-indigo-400/30 mb-8 bg-indigo-50/80 dark:bg-indigo-950/30">
              <Sparkles className="h-4 w-4" />
              Türkiye&apos;nin en modern site yönetim platformu
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl text-balance bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 via-indigo-800 to-violet-700 dark:from-white dark:via-indigo-200 dark:to-violet-300 leading-[1.1] pb-2">
              Sitenizi akıllıca yönetin
            </h1>
            <p className="mt-6 text-lg sm:text-xl leading-8 text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Aidat takibi, yönetim duyuruları ve arıza talepleri tek çatı altında.
              <span className="font-bold text-emerald-600 dark:text-emerald-400"> Rakiplerinizden 10 kat ucuz</span>.
              Hemen ücretsiz başlayın!
            </p>

            <div className="mt-10 flex items-center justify-center gap-4 flex-col sm:flex-row">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-full shadow-xl shadow-indigo-600/30 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:scale-[1.03] active:scale-[0.98]"
              >
                <Rocket className="h-4 w-4" />
                Ücretsiz Başlayın
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/iletisim"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-zinc-900 dark:text-white bg-white/90 dark:bg-zinc-900/90 backdrop-blur border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600 rounded-full shadow-md transition-all group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
              >
                <Phone className="h-4 w-4" />
                Demo Talep Edin
              </Link>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> 14 gün ücretsiz</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> Kredi kartı gerekmez</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> Anında kurulum</span>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" /> SSL Güvenlik
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                <BadgeCheck className="h-3.5 w-3.5" /> KVKK Uyumlu
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400">
                <Globe className="h-3.5 w-3.5" /> Cloudflare Altyapı
              </span>
            </div>
          </div>
        </section>

        {/* ── İstatistikler ── */}
        <section className="py-14 px-6 border-y border-zinc-100 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center group">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 mb-3 group-hover:scale-110 transition-transform">
                  <s.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">{s.value}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Neden Biz? ── */}
        <section className="py-20 px-6 bg-zinc-50 dark:bg-zinc-950">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">
                <Zap className="h-3.5 w-3.5" /> Neden Site Yönetimi?
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-balance">
                Geleneksel yönetimden<br className="hidden sm:block" /> modern yönetime geçin
              </h2>
              <p className="mt-4 text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
                WhatsApp grupları, kağıt defterler ve telefon trafiği artık tarih oldu. Tek platformda her şey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group flex flex-col p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                >
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-5 ${feature.bgLight} transition-transform group-hover:scale-110 duration-200`}>
                    <div className={`h-6 w-6 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                      <feature.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-zinc-900 dark:text-zinc-50">{feature.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed flex-1">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Fiyatlandırma ── */}
        <PricingSection />

        {/* ── Nasıl Çalışır ── */}
        <section className="py-28 px-6 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">
                <Clock className="h-3.5 w-3.5" /> Başlamak çok kolay
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">4 adımda başlayın</h2>
              <p className="mt-4 text-zinc-500 dark:text-zinc-400 text-lg max-w-xl mx-auto">
                Teknik bilgiye ihtiyacınız yok. Her şey basit ve anlaşılır.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              <div className="hidden lg:block absolute top-10 left-[calc(25%+1rem)] right-[calc(25%+1rem)] h-px bg-gradient-to-r from-transparent via-indigo-300 dark:via-indigo-700 to-transparent" />
              {howItWorks.map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
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

        {/* ── Neden Biz? ── */}
        <section className="py-20 px-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 relative overflow-hidden">
          <div className="absolute inset-0 -z-0 opacity-5" aria-hidden>
            <Building2 className="absolute h-96 w-96 -right-20 -bottom-20 text-white" />
          </div>
          <div className="max-w-5xl mx-auto text-center text-white relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold bg-white/20 text-white mb-8">
              <Award className="h-4 w-4" />
              Neden Biz?
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl mb-8">
              Neden bu kadar ucuza hizmet veriyoruz?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
              <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">Düşük Altyapı Maliyeti</h3>
                <p className="text-indigo-200 text-sm">Cloudflare altyapısı sayesinde sunucu maliyetlerimiz çok düşük. Bu tasarrufu size yansıtıyoruz.</p>
              </div>
              <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">Yeni Platform</h3>
                <p className="text-indigo-200 text-sm">Henüz yeni bir platformuz. Büyüme aşamasında olduğumuz için uygun fiyatlar sunuyoruz.</p>
              </div>
              <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">Erişilebilirlik</h3>
                <p className="text-indigo-200 text-sm">Amacımız her site yönetimini dijitalleştirmek. Fiyatları erişilebilir tutuyoruz.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Kullanıcı Yorumları ── */}
        <section className="py-28 px-6 bg-white dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">
                <Star className="h-3.5 w-3.5 fill-current" /> Kullanıcı yorumları
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Beta kullanıcılarımız ne diyor?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.name} className="p-7 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4">
                  <div className="flex gap-1">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed italic flex-1">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
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

        {/* ── SSS ── */}
        <section className="py-28 px-6 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800/50">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">
                <MessageSquare className="h-3.5 w-3.5" /> Sıkça Sorulan Sorular
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Merak edilenler</h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-2">{faq.q}</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{faq.a}</p>
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
                Android ve iPhone için uygulamamızı indirin veya tarayıcınızdan yükleyin.
              </p>
            </div>
            <div className="flex justify-center">
              <PlatformDownloadButtons showTitle={false} />
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 px-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 relative overflow-hidden">
          <div className="absolute inset-0 -z-0 opacity-10" aria-hidden>
            <Building2 className="absolute h-96 w-96 -right-20 -bottom-20 text-white" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold bg-white/20 text-white mb-8">
              <Gift className="h-4 w-4" />
              Sınırlı süre: %50 indirim
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-balance">
              Sitenizi dijital çağa taşıyın
            </h2>
            <p className="mt-4 text-indigo-200 text-lg">
              14 gün ücretsiz deneyin. Kurulum yok, kredi kartı yok, taahhüt yok.
              <br />
              <span className="font-bold text-white">Ayda 49 TL&apos;den başlayan fiyatlarla.</span>
            </p>
            <div className="mt-10 flex items-center justify-center gap-4 flex-col sm:flex-row">
              <Link
                href="/destek"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-indigo-700 bg-white hover:bg-indigo-50 rounded-full shadow-xl transition-all hover:scale-[1.03]"
              >
                <Rocket className="h-4 w-4" />
                Ücretsiz Deneyin <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/iletisim"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border border-white/30 hover:border-white/60 bg-white/10 hover:bg-white/20 rounded-full transition-all"
              >
                Bize Ulaşın
              </Link>
            </div>
            <div className="mt-10 flex justify-center">
              <PlatformDownloadButtons showTitle={false} variant="light" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
