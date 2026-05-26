import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getPublicSiteUrl } from "@/lib/site-url";

const canon = `${getPublicSiteUrl()}/hakkimizda`;

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "Site Yönetimi olarak apartman ve site yöneticilerini dijitalleştiriyoruz. Aidat, duyuru ve talep süreçlerinde şeffaflık ve güvenlik odaklı çözüm sunuyoruz.",
  alternates: { canonical: canon },
  openGraph: {
    title: "Hakkımızda | Site Yönetimi",
    description:
      "Apartman yönetim yazılımı vizyonumuz, değerlerimiz ve site sakinleri ile yöneticiler arasındaki güven ilişkisi.",
    url: canon,
  },
};

export default function Hakkimizda() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-24 w-full">
        <h1 className="text-4xl font-extrabold tracking-tight mb-8">Hakkımızda</h1>
        <div className="prose prose-zinc dark:prose-invert max-w-none text-lg text-zinc-600 dark:text-zinc-400 space-y-6">
          <p>
            Site Yönetimi uygulaması, modern yaşam alanlarının ihtiyaç duyduğu profesyonel, şeffaf ve hızlı iletişim altyapısını kurmak amacıyla geliştirilmiştir. Yöneticiler ile site sakinleri arasında köprü kurarak, aidat takibinden arıza bildirimlerine kadar tüm süreçleri dijitalleştiriyoruz.
          </p>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-12 mb-4">Vizyonumuz</h2>
          <p>
            Karmaşık hale gelen bina ve tesis yönetimini, teknolojinin gücüyle herkes için anlaşılır ve zahmetsiz hale getirmektir. Site sakinlerinin huzuru ve güvenliği odak noktamızdır.
          </p>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-12 mb-4">Değerlerimiz</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Şeffaflık:</strong> Tüm finansal kayıtların anlık olarak görülebilmesi.</li>
            <li><strong>Hız:</strong> Taleplerin ve arızaların en kısa sürede çözüme kavuşması.</li>
            <li><strong>Güvenlik:</strong> Kullanıcı verilerinin ve ödeme altyapısının uluslararası standartlarda korunması.</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
