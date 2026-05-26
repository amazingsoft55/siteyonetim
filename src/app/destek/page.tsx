import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LifeBuoy, Mail } from "lucide-react";
import { getPublicSiteUrl } from "@/lib/site-url";
import { PublicContactForm } from "@/components/PublicContactForm";

const u = `${getPublicSiteUrl()}/destek`;

export const metadata: Metadata = {
  title: "Destek ve iletişim",
  description:
    "Ürün, teknik veya ticari sorularınız için Site Yönetimi destek ekibine yazın; talepler doğrudan yönetici panelinde işlenir.",
  alternates: { canonical: u },
};

export default function DestekPublicPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-6 py-20 w-full">
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500 mb-6">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
            Ana sayfa
          </Link>
          <span>/</span>
          <span className="text-zinc-800 dark:text-zinc-200 font-medium">Destek</span>
        </div>
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-indigo-100/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-sm font-bold mb-4">
                <LifeBuoy className="h-4 w-4" />
                Merkezi destek
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-4">Size nasıl yardımcı olabiliriz?</h1>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                Formdan gönderdiğiniz her mesaj doğrudan platform ekibinin süper yönetici konsolunda listelenir. Satış öncesi
                sorular, teknik aksaklıklar veya özellik talepleri için bu sayfayı kullanabilirsiniz.
              </p>
            </div>
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
              <h2 className="font-bold flex items-center gap-2">
                <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Doğrudan e-posta
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Kayıtlı kurumsal e-postanızdan da yazabilirsiniz:{" "}
                <a
                  href="mailto:destek@siteyonetimi.com"
                  className="font-semibold text-indigo-600 dark:text-indigo-400 underline underline-offset-2"
                >
                  destek@siteyonetimi.com
                </a>
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Apartman/site yönetimi ve sakini işlemleri (aidat talep vb.) için lütfen kendi sitenizin atanmış hesabına{" "}
                <Link href="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 underline">
                  giriş yapın
                </Link>
                ; bunlar teknik olarak ayrı panellerdedir.
              </p>
            </div>
          </div>
          <div className="lg:col-span-3">
            <PublicContactForm defaultSource="destek" headline="Destek talebi oluşturun" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
