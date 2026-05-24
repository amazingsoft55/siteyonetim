"use client";

import * as React from "react";
import { CreditCard, Download, Printer, CheckCircle2, ChevronRight, X, Sparkles } from "lucide-react";

interface Payment {
  id: string;
  period: string;
  amount: number;
  date: string;
  status: string;
  type: string;
}

export default function ResidentPaymentsPage() {
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = React.useState<Payment | null>(null);

  React.useEffect(() => {
    // Load payments from localStorage or set defaults
    const stored = localStorage.getItem("resident_payments");
    if (stored) {
      setPayments(JSON.parse(stored));
    } else {
      const defaults = [
        { id: "PAY-8729", period: "Nisan 2026", amount: 1250, date: "10.04.2026", status: "Başarılı", type: "Kredi Kartı" },
        { id: "PAY-8610", period: "Mart 2026", amount: 1250, date: "11.03.2026", status: "Başarılı", type: "Kredi Kartı" },
        { id: "PAY-8501", period: "Şubat 2026", amount: 1250, date: "15.02.2026", status: "Başarılı", type: "Havale/EFT" },
      ];
      localStorage.setItem("resident_payments", JSON.stringify(defaults));
      setPayments(defaults);
    }
  }, []);

  const handlePrint = (payment: Payment) => {
    alert(`${payment.id} numaralı dekont yazıcıya gönderiliyor...`);
  };

  const handleDownload = (payment: Payment) => {
    alert(`${payment.id} numaralı dekont PDF olarak indiriliyor...`);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">Aidat & Ödemeler</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Ödeme geçmişinizi takip edin ve dekontlarınızı indirin.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Toplam Ödenen</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {(payments.reduce((acc, curr) => acc + curr.amount, 0)).toLocaleString("tr-TR")} ₺
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">İşlem Adedi</p>
          <p className="text-2xl font-black text-zinc-800 dark:text-zinc-200 mt-1">{payments.length} Adet</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Güncel Borç</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">0 ₺</p>
          </div>
          <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* Payments Table/List */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/80">
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Ödeme Geçmişi</h3>
        </div>

        {payments.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            Kayıtlı herhangi bir ödeme bulunamadı.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200/60 dark:border-zinc-800/80 text-zinc-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">İşlem ID</th>
                  <th className="px-6 py-4">Ödeme Dönemi</th>
                  <th className="px-6 py-4">Ödeme Türü</th>
                  <th className="px-6 py-4">Tarih</th>
                  <th className="px-6 py-4 text-right">Tutar</th>
                  <th className="px-6 py-4 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/35 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-zinc-400">{p.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{p.period}</span>
                        <span className="px-2 py-0.5 text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full font-medium">
                          {p.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{p.type}</td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{p.date}</td>
                    <td className="px-6 py-4 text-right font-bold text-zinc-900 dark:text-zinc-50">
                      {p.amount.toLocaleString("tr-TR")} ₺
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setSelectedPayment(p)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Dekont Gör <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 relative">
            <button 
              onClick={() => setSelectedPayment(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center border-b border-zinc-100 dark:border-zinc-800/80 pb-6 mb-6">
              <div className="h-12 w-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-xl text-zinc-900 dark:text-zinc-50">Ödeme Dekontu</h3>
              <p className="text-xs text-zinc-400 mt-1">{selectedPayment.id}</p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Üye Adı Soyadı</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">Ahmet Yılmaz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Blok / Daire</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">A Blok - Daire 14</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Ödeme Dönemi</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedPayment.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Ödeme Türü</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedPayment.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Ödeme Tarihi</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedPayment.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Durum</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedPayment.status}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-4 text-base">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">Toplam Tutar</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400">{selectedPayment.amount.toLocaleString("tr-TR")} ₺</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-8">
              <button 
                onClick={() => handlePrint(selectedPayment)}
                className="flex items-center justify-center gap-2 py-3 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl font-bold text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                <Printer className="h-4 w-4" /> Yazdır
              </button>
              <button 
                onClick={() => handleDownload(selectedPayment)}
                className="flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-md shadow-indigo-600/10 transition-colors"
              >
                <Download className="h-4 w-4" /> İndir (PDF)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
