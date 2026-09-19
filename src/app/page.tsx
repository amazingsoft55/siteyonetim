"use client";

import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  CreditCard,
  Megaphone,
  Wrench,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  BarChart3,
  Bell,
  Building2,
  Smartphone,
  Sparkles,
  ChevronDown,
  Lock,
  Receipt,
  FileSpreadsheet,
  Layers,
  HelpCircle,
  PhoneCall,
  UserPlus,
  LogIn,
} from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = React.useState<"aidat" | "duyuru" | "talep" | "finans">("aidat");
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Subtle decorative background gradient circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial from-indigo-100/70 via-slate-50 to-transparent -z-10 blur-2xl" />

        <div className="max-w-6xl mx-auto px-6 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs sm:text-sm font-semibold mb-6 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span>Apartman ve Siteler İçin Yeni Nesil Dijital Yönetim</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            Aidat takibi, duyurular ve talepler <span className="text-indigo-600">tek bir merkezde</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
            Apartman yöneticileri için şeffaf muhasebe ve otomatik tahsilat; sakinler için anlık duyurular ve tek tıkla arıza bildirimi.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-14">
            <Link
              href="/kayit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
            >
              <UserPlus className="h-5 w-5" />
              <span>Ücretsiz Hesap Aç</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/90 shadow-xs transition-all"
            >
              <LogIn className="h-4 w-4 text-slate-500" />
              <span>Giriş Yap</span>
            </Link>
          </div>

          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Kredi kartı gerekmez</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>14 gün ücretsiz deneme</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>KVKK & Kat Mülkiyeti Kanunu uyumlu</span>
            </div>
          </div>
        </div>

        {/* Live Interactive App Preview Mockup */}
        <div className="max-w-5xl mx-auto px-4 mt-14 sm:mt-18">
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200/90">
            
            {/* Mockup Header bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-slate-500 ml-2">Güneş Sitesi Yönetim Portalı</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Canlı Sistem</span>
              </div>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("aidat")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === "aidat"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span>Aidat Takibi</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("duyuru")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === "duyuru"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Megaphone className="h-4 w-4" />
                <span>Duyuru Yönetimi</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("talep")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === "talep"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Wrench className="h-4 w-4" />
                <span>Arıza &amp; Talep</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("finans")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === "finans"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Kasa &amp; Gelir/Gider</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-6 border border-slate-200/80 min-h-[300px]">
              {activeTab === "aidat" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-600 uppercase">Toplam Tahsilat</span>
                      <p className="text-lg sm:text-xl font-extrabold text-emerald-600 mt-1">₺48.500</p>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-600 uppercase">Ödenmemiş Borç</span>
                      <p className="text-lg sm:text-xl font-extrabold text-rose-600 mt-1">₺3.200</p>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-600 uppercase">Tahsilat Oranı</span>
                      <p className="text-lg sm:text-xl font-extrabold text-indigo-600 mt-1">%94</p>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-600 uppercase">Daire Sayısı</span>
                      <p className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">32 Daire</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4">Daire</th>
                          <th className="py-2.5 px-4">Sakin</th>
                          <th className="py-2.5 px-4">Dönem</th>
                          <th className="py-2.5 px-4">Tutar</th>
                          <th className="py-2.5 px-4 text-right">Durum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-2.5 px-4 font-bold">No: 4</td>
                          <td className="py-2.5 px-4">Ahmet Yılmaz</td>
                          <td className="py-2.5 px-4">Eylül 2026</td>
                          <td className="py-2.5 px-4 font-bold">₺1.500</td>
                          <td className="py-2.5 px-4 text-right">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700">
                              Ödendi
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-bold">No: 7</td>
                          <td className="py-2.5 px-4">Ayşe Demir</td>
                          <td className="py-2.5 px-4">Eylül 2026</td>
                          <td className="py-2.5 px-4 font-bold">₺1.500</td>
                          <td className="py-2.5 px-4 text-right">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700">
                              Bekliyor
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-bold">No: 12</td>
                          <td className="py-2.5 px-4">Mehmet Kaya</td>
                          <td className="py-2.5 px-4">Eylül 2026</td>
                          <td className="py-2.5 px-4 font-bold">₺1.500</td>
                          <td className="py-2.5 px-4 text-right">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700">
                              Ödendi
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "duyuru" && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700">
                        TOPLANTI
                      </span>
                      <span className="text-xs text-slate-600">Bugün 14:30</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">
                      2026 Yıllık Olağan Kat Malikleri Genel Kurul Toplantısı
                    </h4>
                    <p className="text-xs text-slate-600">
                      Güneş Sitesi toplantı salonunda saat 19:00&apos;da toplanılacaktır. Çoğunluk sağlanamazsa ikinci toplantı bir hafta sonra yapılacaktır.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700">
                        BAKIM &amp; ONARIM
                      </span>
                      <span className="text-xs text-slate-600">Dün</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">
                      Asansör Periyodik Bakım Çalışması
                    </h4>
                    <p className="text-xs text-slate-600">
                      A Blok asansörleri saat 10:00 - 12:00 arasında yetkili servis kontrolünden geçecektir.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "talep" && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">Talep #1042</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700">İşlemde</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800">Otopark Giriş Bariyeri Kumanda Tanımlaması</p>
                      <span className="text-[11px] text-slate-600">Daire 8 &bull; Mustafa K. &bull; 2 saat önce</span>
                    </div>
                    <button className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                      Yanıtla
                    </button>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">Talep #1039</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700">Çözüldü</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800">2. Kat Koridor Lambası Değişimi</p>
                      <span className="text-[11px] text-slate-600">Daire 14 &bull; Sema T. &bull; Dün</span>
                    </div>
                    <span className="text-xs font-medium text-slate-600">Tamamlandı</span>
                  </div>
                </div>
              )}

              {activeTab === "finans" && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-600">Kasa / Banka Bakiyesi</span>
                      <p className="text-xl font-extrabold text-slate-900 mt-1">₺64.820</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-600">Bu Ay Gelir</span>
                      <p className="text-xl font-extrabold text-emerald-600 mt-1">+₺48.500</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-600">Bu Ay Gider (Ortak Elektrik, Temizlik)</span>
                      <p className="text-xl font-extrabold text-rose-600 mt-1">-₺31.200</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              KAPSAMLI MODÜLLER
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              Yöneticinin yükünü azaltan, sakinlerin memnuniyetini artıran özellikler
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <Receipt className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Otomatik Aidat ve Makbuz</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Her ay başında aidat borçlarını tek tıkla tanımlayın. Tahsilat yapıldığında sakinlere resmi formatta e-posta makbuzu iletilir.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
                <Megaphone className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Dijital Duyuru Panosu</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Apartman girişine kağıt asmaya son. Toplantı, bakım ve acil duyuruları sistem üzerinden anında tüm sakinlerin cebine ulaştırın.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Arıza &amp; İstek Takip Sistemi</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sakinler karşılaştıkları sorunları fotoğraflı olarak iletsin. Yönetici süreci &quot;İşlemde&quot; veya &quot;Çözüldü&quot; olarak güncellesin.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Mobil Uygulama Uyumlu</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tüm ekran boyutlarına duyarlı PWA ve mobil uyumlu mimari. İlerleyen süreçte iOS ve Android mağaza uygulamasıyla tam entegre.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Yönetici Onaylı Üyelik</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Yeni sakinler kayıt olduğunda önce yönetici onayına düşer. Yabancı kişilerin bina verilerine erişmesi engellenir.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Şeffaf Kasa Raporları</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Gelir ve gider kalemlerini şeffaf biçimde tutun. Genel kurul toplantılarında tek tuşla denetim raporu çıktısı alın.
              </p>
            </div>

          </div>

          <div className="mt-12 text-center">
            <Link
              href="/ozellikler"
              className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800"
            >
              <span>Tüm modül detaylarını ve ekranları inceleyin</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works (Nasıl Çalışır) */}
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              KOLAY KURULUM
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              3 Basit Adımda Sisteme Geçiş Yapın
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Hesabınızı Açın</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Site adınızı ve daire sayınızı girerek ücretsiz deneme hesabınızı anında başlatın.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Sakinleri Ekleyin</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sakinleriniz webden kayıt olsun veya siz daire listesini topluca tanımlayın.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Yönetmeye Başlayın</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Aidatları tanımlayın, duyuruları paylaşın, tüm binayı dijital ortamda şeffaflıkla yönetin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sık Sorulan Sorular (FAQ) */}
      <section className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              MERAK EDİLENLER
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Sıkça Sorulan Sorular
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Ücretsiz deneme süresinde kredi kartı bilgisi gerekli mi?",
                a: "Hayır. 14 günlük ücretsiz deneme süresini başlatırken herhangi bir kart veya ödeme bilgisi talep edilmez. Sistemi tüm özellikleriyle riske girmeden test edebilirsiniz.",
              },
              {
                q: "Site sakinleri sisteme nasıl kayıt olur?",
                a: "Sakinler 'Hesap Aç' sayfasından sitenizi seçip ad ve daire bilgilerini girerek başvururlar. Güvenlik için başvuru yönetici onayına düşer. Yönetici onayladığı anda sakine otomatik giriş e-postası gider.",
              },
              {
                q: "Mobil cihazlardan veya telefonlardan kullanılabilir mi?",
                a: "Evet. Web sitemiz tüm akıllı telefonlar, tabletler ve bilgisayarlarla %100 uyumludur. Tarayıcıdan 'Ana Ekrana Ekle' diyerek uygulama gibi kullanabilirsiniz.",
              },
              {
                q: "Kendi domainim ve kurumsal e-postamla bildirim gönderebilir miyim?",
                a: "Evet. Resend veya SMTP entegrasyonu sayesinde onay, aidat makbuzu ve duyuru e-postaları kendi alan adınızdan (örneğin bildirim@siteniz.com) gönderilir.",
              },
              {
                q: "Verilerimiz nasıl saklanır, güvenli midir?",
                a: "Tüm verileriniz 256-Bit SSL şifreleme ile korunur. Günlük yedekleme alınır ve KVKK standartlarına uygun şekilde üçüncü şahıslarla paylaşılmaz.",
              },
            ].map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full py-4 px-6 text-left flex items-center justify-between font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-500 transition-transform ${
                        isOpen ? "rotate-180 text-indigo-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-indigo-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Sitenizi dijitalleştirmeye bugün başlayın
          </h2>
          <p className="text-indigo-100 text-base sm:text-lg max-w-xl mx-auto mb-8">
            14 günlük ücretsiz denemenizi başlatın, apartmanınızdaki düzen ve sakin memnuniyetini artırın.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/kayit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-white text-indigo-600 hover:bg-indigo-50 shadow-md transition-all text-sm sm:text-base"
            >
              Hemen Ücretsiz Hesap Aç
            </Link>
            <Link
              href="/destek"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-white bg-indigo-700 hover:bg-indigo-800 transition-all text-sm sm:text-base"
            >
              Bize Danışın
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
