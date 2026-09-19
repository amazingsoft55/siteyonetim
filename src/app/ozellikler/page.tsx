import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  MessagesSquare,
  Vote,
  ShieldCheck,
  Megaphone,
  Wrench,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  Lock,
  Receipt,
  HeartHandshake,
  EyeOff,
  Coins,
  UserCheck,
} from "lucide-react";
import { getPublicSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Özellikler | Güvenli Komşuluk Ağı & Apartman Yönetimi",
  description:
    "WhatsApp karmaşasına son veren güvenli komşuluk ağı, bina içi oylama, şeffaf kasa ve fotoğraflı arıza takip modülleri.",
  alternates: { canonical: `${getPublicSiteUrl()}/ozellikler` },
};

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {/* Hero Header */}
      <section className="pt-16 pb-14 bg-white border-b border-slate-200/80 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-full">
            MODÜLLER &amp; ÖZELLİKLER
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-4 mb-4">
            WhatsApp Kaosuna Son: Modern Komşuluk &amp; Yönetim
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Telefon numarası ifşası olmadan güvenli komşuluk iletişimi, bina içi hızlı anketler ve sıfır komisyonlu şeffaf aidat takibi.
          </p>
        </div>
      </section>

      {/* Main Content Modules */}
      <main className="max-w-6xl mx-auto px-6 py-16 space-y-20">

        {/* Modül 1: Komşuluk Ağı & Grup Sohbeti */}
        <section id="topluluk" className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold mb-4">
              <MessagesSquare className="h-4 w-4" />
              GÜVENLİ KOMŞULUK AĞI &amp; GRUPLAR
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Telefon numaranız gizli, komşuluk iletişimi canlı
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
              WhatsApp gruplarında kişisel telefon numaraları ifşa olurken; sistemimizde herkes yalnızca daire numarası ve ismiyle görünür.
              Konusuna göre ayrılmış kanallar ile düzen sağlanır.
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>%100 KVKK Korumalı:</strong> Komşular birbirinin numarasını göremez.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Tematik Kanallar:</strong> Yardımlaşma, İkinci El Eşya, Evcil Hayvanlar vb.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Yönetici Moderasyonu:</strong> Uygunsuz mesajları anında kaldırma imkanı.</span>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700">#Yardımlaşma &amp; Ödünç</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">Numaralar Gizli</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800">Daire 4 - Selin K.:</span> &ldquo;Merdiven lazım oldu, 1 saatliğine ödünç alabilir miyim?&rdquo;
                </div>
                <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
                  <span className="font-bold">Daire 9 - Ahmet Y.:</span> &ldquo;Tabii Selin Hanım, kapıdayım verebilirim.&rdquo;
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Modül 2: Anket & Oylama */}
        <section id="anket" className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 bg-white rounded-3xl p-6 shadow-md border border-slate-200">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                  <Vote className="h-4 w-4" /> Bina İçi Canlı Oylama
                </span>
                <span className="text-xs text-slate-400">18 Oy</span>
              </div>
              <p className="text-xs font-bold text-slate-900">Bahçe aydınlatması saat kaça kadar açık kalsın?</p>
              <div className="space-y-1.5 text-xs">
                <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg font-bold flex justify-between">
                  <span>Gece 01:00&apos;e kadar</span>
                  <span>%75 (14 oy)</span>
                </div>
                <div className="p-2 bg-white border border-slate-200 rounded-lg flex justify-between text-slate-600">
                  <span>Sabaha kadar açık kalsın</span>
                  <span>%25 (4 oy)</span>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-bold mb-4">
              <Vote className="h-4 w-4" />
              DEMOKRATİK KARAR ALMA
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Toplantı beklemeden bina kararlarını anında oylayın
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
              Bina sakinlerinin görüşünü almak için haftalarca toplantı organize etmeye gerek yok.
              Yönetici veya komşular tek tıkla anket başlatır, sakinler oylarını telefonlarından verir.
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Anlık yüzdeler ve katılım oranları</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Her daire için 1 adil oy hakkı</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Modül 3: Şeffaf Kasa & 0% Komisyonlu IBAN */}
        <section id="finans" className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold mb-4">
              <Receipt className="h-4 w-4" />
              ŞEFFAF KASA &amp; SIFIR KOMİSYON
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Aracı POS komisyonu yok, doğrudan banka güvenliği
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
              Aracı kart kuruluşlarına %3-4 aidat komisyonu ödemeyin. Sitenizin resmi banka IBAN&apos;ı
              tek tuşla kopyalanır, sakinler FAST/EFT ile öder ve kasa hareketleri şeffaf şekilde listelenir.
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Tek tıkla IBAN ve açıklama kopyalama rehberi</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Gelir-Gider kasa defteri ve sakin dökümü</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Gecikmiş borç listesi ve bildirimler</span>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase">SİTE RESMİ HESABI</span>
              <p className="font-mono text-xs sm:text-sm font-bold text-indigo-300 break-all">
                TR33 0006 1005 1982 0000 1234 56
              </p>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-xs">
                <span className="text-slate-400">Komisyon:</span>
                <span className="text-emerald-400 font-bold">%0 (Doğrudan Banka)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Modül 4: Fotoğraflı Arıza & İstek Takibi */}
        <section id="talep" className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 bg-white rounded-3xl p-6 shadow-md border border-slate-200">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700">Arıza Takip Kartı</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">İşlemde</span>
              </div>
              <p className="text-xs font-bold text-slate-900">3. Kat Aydınlatma Sensörü Çalışmıyor</p>
              <p className="text-[11px] text-slate-500">Daire 7 • Elektrikçiye iş emri verildi.</p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold mb-4">
              <Wrench className="h-4 w-4" />
              ARIZA &amp; İSTEK YÖNETİMİ
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Sakinlerden gelen talepleri düzenli şekilde yönetin
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
              Asansör arızası, çatı akması veya bahçe bakımı gibi sorunları telefonla anlatmak yerine fotoğraflı talep olarak sisteme işleyin.
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Fotoğraflı bildirim ve durum güncellemeleri</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Çözüldü / Reddedildi gerekçeleri ve fotoğrafları</span>
              </li>
            </ul>
          </div>
        </section>

      </main>

      {/* CTA Section */}
      <section className="py-16 bg-white border-t border-slate-200/80 text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Sitenizde güvenli komşuluk ve düzeni hemen başlatın
          </h2>
          <div className="pt-2">
            <Link
              href="/kayit"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md transition-all"
            >
              <span>Ücretsiz Denemeyi Başlat</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
