import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MapPin, Phone, Mail } from "lucide-react";

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

          {/* Form */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-2xl font-bold mb-6">Mesaj Gönderin</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ad Soyad</label>
                <input type="text" className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-2.5 px-4 focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">E-Posta</label>
                <input type="email" className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-2.5 px-4 focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mesajınız</label>
                <textarea rows={4} className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-2.5 px-4 focus:ring-2 focus:ring-indigo-600 outline-none resize-none"></textarea>
              </div>
              <button type="button" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors">
                Gönder
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
