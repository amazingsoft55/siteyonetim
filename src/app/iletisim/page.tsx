import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MapPin, Phone, Mail, Clock, MessageSquare } from "lucide-react";
import { getPublicSiteUrl } from "@/lib/site-url";
import { PublicContactForm } from "@/components/PublicContactForm";

const iletisimCanonical = `${getPublicSiteUrl()}/iletisim`;

export const metadata: Metadata = {
  title: "İletişim | Site Yönetimi",
  description:
    "Site Yönetimi iletişim bilgileri, ofis adresi, müşteri temsilcisi telefon numarası ve mesaj gönderme formu.",
  alternates: { canonical: iletisimCanonical },
};

export default function Iletisim() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {/* Header */}
      <section className="pt-16 pb-12 bg-white border-b border-slate-200 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-full">
            KURUMSAL İLETİŞİM
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-4 mb-4">
            Bize Ulaşın
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Satış öncesi sorularınız, kurumsal teklif talepleri ve iş birliği görüşmeleri için bize dilediğiniz zaman ulaşabilirsiniz.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* İletişim Bilgileri */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Merkez Ofis &amp; İletişim</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Müşteri temsilcilerimiz mesai saatleri içinde ortalama 15 dakika içinde geri dönüş sağlamaktadır.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 items-start p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Ofis Adresi</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Büyükdere Caddesi, Levent Plaza No:142 Kat:8<br />
                    Şişli / İstanbul, Türkiye
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 shrink-0">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Telefon &amp; Çağrı Merkezi</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    0 (850) 123 45 67 &bull; 0 (212) 555 01 23
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 shrink-0">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">E-Posta Adresleri</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Genel: <a href="mailto:info@siteyonetimi.app" className="text-indigo-600 hover:underline">info@siteyonetimi.app</a><br />
                    Destek: <a href="mailto:destek@siteyonetimi.app" className="text-indigo-600 hover:underline">destek@siteyonetimi.app</a>
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 shrink-0">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Çalışma Saatleri</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Pazartesi - Cuma: 09:00 - 18:00<br />
                    Cumartesi: 10:00 - 14:00 (Acil Nöbetçi Destek)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* İletişim Formu */}
          <div>
            <PublicContactForm defaultSource="iletisim" headline="Bize Mesaj Gönderin" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
