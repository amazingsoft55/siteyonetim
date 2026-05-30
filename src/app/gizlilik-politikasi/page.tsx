import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Shield, ArrowLeft, Calendar, Mail, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Gizlilik Politikası — Site Yönetimi",
  description: "Site Yönetimi platformunun gizlilik politikası ve kişisel veri işleme ilkeleri.",
};

export default function GizlilikPolitikasi() {
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
                <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Gizlilik Politikası</h1>
                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Son güncelleme: {guncellemeTarihi}
                </div>
              </div>
            </div>

            <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                <p className="text-indigo-800 dark:text-indigo-200 font-medium">
                  Bu Gizlilik Politikası, Site Yönetimi platformunu kullanan tüm kullanıcılar için geçerlidir.
                  Platformumuzu kullanarak bu politikayı kabul etmiş sayılırsınız.
                </p>
              </div>

              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">1. Toplanan Veriler</h2>
                <p>Platformumuz aşağıdaki kişisel verileri toplar ve işler:</p>
                <ul className="list-disc list-inside space-y-2 mt-3">
                  <li><strong>Hesap bilgileri:</strong> Ad Soyad, e-posta adresi veya telefon numarası</li>
                  <li><strong>Site bilgileri:</strong> Apartman/site adı, adres, daire numarası</li>
                  <li><strong>Finansal veriler:</strong> Aidat borçları, ödeme durumları, IBAN bilgisi</li>
                  <li><strong>Talep verileri:</strong> Arıza talepleri, duyuru okuma geçmişi</li>
                  <li><strong>Teknik veriler:</strong> Oturum bilgileri, cihaz türü, IP adresi (sadece güvenlik amaçlı)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">2. Verilerin Kullanım Amacı</h2>
                <p>Toplanan veriler aşağıdaki amaçlarla kullanılır:</p>
                <ul className="list-disc list-inside space-y-2 mt-3">
                  <li>Platform hizmetlerinin sunulması ve geliştirilmesi</li>
                  <li>Aidat ve ödeme yönetimi</li>
                  <li>Duyuru ve bildirim gönderimi</li>
                  <li>Talep ve arıza yönetimi</li>
                  <li>Güvenlik ve yetkilendirme</li>
                  <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">3. Veri Güvenliği</h2>
                <p>
                  Verileriniz Cloudflare altyapısı ile dünya çapında şifreli olarak saklanır.
                  SSL/TLS şifreleme, erişim kontrolü ve düzenli güvenlik denetimleri uygulanmaktadır.
                  Kişisel verileriniz yalnızca yetkili personel tarafından erişilebilir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">4. Veri Paylaşımı</h2>
                <p>
                  Kişisel verileriniz üçüncü taraflarla paylaşılmaz, satılmaz veya kiralanmaz.
                  Aşağıdaki durumlar istisnaidir:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-3">
                  <li>Yasal zorunluluk karşısında yetkili mercilerle paylaşım</li>
                  <li>Platform altyapısını sağlayan teknik servis sağlayıcılar (Cloudflare)</li>
                  <li>Kullanıcının açık rızası bulunan durumlar</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">5. Çerezler (Cookies)</h2>
                <p>
                  Platformumuz oturum yönetimi için zorunlu çerezler kullanır. Üçüncü taraf çerezleri
                  veya reklam çerezleri kullanılmaz. Oturum çerezleri, yalnızca oturumunuz açık kaldığı
                  sürece aktiftir ve tarayıcı kapatıldığında sona erer.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">6. KVKK Haklarınız</h2>
                <p>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aşağıdaki haklara sahipsiniz:</p>
                <ul className="list-disc list-inside space-y-2 mt-3">
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>Kişisel verilerinizin işlenme amacını ve bunlara uygun kullanılıp kullanılmadığını öğrenme</li>
                  <li>Kişisel verilerinizin yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                  <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme</li>
                  <li>Kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">7. Veri Saklama Süresi</h2>
                <p>
                  Kişisel verileriniz, hizmetin sunulduğu süre boyunca ve yasal saklama
                  yükümlülükleri kapsamında muhafaza edilir. Hesap silindiğinde, verileriniz
                  30 gün içinde kalıcı olarak silinir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">8. Çocukların Gizliliği</h2>
                <p>
                  Platformumuz 18 yaşından küçük çocuklar için tasarlanmamıştır. 18 yaşından küçük
                  kullanıcılara ait bilerek veri toplanmaz.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">9. Politika Değişiklikleri</h2>
                <p>
                  Bu Gizlilik Politikası zaman zaman güncellenebilir. Değişiklikler platform
                  üzerinde yayınlandığı anda yürürlüğe girer. Önemli değişiklikler kullanıcıya
                  bildirim yoluyla duyurulur.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">10. İletişim</h2>
                <p>Gizlilik politikamızla ilgili sorularınız için bizimle iletişime geçebilirsiniz:</p>
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
