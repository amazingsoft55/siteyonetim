import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  CreditCard,
  Megaphone,
  Wrench,
  ShieldCheck,
  BarChart3,
  Smartphone,
  Receipt,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  Lock,
} from "lucide-react";
import { getPublicSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Özellikler ve Modüller | Site Yönetimi",
  description:
    "Aidat takibi, dijital duyurular, arıza talepleri, kasa raporları ve sakin onay mekanizması gibi tüm modülleri inceleyin.",
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
            MODÜL &amp; ÖZELLİK DETAYLARI
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-4 mb-4">
            Site ve apartmanınızı yönetmek için ihtiyacınız olan her şey
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Kat Mülkiyeti Kanunu standartlarına uygun olarak tasarlanmış, sakinleri ve yöneticileri aynı dijital çatı altında buluşturan profesyonel araçlar.
          </p>
        </div>
      </section>

      {/* Main Content Modules */}
      <main className="max-w-6xl mx-auto px-6 py-16 space-y-20">

        {/* Modül 1: Aidat & Finans */}
        <section id="aidat" className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold mb-4">
              <CreditCard className="h-4 w-4" />
              AİDAT &amp; FİNANSAL YÖNETİM
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Geciken aidatlara ve manuel hesap karmaşasına son
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
              Her ay başında tüm blok ve dairelere tek tuşla aidat tahakkuk ettirin. Yapılan tahsilatları kaydedin ve sakinlere anında resmi e-posta makbuzu ulaştırın.
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Tek tıkla aylık toplu aidat ve ek gider borçlandırması</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Kişiye özel ödeme makbuzu üretimi ve e-posta bildirimi</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Ödenmeyen aidatlar için gecikme takibi ve liste dökümü</span>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700">Tahsilat Özeti (Eylül)</span>
                <span className="text-xs font-bold text-emerald-600">%94 Tahsil Edildi</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-800">Daire 1 - Ahmet Y.</span>
                  <span className="text-emerald-600 font-bold">1.500 ₺ (Ödendi)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-800">Daire 2 - Fatma K.</span>
                  <span className="text-emerald-600 font-bold">1.500 ₺ (Ödendi)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-800">Daire 3 - Burak D.</span>
                  <span className="text-rose-600 font-bold">1.500 ₺ (Bekliyor)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Modül 2: Duyuru Sistemi */}
        <section id="duyuru" className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 bg-white rounded-3xl p-6 shadow-md border border-slate-200">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">GENEL KURUL</span>
                <p className="text-xs font-bold text-slate-900 mt-1">Olağan Kat Malikleri Toplantısı</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Toplantı salonunda saat 20:00&apos;de yapılacaktır.</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">SU KESİNTİSİ</span>
                <p className="text-xs font-bold text-slate-900 mt-1">Şebeke Boru Yenileme Çalışması</p>
                <p className="text-[11px] text-slate-500 mt-0.5">14:00 - 17:00 saatleri arasında su kesintisi olacaktır.</p>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold mb-4">
              <Megaphone className="h-4 w-4" />
              DİJİTAL DUYURU MERKEZİ
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Tüm sakinlere saniyeler içinde ulaşan şeffaf iletişim
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
              Apartman panosuna kağıt asarak vakit kaybetmeyin. Toplantı kararları, bakım duyuruları ve acil durum bildirimleri doğrudan sakinlerin telefonuna ulaşsın.
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Kategorize duyurular (Toplantı, Bakım, Genel, Acil)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Duyurulara görsel ve dosya ekleme desteği</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>E-posta ve tarayıcı anlık bildirim entegrasyonu</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Modül 3: Arıza & Talep Takibi */}
        <section id="ariza" className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold mb-4">
              <Wrench className="h-4 w-4" />
              ARIZA &amp; TALEP ÇÖZÜM SİSTEMİ
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Sorunlar kaybolmaz, adım adım çözüme kavuşur
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
              Sakinler karşılaştıkları teknik arızaları veya istekleri fotoğraflı olarak iletir. Yönetici sürecin her adımında durumu güncelleyerek şeffaflık sağlar.
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Fotoğraf ve detay açıklamalı arıza bildirimleri</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Durum takibi: Açık, İnceleniyor, Çözüldü</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Talep çözüldüğünde sakine otomatik e-posta bilgilendirmesi</span>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900">Asansör Kapı Sensörü Arızası</span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">İnceleniyor</span>
                </div>
                <p className="text-slate-500">Servis çağrıldı, parça değişimi yapılacak.</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900">Bahçe Aydınlatma Onarımı</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">Çözüldü</span>
                </div>
                <p className="text-slate-500">Ampuller LED modellerle yenilendi.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Modül 4: Yönetici Onaylı Güvenlik */}
        <section className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 bg-white rounded-3xl p-6 shadow-md border border-slate-200">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <UserCheck className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Güvenli Yönetici Onay Mekanizması</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Her yeni kayıt yönetici tarafından incelenir. Yöneticinin onaylamadığı hiçbir hesap site verilerine erişemez.
              </p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold mb-4">
              <ShieldCheck className="h-4 w-4" />
              GÜVENLİK &amp; DOĞRULAMA
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Site verileriniz sadece bina sakinlerine açıktır
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
              Web üzerinden hesap açan her sakin önce &quot;Onay Bekliyor&quot; aşamasına alınır. Yönetici onay verdiğinde sakine şık bir karşılama e-postası gider ve giriş hakkı tanınır.
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Yönetici paneli onay bekleyenler listesi ve 1 tıkla onay</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Otomatik tetiklenen kurumsal onay e-postası</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>KVKK uyumlu güvenli parola saklama ve oturum yönetimi</span>
              </li>
            </ul>
          </div>
        </section>

      </main>

      {/* CTA Section */}
      <section className="py-16 bg-white border-t border-slate-200 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
            Apartmanınız için modern bir başlangıç yapın
          </h2>
          <p className="text-slate-600 text-base max-w-xl mx-auto mb-8">
            Hemen ücretsiz hesap oluşturun ve yönetim panelinizi dakikalar içinde kullanmaya başlayın.
          </p>
          <Link
            href="/kayit"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all text-base"
          >
            <span>Ücretsiz Kayıt Ol</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
