import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MapPin, Phone, Mail } from "lucide-react";
import { getPublicSiteUrl } from "@/lib/site-url";
import { PublicContactForm } from "@/components/PublicContactForm";

const iletisimCanonical = `${getPublicSiteUrl()}/iletisim`;

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Site Yönetimi iletişim: apartman ve site yönetim yazılımı, aidat takibi ve uygulama desteği için bize ulaşın.",
  alternates: { canonical: iletisimCanonical },
  openGraph: {
    title: "İletişim | Site Yönetimi",
    description:
      "Apartman site yönetim platformu hakkında sorularınız ve kurumsal iletişim bilgileri.",
    url: iletisimCanonical,
  },
};

export default function Iletisim() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-6 py-24 w-full">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-center">İletişim</h1>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-16 max-w-2xl mx-auto text-lg">
          Her türlü soru, görüş ve öneriniz için bize ulaşabilirsiniz. Müşteri temsilcilerimiz en kısa sürede size dönüş yapacaktır.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* İletişim Bilgileri */}
          <div>
            <h2 className="text-2xl font-bold mb-8">Bize Ulaşın</h2>
            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Adres</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                    Örnek Mahallesi, Teknoloji Caddesi No:42<br />
                    Kadıköy, İstanbul
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Telefon</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                    0 (850) 123 45 67
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">E-Posta</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                    destek@siteyonetimi.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          <PublicContactForm defaultSource="iletisim" headline="Mesaj gönderin" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
