"use client";

import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  MessagesSquare,
  Vote,
  ShieldCheck,
  Megaphone,
  Wrench,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  Sparkles,
  ChevronDown,
  Lock,
  Receipt,
  Layers,
  HelpCircle,
  PhoneCall,
  UserPlus,
  LogIn,
  HeartHandshake,
  ShoppingBag,
  Clock,
  EyeOff,
  Coins,
} from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = React.useState<"sohbet" | "anket" | "kasa" | "talep">("sohbet");
  const [demoVote, setDemoVote] = React.useState<number | null>(0);
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      {/* ══════ HERO SECTION ══════ */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Decorative background gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial from-indigo-100/70 via-slate-50 to-transparent -z-10 blur-2xl" />

        <div className="max-w-6xl mx-auto px-6 text-center">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs sm:text-sm font-semibold mb-6 shadow-xs">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span>WhatsApp Gruplarının Kaosuna ve Numara İfşasına Son!</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            Güvenli Komşuluk Ağı, Grup Sohbeti ve{" "}
            <span className="text-indigo-600">Şeffaf Apartman Portalı</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10">
            Telefon numaranızı komşularınıza ifşa etmeden iletişim kurun, bina kararlarını anketlerle oylayın,
            resmi duyuruları kaybetmeyin ve aidatları <strong>sıfır komisyonla</strong> doğrudan banka hesabınızda takip edin.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-14">
            <Link
              href="/kayit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
            >
              <UserPlus className="h-5 w-5" />
              <span>Ücretsiz Hesap Aç</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/90 shadow-xs transition-all"
            >
              <LogIn className="h-4 w-4 text-slate-500" />
              <span>Giriş Yap</span>
            </Link>
          </div>

          {/* Key Value Proposition Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-emerald-600" />
              <span>Gizli Numara (KVKK Korumalı)</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-emerald-600" />
              <span>%0 POS Komisyonu (Sıfır Yasal Risk)</span>
            </div>
            <div className="flex items-center gap-2">
              <Vote className="h-4 w-4 text-indigo-600" />
              <span>1 Tıkla Bina İçi Oylama</span>
            </div>
          </div>
        </div>

        {/* ══════ LIVE INTERACTIVE APP DEMO MOCKUP ══════ */}
        <div className="max-w-5xl mx-auto px-4 mt-14 sm:mt-18">
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200/90">
            {/* Mockup Topbar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-slate-500 ml-2">
                  Lale Sitesi • Komşuluk &amp; Yönetim Portalı
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>KVKK Gizlilik Koruması Aktif</span>
              </div>
            </div>

            {/* Interactive Tab Selector */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("sohbet")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === "sohbet"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <MessagesSquare className="h-4 w-4" />
                <span>Komşu Sohbeti &amp; Gruplar</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("anket")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === "anket"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Vote className="h-4 w-4" />
                <span>Bina İçi Oylama &amp; Anket</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("kasa")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === "kasa"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Receipt className="h-4 w-4" />
                <span>Şeffaf Kasa &amp; IBAN Takip</span>
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
                <span>Arıza &amp; İstek Bildirimi</span>
              </button>
            </div>

            {/* Tab Preview Container */}
            <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-6 border border-slate-200/80 min-h-[320px]">
              {/* TAB 1: SOHBET & GRUPLAR */}
              {activeTab === "sohbet" && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                        <HeartHandshake className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-800">#Yardımlaşma &amp; Ödünç</p>
                        <p className="text-[10px] text-slate-500">Komşular arası araç gereç ve destek kanalı</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                      🔒 Telefonlar Gizli
                    </span>
                  </div>

                  <div className="space-y-2.5 max-w-xl mx-auto">
                    {/* Message 1 */}
                    <div className="flex flex-col items-start">
                      <span className="text-[11px] font-bold text-slate-700 ml-1 mb-0.5">
                        Daire 8 • Fatma K.
                      </span>
                      <div className="bg-white p-3 rounded-2xl rounded-bl-xs border border-slate-200 text-xs text-slate-800 shadow-xs">
                        Merhaba komşular, bugün için matkap ödünç verebilecek biri var mı acaba? 1 saatte geri teslim edeceğim.
                      </div>
                    </div>

                    {/* Message 2 */}
                    <div className="flex flex-col items-end">
                      <span className="text-[11px] font-bold text-indigo-900 mr-1 mb-0.5">
                        Daire 14 • Siz (Mehmet Y.)
                      </span>
                      <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-br-xs text-xs shadow-xs">
                        Merhabalar Fatma Hanım, bende darbeli matkap var, gelip alabilirsiniz Daire 14&apos;ten.
                      </div>
                    </div>

                    {/* Message 3 */}
                    <div className="flex flex-col items-start">
                      <span className="text-[11px] font-bold text-slate-700 ml-1 mb-0.5">
                        Daire 8 • Fatma K.
                      </span>
                      <div className="bg-white p-3 rounded-2xl rounded-bl-xs border border-slate-200 text-xs text-slate-800 shadow-xs">
                        Çok teşekkür ederim Mehmet Bey, hemen uğruyorum! 🙏
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ANKET & OYLAMA */}
              {activeTab === "anket" && (
                <div className="space-y-4 animate-in fade-in duration-200 max-w-lg mx-auto bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <Vote className="h-3.5 w-3.5" /> Bina İçi Canlı Oylama
                    </span>
                    <span className="text-xs text-slate-400">Toplam 24 Oy</span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900">
                    Bina dış cephesi ve bahçe demirleri hangi renge boyansın?
                  </h4>

                  <div className="space-y-2">
                    {[
                      { text: "Antrasit Gri & Beyaz", count: 16, percent: 67 },
                      { text: "Açık Bej & Kahve", count: 6, percent: 25 },
                      { text: "Mevcut Renk Korunsun", count: 2, percent: 8 },
                    ].map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setDemoVote(idx)}
                        className={`w-full text-left relative overflow-hidden rounded-xl p-3 text-xs border transition-all ${
                          demoVote === idx
                            ? "border-indigo-600 bg-indigo-50/60 font-bold text-indigo-950"
                            : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <div
                          className="absolute inset-y-0 left-0 bg-indigo-500/15"
                          style={{ width: `${opt.percent}%` }}
                        />
                        <div className="relative flex items-center justify-between z-10">
                          <span className="flex items-center gap-2">
                            {demoVote === idx && (
                              <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                            )}
                            {opt.text}
                          </span>
                          <span className="font-semibold text-[11px] opacity-80">
                            %{opt.percent} ({opt.count} oy)
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 text-center">
                    👆 Seçeneklere tıklayarak canlı anket demosunu test edebilirsiniz.
                  </p>
                </div>
              )}

              {/* TAB 3: ŞEFFAF KASA */}
              {activeTab === "kasa" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Kasa Bakiyesi</span>
                      <p className="text-xl font-black text-emerald-600 mt-1">₺64.800</p>
                      <span className="text-[10px] text-slate-400">Banka Hesabında</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Bu Ayki Gelir</span>
                      <p className="text-xl font-black text-indigo-600 mt-1">₺32.000</p>
                      <span className="text-[10px] text-slate-400">Aidat ve Ortak Gider</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Bu Ayki Gider</span>
                      <p className="text-xl font-black text-rose-600 mt-1">₺18.450</p>
                      <span className="text-[10px] text-slate-400">Asansör, Elektrik, Temizlik</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Resmi Hesap IBAN: <span className="font-mono text-indigo-600">TR33 0006 1005 1982 0000 1234 56</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                      %0 Komisyon (Doğrudan Banka)
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 4: TALEP & ARIZA */}
              {activeTab === "talep" && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                        <Wrench className="h-4 w-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">B Blok Asansör Kapı Sensörü Arızası</h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">Daire 12 tarafından bildirildi • Yetkili servise iletildi.</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                      İşlemde
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">Bahçe Otomatik Sulama Hattı Tamiri</h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">Bahçıvan tarafından vana değiştirildi.</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      Çözüldü
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════ WHY 80%+ OF APARTMENTS PREFER THIS (THE CORE PIVOT) ══════ */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">
              Neden WhatsApp Grupları Yerine Bu Sistemi Seçiyorlar?
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Apartman Yaşamında Huzur, Güvenlik ve Şeffaflık
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-indigo-200 transition-all space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <EyeOff className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                Numarasız &amp; KVKK Korumalı Komşuluk
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                WhatsApp gruplarında telefon numaranız onlarca yabancıya açılır. Sistemimizde kişisel numaranız gizlidir; sadece Daire No ve isim görünür.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-indigo-200 transition-all space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Coins className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                %0 Komisyon &amp; Yasal Risk Sıfır
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Aracı kart kuruluşlarına %3-4 aidat komisyonu kaptırmazsınız. Sakinler banka IBAN&apos;ına FAST/EFT ile öder, kasa otomatik işlenir.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-indigo-200 transition-all space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center">
                <Vote className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                Demokratik Hızlı Oylama &amp; Anketler
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Apartman toplantılarını beklemeden; temizlik saati, bahçe düzeni veya tadilat kararlarını tek tıkla oylamaya açın.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-indigo-200 transition-all space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Megaphone className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                Kaybolmayan Resmi Duyuru Panosu
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Geyik mesajları arasında kaybolan yönetici duyurularına son. Yalnızca yönetimin yazdığı resmi kanaldan tüm bina haberdar olur.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-indigo-200 transition-all space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                Yardımlaşma &amp; İkinci El Pazarı
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Komşularınızla alet edevat ödünç verin, taşınan sakinlerin bıraktığı temiz mobilyaları veya çocuk eşyalarını bina içinde devredin.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-indigo-200 transition-all space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Wrench className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                Fotoğraflı Arıza &amp; İstek Takibi
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sakinler bozuk lamba veya asansör arızasını fotoğrafla bildirir; yönetici tamir ettirip çözüldü görseliyle yanıt verir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ SIKÇA SORULAN SORULAR ══════ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">
              Merak Edilenler
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900">
              Sıkça Sorulan Sorular
            </h3>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Telefon numaram diğer komşular tarafından görülür mü?",
                a: "Hayır. Sistemimiz %100 KVKK ve gizlilik odaklıdır. Komşularınız yalnızca daire numaranızı ve isminizi görür. Telefon numaranız ve e-posta adresiniz asla komşularla paylaşılmaz.",
              },
              {
                q: "Aidat ödemelerinde komisyon veya aracı POS ücreti var mı?",
                a: "Hayır. Sistemimizde aracı online kart kuruluşları bulunmaz; böylece %3-4 gibi yüksek POS komisyonları ödemezsiniz. Sakinler doğrudan sitenizin resmi banka IBAN hesabına EFT/FAST ile ödeme yapar ve yönetim tek tıkla onaylar.",
              },
              {
                q: "Apartman sakinlerinin sisteme katılması zor mu?",
                a: "Çok kolay! Sakinler sadece bir bağlantıya tıklayarak saniyeler içinde ad-soyad ve daire numarasıyla kayıt olur. Yönetici onay verdiği anda komşuluk sohbetine ve duyurulara erişirler.",
              },
              {
                q: "Yönetici olarak uygunsuz mesajları silebilir miyim?",
                a: "Evet. Yönetici panelinden tüm mesajları anında modere edebilir, resmi duyuru kanallarını sadece yönetimin yazabileceği şekilde kilitleyebilirsiniz.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-5 font-bold text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      openFaq === idx ? "rotate-180 text-indigo-600" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ BOTTOM CTA ══════ */}
      <section className="py-16 bg-gradient-to-br from-indigo-900 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black">
            Apartmanınızda Yeni Bir Komşuluk Dönemi Başlatın
          </h2>
          <p className="text-sm sm:text-base text-indigo-200 max-w-xl mx-auto">
            14 gün boyunca tüm özellikleri ücretsiz deneyin. Kredi kartı gerekmez, kurulum dakikalar sürer.
          </p>
          <div className="pt-2">
            <Link
              href="/kayit"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-indigo-900 font-extrabold text-sm hover:bg-indigo-50 shadow-xl transition-all"
            >
              <UserPlus className="h-4 w-4" /> Ücretsiz Başlayın
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
