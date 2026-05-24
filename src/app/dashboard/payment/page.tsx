"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CreditCard, ShieldCheck, ChevronLeft, CheckCircle2 } from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      // Set balance to 0
      localStorage.setItem("resident_balance", "0");

      // Append new payment to history
      const storedPayments = localStorage.getItem("resident_payments");
      const paymentsList = storedPayments ? JSON.parse(storedPayments) : [];
      const newPayment = {
        id: `PAY-${Math.floor(10000 + Math.random() * 90000)}`,
        period: "Mayıs 2026",
        amount: 1250,
        date: new Date().toLocaleDateString("tr-TR"),
        status: "Başarılı",
        type: "Kredi Kartı"
      };
      localStorage.setItem("resident_payments", JSON.stringify([newPayment, ...paymentsList]));

      setLoading(false);
      setSuccess(true);
    }, 2000);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-full mb-6">
          <CheckCircle2 className="h-16 w-16" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Ödeme Başarılı!</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-md">
          1.250,00 ₺ tutarındaki aidat ödemeniz başarıyla gerçekleştirilmiştir. Dekontunuz kayıtlı e-posta adresinize gönderildi.
        </p>
        <button 
          onClick={() => router.push("/dashboard")}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          Panele Dön
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <button 
        onClick={() => router.back()}
        className="flex items-center text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Geri Dön
      </button>

      <h2 className="text-2xl font-bold tracking-tight mb-2">Güvenli Ödeme</h2>
      <p className="text-zinc-500 mb-8">Kredi kartı veya banka kartınız ile aidatınızı güvenle ödeyin.</p>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <p className="text-sm font-medium text-zinc-500">Ödenecek Tutar</p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">1.250,00 ₺</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-zinc-500">Ödeme Dönemi</p>
            <p className="text-lg font-semibold mt-1">Mayıs 2026</p>
          </div>
        </div>

        <form onSubmit={handlePayment} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1.5">Kart Üzerindeki İsim</label>
            <input type="text" required className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-3 px-4 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="AD SOYAD" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Kart Numarası</label>
            <div className="relative">
              <input type="text" required maxLength={19} className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-3 pl-4 pr-12 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="0000 0000 0000 0000" />
              <CreditCard className="absolute right-4 top-3.5 h-5 w-5 text-zinc-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Son Kullanma (AA/YY)</label>
              <input type="text" required maxLength={5} className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-3 px-4 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="12/28" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">CVV / CVC</label>
              <input type="text" required maxLength={3} className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-3 px-4 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="123" />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-2 text-sm text-emerald-600 dark:text-emerald-500 font-medium">
            <ShieldCheck className="h-5 w-5" />
            256-bit SSL ile güvenli ödeme
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center disabled:opacity-70"
          >
            {loading ? "Ödeme İşleniyor..." : "1.250,00 ₺ Öde"}
          </button>
        </form>
      </div>
    </div>
  );
}
