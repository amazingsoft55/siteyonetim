import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Shield, Sparkles, Users, Lock, Award, Building2, CheckCircle2, ArrowRight } from "lucide-react";
import { getPublicSiteUrl } from "@/lib/site-url";

const canon = `${getPublicSiteUrl()}/hakkimizda`;

export const metadata: Metadata = {
  title: "Hakkımızda & Vizyonumuz | Site Yönetimi",
  description:
    "Apartman ve toplu yaşam alanlarında şeffaflık, huzur ve dijital dönüşüm sağlayan yönetim platformumuz hakkında bilgi edinin.",
  alternates: { canonical: canon },
};

export default function Hakkimizda() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {/* Header */}
      <section className="pt-16 pb-12 bg-white border-b border-slate-200 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-full">
            BİZ KİMİZ?
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-4 mb-4">
            Yaşam Alanlarında Güven ve Şeffaflık
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Apartman, site ve rezidans yönetimlerinin karşılaştığı iletişim, tahsilat ve organizasyon zorluklarını modern teknolojiyle çözüyoruz.
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 py-16 w-full space-y-16">
        
        {/* Story Section */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Neden Buradayız?</h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Geleneksel apartman yönetimlerinde yaşanan kağıt makbuz kayıpları, duyuruların fark edilmemesi, geciken arıza onarımları ve aidat tartışmaları hem yöneticileri yıpratmakta hem de sakinlerin güvenini sarsmaktadır.
          </p>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Site Yönetimi olarak vizyonumuz; Kat Mülkiyeti Kanunu esaslarına tam uyumlu, her sakinin borcunu ve binadaki gelişmeleri anında görebildiği, yöneticilerin ise muhasebe ve bildirim yükünü dakikalara indiren şeffaf bir dijital köprü kurmaktır.
          </p>
        </section>

        {/* Core Pillars */}
        <section className="grid sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Tam Şeffaflık</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Kasa bakiyesi, gelir ve gider kalemleri düzenli olarak kayıt altına alınır, genel kurullarda hesap vermek kolaylaşır.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">KVKK ve Güvenlik</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Kullanıcı verileri 256-bit SSL şifreleme ve onaylı kimlik doğrulama mekanizmalarıyla en üst düzeyde korunur.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Sakin Memnuniyeti</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Arıza ve talepler kayıt altına alınarak adım adım takip edilir, sakinler önemsendiğini hisseder.
            </p>
          </div>
        </section>

        {/* Call to action */}
        <section className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Siz de Sitenizi Dijitalleştirin</h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            14 günlük ücretsiz deneme ile binanızın yönetimini modernleştirin.
          </p>
          <div className="pt-2">
            <Link
              href="/kayit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all text-sm shadow-xs"
            >
              <span>Hemen Başla</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
