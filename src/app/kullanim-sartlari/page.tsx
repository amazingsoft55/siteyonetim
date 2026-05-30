import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FileText, ArrowLeft, Calendar, Mail, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Kullanım Şartları — Site Yönetimi",
  description: "Site Yönetimi platformunun kullanım şartları ve kuralları.",
};

export default function KullanimSartlari() {
  const guncellemeTarihi = "31 Mayıs 2026";

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <Navbar />

      <main className="flex-1">
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Ana sayfaya dön
            </Link>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Kullanım Şartları</h1>
                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Son güncelleme: {guncellemeTarihi}
                </div>
              </div>
            </div>

            <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                <p className="text-indigo-800 dark:text-indigo-200 font-medium">
                  Site Yönetimi platformunu kullanarak bu kullanım şartlarını kabul etmiş sayılırsınız.
                </p>
              </div>

              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">1. Hizmet Tanımı</h2>
                <p>
                  Site Yönetimi, apartman ve site yöneticileri ile sakinleri arasındaki iletişimi
                  kolaylaştıran, aidat takibi, duyuru yönetimi ve arıza/talep yönetimi sunan
                  dijital bir platformdur. Platform web tabanlı ve mobil uygulama (PWA) olarak
                  erişilebilir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">2. Hesap Oluşturma</h2>
                <ul className="list-disc list-inside space-y-2 mt-3">
                  <li>Platformu kullanabilmek için geçerli bir hesap oluşturmanız veya yönetici tarafından eklenmeniz gerekir.</li>
                  <li>Hesap bilgilerinizin doğru ve güncel olmasını sağlamak sizin sorumluluğunuzdadır.</li>
                  <li>Hesabınızın güvenliği sizin sorumluluğunuzdadır; şifrenizi kimseyle paylaşmamalısınız.</li>
                  <li>Hesabınızda şüpheli bir aktivite fark ederseniz hemen bizimle iletişime geçmelisiniz.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">3. Kullanım Kuralları</h2>
                <p>Platformu kullanırken aşağıdaki kurallara uymalısınız:</p>
                <ul className="list-disc list-inside space-y-2 mt-3">
                  <li>Platformu yalnızca yasal amaçlar için kullanmalısınız.</li>
                  <li>Diğer kullanıcıların haklarını ihlal eden davranışlarda bulunmamalısınız.</li>
                  <li>Yanıltıcı, yanlış veya zararlı içerik paylaşmamalısınız.</li>
                  <li>Platformun altyapısına veya işlevselliğine zarar vermemelisiniz.</li>
                  <li>Otomatik programlar veya botlar kullanarak platformu manipüle etmemelisiniz.</li>
                  <li>Başka bir kullanıcı gibi davranmamalı veya kimlik avı yapmamalısınız.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">4. Abonelik ve Ödeme</h2>
                <ul className="list-disc list-inside space-y-2 mt-3">
                  <li>Platform ücretsiz deneme süresi sunar; deneme süresinde kredi kartı bilgisi gerekmez.</li>
                  <li>Deneme süresinin sonunda abonelik paketlerinden birini seçmeniz gerekir.</li>
                  <li>Fiyatlar Türk Lirası (TL) cinsindendir ve KDV dahildir.</li>
                  <li>Aboneliğinizi istediğiniz zaman iptal edebilirsiniz; iptal mevcut dönem sonunda geçerli olur.</li>
                  <li>Ödeme bilgileriniz güvenli ödeme altyapısı üzerinden işlenir.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">5. İçerik ve Fikri Mülkiyet</h2>
                <ul className="list-disc list-inside space-y-2 mt-3">
                  <li>Platform üzerinde paylaştığınız içeriklerin (duyuru, talep vb.) sorumluluğu size aittir.</li>
                  <li>Platformun tüm arayüz, kod ve tasarım unsurları Site Yönetimi&apos;nin fikri mülkiyetindedir.</li>
                  <li>Platformun izinsiz olarak kopyalanması, değiştirilmesi veya dağıtılması yasaktır.</li>
                  <li>Kullanıcılar, kendi içeriklerinin telif hakkını saklı tutar.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">6. Sorumluluk Sınırlamaları</h2>
                <ul className="list-disc list-inside space-y-2 mt-3">
                  <li>Platform &quot;olduğu gibi&quot; sunulur; hizmetin kesintisiz veya hatasız olacağı garanti edilmez.</li>
                  <li>Platform kullanımıyla ilgili doğrudan veya dolaylı zararlardan sorumlu değiliz.</li>
                  <li>Üçüncü taraf hizmetlerinde (Cloudflare, e-posta sağlayıcılar) yaşanacak kesintilerden sorumlu değiliz.</li>
                  <li>Veri kaybı riski kullanıcıya aittir; düzenli yedekleme yapılması önerilir.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">7. Hesap Askıya Alma ve Sonlandırma</h2>
                <p>Aşağıdaki durumlarda hesabınız askıya alınabilir veya sonlandırılabilir:</p>
                <ul className="list-disc list-inside space-y-2 mt-3">
                  <li>Kullanım şartlarının ihlali</li>
                  <li>Platformun güvenliğine tehdit oluşturan davranışlar</li>
                  <li>Diğer kullanıcıların haklarını ihlal eden aktiviteler</li>
                  <li>Abonelik ücretinin ödenmemesi (deneme süresi sonunda)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">8. Değişiklikler</h2>
                <p>
                  Bu Kullanım Şartları zaman zaman güncellenebilir. Önemli değişiklikler
                  kullanıcıya bildirim yoluyla duyurulur. Değişiklikler yayınlandığı anda
                  yürürlüğe girer.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">9. Uygulanacak Hukuk</h2>
                <p>
                  Bu şartlar Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıkların çözümünde
                  İstanbul mahkemeleri yetkilidir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">10. İletişim</h2>
                <p>Kullanım şartlarıyla ilgili sorularınız için bizimle iletişime geçebilirsiniz:</p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-indigo-500" />
                    <span>destek@siteyonetimi.app</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-indigo-500" />
                    <span>+90 (212) 000 00 00</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
