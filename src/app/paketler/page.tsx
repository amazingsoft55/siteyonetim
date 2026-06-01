import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PricingSection } from "@/components/PricingSection";

export const metadata: Metadata = {
  title: "Fiyatlandırma Paketleri — Site Yönetimi",
  description: "Apartman ve site yönetimi için uygun fiyatlı paketler. 49 TL'den başlayan fiyatlarla.",
};

export default function PaketlerPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <PricingSection />
      </main>
      <Footer />
    </>
  );
}
