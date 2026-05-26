"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CreditCard, ShieldCheck, ChevronLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function PaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [initErr, setInitErr] = React.useState("");
  const [amount, setAmount] = React.useState(0);
  const [periodLabel, setPeriodLabel] = React.useState("");
  const [paidSummary, setPaidSummary] = React.useState<number | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setInitErr("");
      const cred = { credentials: "include" as const };
      try {
        const [settRes, payRes] = await Promise.all([
          fetch("/api/settings", cred),
          fetch("/api/payments", cred),
        ]);
        let defaultAidat = 0;
        if (settRes.ok) {
          const s: unknown = await settRes.json().catch(() => null);
          if (s && typeof s === "object" && "aidat" in s && typeof (s as { aidat?: unknown }).aidat === "string") {
            const n = Number(String((s as { aidat: string }).aidat).replace(",", "."));
            if (Number.isFinite(n) && n > 0) defaultAidat = Math.round(n * 100) / 100;
          }
        }

        let unpaid = 0;
        let period = "";
        if (payRes.ok) {
          const plist: unknown = await payRes.json().catch(() => null);
          if (Array.isArray(plist)) {
            const rows = plist as {
              amount?: unknown;
              status?: unknown;
              period?: unknown;
            }[];
            unpaid = rows
              .filter((r) => r.status === "Bekliyor")
              .reduce((a, r) => {
                const n = Number(r.amount);
                return a + (Number.isFinite(n) ? n : 0);
              }, 0);
            unpaid = Math.round(unpaid * 100) / 100;
            const firstUnpaid = rows.find((r) => r.status === "Bekliyor");
            if (typeof firstUnpaid?.period === "string" && firstUnpaid.period.trim()) {
              period = firstUnpaid.period.trim();
            }
          }
        } else if (!cancelled) {
          setInitErr("Ön bilgiler sunucudan alınamadı. Tekrar deneyin veya yöneticinize başvurun.");
        }

        if (cancelled) return;

        const useAmount = unpaid > 0 ? unpaid : defaultAidat;
        const usePeriod = period || new Date().toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

        if (useAmount <= 0 && !period) {
          setInitErr("Ödeme kaydı veya varsayılan aidat tutarı görünmüyor. Lütfen yönetiminizle iletişime geçin.");
        }

        setAmount(Math.max(0, useAmount));
        setPeriodLabel(usePeriod);
      } catch {
        if (!cancelled) setInitErr("Bağlantı hatası.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || amount <= 0) return;

    setLoading(true);
    setInitErr("");

    const res = await fetch("/api/payments", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        period: periodLabel || undefined,
        type: "Ödeme (panel)",
      }),
    });
    const j: unknown = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      let msg = "Ödeme kaydı oluşturulamadı.";
      if (j && typeof j === "object" && "error" in j && typeof (j as { error?: unknown }).error === "string") {
        msg = (j as { error: string }).error;
      }
      alert(msg);
      return;
    }

    setPaidSummary(amount);
    setSuccess(true);
  };

  const amountDisplay = `${amount.toLocaleString("tr-TR", {
    minimumFractionDigits: amount % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  })} ₺`;

  if (success && paidSummary != null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-full mb-6">
          <CheckCircle2 className="h-16 w-16" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Ödeme kaydı alındı</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 max-w-md">
          {`${paidSummary.toLocaleString("tr-TR")} ₺ tutarındaki işlem sistemde görünür.`}
          {" Borç özeti güncellenmiş olabilir; güncel listeyi "}
          <Link href="/dashboard/payments" className="underline font-semibold text-indigo-600 dark:text-indigo-400">
            Aidat ve ödemeler
          </Link>
          {" ekranından kontrol edin."}
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          Panele dön
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
        <ChevronLeft className="h-4 w-4 mr-1" /> Geri dön
      </button>

      <h2 className="text-2xl font-bold tracking-tight mb-2">Ödeme onayı</h2>
      <p className="text-zinc-500 mb-8">
        Bu ekranda tutar sistemde borç olarak görünürse işlem doğrudan yerel veritabanınıza yazılır. Gerçek kart
        işlemi bankanız ile entegre değildir.
      </p>

      {initErr && (
        <div className="mb-6 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/25 p-4 text-sm text-amber-950 dark:text-amber-100">
          {initErr}
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <p className="text-sm font-medium text-zinc-500">Ödenecek tutar</p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{amountDisplay}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-zinc-500">Dönem / açıklama</p>
            <p className="text-lg font-semibold mt-1 max-w-[12rem] line-clamp-2">{periodLabel || "—"}</p>
          </div>
        </div>

        <form onSubmit={handlePayment} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1.5">Kart üzerindeki isim (isteğe bağlı)</label>
            <input
              type="text"
              maxLength={80}
              className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-3 px-4 focus:ring-2 focus:ring-indigo-600 outline-none"
              placeholder="AD SOYAD"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Kart numarası (gerçek ödeme yapılmaz)</label>
            <div className="relative">
              <input
                type="text"
                maxLength={19}
                className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-3 pl-4 pr-12 focus:ring-2 focus:ring-indigo-600 outline-none"
                placeholder="0000 0000 0000 0000"
              />
              <CreditCard className="absolute right-4 top-3.5 h-5 w-5 text-zinc-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Son kullanma (isteğe bağlı)</label>
              <input
                type="text"
                maxLength={5}
                className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-3 px-4 focus:ring-2 focus:ring-indigo-600 outline-none"
                placeholder="12/28"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">CVV (isteğe bağlı)</label>
              <input
                type="text"
                maxLength={3}
                className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-3 px-4 focus:ring-2 focus:ring-indigo-600 outline-none"
                placeholder="123"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-2 text-sm text-emerald-600 dark:text-emerald-500 font-medium">
            <ShieldCheck className="h-5 w-5" />
            Oturum çereziniz güvenli; kart bilgileri sunucuya kaydedilmez.
          </div>

          <button
            type="submit"
            disabled={loading || amount <= 0}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center disabled:opacity-55"
          >
            {loading ? "Kaydediliyor…" : `${amountDisplay} kaydet`}
          </button>
        </form>
      </div>
    </div>
  );
}
