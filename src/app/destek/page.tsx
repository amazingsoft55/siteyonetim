import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  LifeBuoy,
  Mail,
  HelpCircle,
  CreditCard,
  UserCheck,
  Wrench,
  BookOpen,
  Phone,
  MessageSquare,
} from "lucide-react";
import { getPublicSiteUrl } from "@/lib/site-url";
import { PublicContactForm } from "@/components/PublicContactForm";

const u = `${getPublicSiteUrl()}/destek`;

export const metadata: Metadata = {
  title: "Destek ve Yardım Merkezi | Site Yönetimi",
  description:
    "Apartman ve site yönetimi sistemi ile ilgili sıkça sorulan sorular, kullanım rehberleri ve doğrudan teknik destek formu.",
  alternates: { canonical: u },
};

const guideTopics = [
  {
    icon: UserCheck,
    title: "Kayıt ve Yönetici Onayı",
    desc: "Hesap açma formunu doldurduktan sonra yöneticiniz onayladığında e-posta ile bilgilendirilirsiniz.",
  },
  {
    icon: CreditCard,
    title: "Aidat ve Borç Görüntüleme",
    desc: "Sakin panelinize giriş yaparak geçmiş ve güncel aidat borçlarınızı ve makbuzlarınızı görebilirsiniz.",
  },
  {
    icon: Wrench,
    title: "Arıza ve Talep İletme",
    desc: "Bina içerisindeki ortak alan arızalarını fotoğraf ekleyerek yöneticiye doğrudan iletebilirsiniz.",
  },
  {
    icon: BookOpen,
    title: "Yönetici Rehberi",
    desc: "Blok tanımlama, sakin onaylama, aidat tahakkuk ettirme ve gelir/gider kaydı adımları.",
  },
];

export default function DestekPublicPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {/* Header */}
      <section className="pt-16 pb-12 bg-white border-b border-slate-200 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-full">
            YARDIM VE DESTEK MERKEZİ
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-4 mb-4">
            Size nasıl yardımcı olabiliriz?
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Sistem kullanımı, hesap onayı ve teknik konular hakkında merak ettikleriniz için rehberlerimizi inceleyin veya bize yazın.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-16 w-full space-y-16">
        
        {/* Quick Knowledge Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {guideTopics.map((topic, i) => {
            const Icon = topic.icon;
            return (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 mb-1.5">{topic.title}</h2>
                <p className="text-xs text-slate-600 leading-relaxed">{topic.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Support Form & Direct Contact */}
        <div className="grid lg:grid-cols-5 gap-12 items-start pt-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold mb-3">
                <LifeBuoy className="h-4 w-4" />
                Doğrudan Destek Ekibi
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
                Sorunuzu Bize İletin
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm">
                Aşağıdaki formu doldurduğunuzda destek talebiniz doğrudan teknik ekibimize iletilir ve en kısa sürede e-posta ile yanıtlanır.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">E-Posta ile İletişim</h3>
                  <a
                    href="mailto:destek@siteyonetim.keskindev.com"
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    destek@siteyonetim.keskindev.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Telefon Destek Hattı</h3>
                  <p className="text-xs text-slate-600">0 (850) 123 45 67 (Hafta içi 09:00 - 18:00)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <PublicContactForm defaultSource="destek" headline="Destek Bileti Oluşturun" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
