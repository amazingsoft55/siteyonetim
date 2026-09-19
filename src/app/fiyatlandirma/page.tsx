"use client";

import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Check,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  Building2,
  Sparkles,
} from "lucide-react";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = React.useState(false);

  const plans = [
    {
      name: "Başlangıç",
      desc: "1 - 20 dairelik küçük apartmanlar ve butik binalar için",
      monthlyPrice: 149,
      annualPrice: 119,
      popular: false,
      features: [
        "20 Daireye Kadar Sakin Yönetimi",
        "Aylık Aidat ve Borç Takibi",
        "E-Posta Makbuz Bildirimleri",
        "Dijital Duyuru Panosu",
        "Arıza & Talep Takip Sistemi",
        "1 Yönetici Hesabı",
        "E-posta ile Standart Destek",
      ],
      cta: "14 Gün Ücretsiz Başla",
      href: "/kayit",
    },
    {
      name: "Profesyonel",
      desc: "21 - 80 dairelik orta ve büyük ölçekli siteler için ideal",
      monthlyPrice: 349,
      annualPrice: 279,
      popular: true,
      features: [
        "80 Daireye Kadar Sakin Yönetimi",
        "Tüm Başlangıç Özellikleri",
        "Gelişmiş Kasa ve Gelir/Gider Raporu",
        "Yönetici Onaylı Sakin Kayıt Mekanizması",
        "Toplu E-Posta Gönderimi",
        "3 Yönetici & Denetçi Hesabı",
        "Öncelikli Telefon ve Canlı Destek",
        "Excel Veri İçe/Dışa Aktarma",
      ],
      cta: "En Çok Tercih Edilen",
      href: "/kayit",
    },
    {
      name: "Kurumsal & Tesis",
      desc: "80+ daire, çok bloklu siteler ve profesyonel yönetim firmaları",
      monthlyPrice: 699,
      annualPrice: 559,
      popular: false,
      features: [
        "Sınırsız Daire ve Blok Tanımlama",
        "Tüm Profesyonel Özellikleri",
        "Çoklu Site Yönetimi Tek Panelden",
        "Özel Alan Adı (Domain) Entegrasyonu",
        "Sınırsız Yönetici ve Görevli Yetkisi",
        "Banka ve Sanal POS Entegrasyonu",
        "7/24 Özel Müşteri Temsilcisi",
        "Özel Veri Yedekleme ve SLA Garantisi",
      ],
      cta: "Kurumsal Başvuru Yap",
      href: "/kayit",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {/* Header */}
      <section className="pt-16 pb-12 bg-white border-b border-slate-200/80 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-full">
            ŞEFFAF VE BASİT FİYATLANDIRMA
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-4 mb-4">
            Gizli maliyet yok, dairenize en uygun paketi seçin
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            14 gün boyunca tüm özellikleri ücretsiz deneyin. Kredi kartı bilgisi gerekmez.
          </p>

          {/* Aylık / Yıllık Geçiş */}
          <div className="inline-flex items-center gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`py-2 px-5 rounded-xl text-sm font-bold transition-all ${
                !isAnnual
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Aylık Ödeme
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`py-2 px-5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                isAnnual
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Yıllık Ödeme</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                %20 İndirim
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, i) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <div
                key={i}
                className={`relative flex flex-col rounded-3xl p-8 transition-all bg-white border ${
                  plan.popular
                    ? "border-indigo-600 shadow-xl ring-2 ring-indigo-600/20"
                    : "border-slate-200/90 shadow-md hover:shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-600 text-white text-xs font-black uppercase tracking-wider shadow-sm">
                    EN ÇOK TERCİH EDİLEN
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1.5 min-h-[36px]">{plan.desc}</p>
                </div>

                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-100">
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight">₺{price}</span>
                  <span className="text-xs font-semibold text-slate-500">/ ay</span>
                  {isAnnual && (
                    <span className="text-[11px] text-emerald-600 font-bold ml-2">Yıllık faturalandırılır</span>
                  )}
                </div>

                <div className="space-y-3.5 mb-8 flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Dahil Olan Özellikler:</span>
                  {plan.features.map((feat, fIndex) => (
                    <div key={fIndex} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={plan.href}
                  className={`w-full py-3.5 px-4 rounded-xl text-center text-sm font-bold transition-all shadow-xs ${
                    plan.popular
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-20 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6 text-center">
            Detaylı Paket Karşılaştırması
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-900">
                  <th className="py-3 px-4 font-bold">Özellik</th>
                  <th className="py-3 px-4 font-bold text-center">Başlangıç</th>
                  <th className="py-3 px-4 font-bold text-center">Profesyonel</th>
                  <th className="py-3 px-4 font-bold text-center">Kurumsal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 font-medium">Maksimum Daire Limiti</td>
                  <td className="py-3 px-4 text-center">20 Daire</td>
                  <td className="py-3 px-4 text-center font-bold text-indigo-600">80 Daire</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600">Sınırsız</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Aidat Tahakkuk ve Makbuz</td>
                  <td className="py-3 px-4 text-center">✓</td>
                  <td className="py-3 px-4 text-center">✓</td>
                  <td className="py-3 px-4 text-center">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Yönetici Onaylı Kayıt Mekanizması</td>
                  <td className="py-3 px-4 text-center">✓</td>
                  <td className="py-3 px-4 text-center">✓</td>
                  <td className="py-3 px-4 text-center">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Gelir / Gider Kasa Raporları</td>
                  <td className="py-3 px-4 text-center">Temel</td>
                  <td className="py-3 px-4 text-center">Gelişmiş</td>
                  <td className="py-3 px-4 text-center">Özelleştirilebilir</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Özel Alan Adı (Domain) Kurulumu</td>
                  <td className="py-3 px-4 text-center text-slate-300">—</td>
                  <td className="py-3 px-4 text-center text-slate-300">—</td>
                  <td className="py-3 px-4 text-center font-bold text-indigo-600">Dahil</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Teknik Destek Seviyesi</td>
                  <td className="py-3 px-4 text-center">E-posta</td>
                  <td className="py-3 px-4 text-center">Öncelikli Telefon</td>
                  <td className="py-3 px-4 text-center">7/24 Özel Temsilci</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
