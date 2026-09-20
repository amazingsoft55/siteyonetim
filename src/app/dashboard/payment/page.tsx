"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Copy,
  Check,
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  Info,
  QrCode,
  FileText,
  Phone,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { useAlert } from "@/components/ModalProvider";

export default function BankTransferInfoPage() {
  const showAlert = useAlert();
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [copiedIban, setCopiedIban] = React.useState(false);
  const [copiedDesc, setCopiedDesc] = React.useState(false);

  const [siteSettings, setSiteSettings] = React.useState<{
    iban?: string | null;
    bankName?: string | null;
    managerName?: string | null;
    phone?: string | null;
    aidat?: string | null;
  }>({});

  const [residentName, setResidentName] = React.useState("Sakin");
  const [apartmentNo, setApartmentNo] = React.useState("");
  const [unpaidBalance, setUnpaidBalance] = React.useState(0);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        if (u.name) setResidentName(u.name);
        if (u.apartmentNo) setApartmentNo(u.apartmentNo);
      }
    } catch {}

    (async () => {
      try {
        const [settingsRes, paymentsRes] = await Promise.all([
          fetch("/api/settings", { credentials: "include" }),
          fetch("/api/payments", { credentials: "include" }),
        ]);

        if (settingsRes.ok) {
          const s = (await settingsRes.json().catch(() => null)) as {
            iban?: string | null;
            bankName?: string | null;
            managerName?: string | null;
            phone?: string | null;
            aidat?: string | null;
          } | null;
          if (s) setSiteSettings(s);
        }

        if (paymentsRes.ok) {
          const plist = (await paymentsRes.json().catch(() => [])) as Array<{ status: string; amount: number }>;
          if (Array.isArray(plist)) {
            const unpaid = plist
              .filter((p) => p.status === "Bekliyor")
              .reduce((a: number, p) => a + Number(p.amount), 0);
            setUnpaidBalance(unpaid);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const hasIban = Boolean(siteSettings.iban && siteSettings.iban.trim().length > 0);
  const actualIban = siteSettings.iban?.trim() || "";
  const actualBank = siteSettings.bankName?.trim() || "Site Yönetim Banka Hesabı";
  const actualManager = siteSettings.managerName?.trim() || "Site Yönetimi";
  const paymentDescription = `${apartmentNo ? `Daire ${apartmentNo}` : "Daire"} - ${residentName} - Aidat`;

  const handleCopy = (text: string, type: "iban" | "desc") => {
    navigator.clipboard.writeText(text);
    if (type === "iban") {
      setCopiedIban(true);
      setTimeout(() => setCopiedIban(false), 2000);
    } else {
      setCopiedDesc(true);
      setTimeout(() => setCopiedDesc(false), 2000);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6 pb-20">
      {/* Geri Dön */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Paneline Dön
      </Link>

      {/* Başlık */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Resmi Banka Havale / EFT Bilgileri
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-2">
              Aidat & Ortak Gider Ödeme Rehberi
            </h1>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block font-medium">Toplam Bekleyen Borç</span>
            <span className="text-2xl font-black text-indigo-600">
              ₺{unpaidBalance.toLocaleString("tr-TR")}
            </span>
          </div>
        </div>

        {/* Bilgilendirme Notu */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/60 flex items-start gap-3">
          <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-950 leading-relaxed">
            <strong>Komisyonsuz Doğrudan Transfer:</strong> Aidat ödemelerinizi doğrudan site yönetiminin
            aşağıda yer alan resmi banka hesabına EFT / Havale veya FAST yoluyla %0 komisyonla iletebilirsiniz.
          </p>
        </div>

        {/* Banka ve IBAN Kartı Veya Tanımlanmamış Uyarısı */}
        {!hasIban ? (
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Info className="h-5 w-5 text-amber-700 shrink-0" />
              Banka IBAN Bilgisi Henüz Eklenmemiş
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Site yöneticiniz henüz resmi banka hesap (IBAN) bilgisini sisteme kaydetmemiştir.
              Ödemenizi yapmak için lütfen site yöneticiniz ile iletişime geçiniz.
            </p>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 shadow-lg shadow-slate-900/10">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5 font-bold">
                <Building2 className="h-4 w-4 text-indigo-400" /> {actualBank}
              </span>
              <span className="font-medium">{actualManager}</span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                HESAP IBAN NUMARASI
              </label>
              <div className="flex items-center justify-between bg-slate-800/90 rounded-xl p-3 border border-slate-700">
                <span className="font-mono text-sm sm:text-base font-bold tracking-wider text-slate-100 break-all">
                  {actualIban}
                </span>
                <button
                  onClick={() => handleCopy(actualIban, "iban")}
                  className="ml-3 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  {copiedIban ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Kopyalandı
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> IBAN Kopyala
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                ÖNERİLEN HAVALE AÇIKLAMASI
              </label>
              <div className="flex items-center justify-between bg-slate-800/90 rounded-xl p-3 border border-slate-700">
                <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
                  {paymentDescription}
                </span>
                <button
                  onClick={() => handleCopy(paymentDescription, "desc")}
                  className="ml-3 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  {copiedDesc ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Kopyalandı
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Kopyala
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3 Adımda Ödeme */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-800">Nasıl Ödeme Yaparım?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center mb-2">
                1
              </span>
              <h4 className="text-xs font-bold text-slate-800 mb-1">Banka Uygulamanızı Açın</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Kullandığınız bankanın mobil uygulamasından Para Transferi &gt; IBAN seçeneğine girin.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center mb-2">
                2
              </span>
              <h4 className="text-xs font-bold text-slate-800 mb-1">IBAN & Açıklamayı Yazın</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Yukarıdaki IBAN&apos;ı yapıştırın ve açıklama kısmına daire numaranızı ekleyin.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center mb-2">
                3
              </span>
              <h4 className="text-xs font-bold text-slate-800 mb-1">Otomatik Kasa Kaydı</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Ödemeniz site yönetimi tarafından onaylandıktan sonra borç bakiyenizden otomatik düşer.
              </p>
            </div>
          </div>
        </div>

        {/* Yönetici İletişim */}
        {siteSettings.phone && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-indigo-600" />
              <div>
                <span className="text-xs font-bold text-slate-800">Yönetici İletişim / WhatsApp:</span>
                <span className="text-xs text-slate-600 ml-1.5">{siteSettings.phone}</span>
              </div>
            </div>
            <a
              href={`tel:${siteSettings.phone}`}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Ara
            </a>
          </div>
        )}

        {/* Aksiyon Butonları */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Link
            href="/dashboard/payments"
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            Ödeme Geçmişini İncele &gt;
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            Tamam, Paneline Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
