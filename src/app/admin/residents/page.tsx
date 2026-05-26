"use client";

import Link from "next/link";
import * as React from "react";
import { Search, ArrowRight, RefreshCw } from "lucide-react";

/** /api/admin/residents D1 yanıtı */
type Resident = {
  id: string;
  name: string;
  blok: string;
  daire: string;
  borc: number;
  durum: string;
};

export default function ResidentsPage() {
  const [residents, setResidents] = React.useState<Resident[]>([]);
  const [search, setSearch] = React.useState("");
  const [selectedBlok, setSelectedBlok] = React.useState("Hepsi");
  const [selectedStatus, setSelectedStatus] = React.useState("Hepsi");
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");

  async function reload() {
    setErr("");
    const res = await fetch("/api/admin/residents", { credentials: "include" });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      setErr(`Veri alınamadı (${res.status}). ${t.slice(0, 240)}`);
      setResidents([]);
      return;
    }
    const data = (await res.json()) as Resident[];
    setResidents(Array.isArray(data) ? data : []);
  }

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      await reload();
      if (alive) setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filteredResidents = residents.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.daire.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    const matchBlok = selectedBlok === "Hepsi" || r.blok === selectedBlok;
    const matchStatus = selectedStatus === "Hepsi" || r.durum === selectedStatus;
    return matchSearch && matchBlok && matchStatus;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto pb-16">
      <div className="rounded-3xl border border-indigo-200/70 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/40 dark:to-zinc-950 p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Sakin bakiyesi
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-xl leading-relaxed">
            Veriler doğrudan <strong>Cloudflare D1</strong> üzerindeki kullanıcı ve ödeme kayıtlarından hesaplanır.
            Yeni hesap oluşturmak için <strong>Kullanıcılar</strong> sayfasını kullanın; tahsilat / borç güncellemesi için ödeme kaydı eklenir.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Link
            href="/admin/kullanicilar"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-700/25"
          >
            Kullanıcılar & hesap oluştur
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await reload();
              setLoading(false);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-5 py-3 text-sm font-bold text-zinc-800 dark:text-zinc-100"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Yenile
          </button>
        </div>
      </div>

      {err && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-4 text-sm text-rose-950 dark:text-rose-100">
          {err}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">Liste</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">{residents.length} kayıtlı sakin kullanıcı</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-5 rounded-3xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="relative md:col-span-2">
          <input
            type="text"
            placeholder="İsim veya daire ara…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-950 dark:text-zinc-50"
          />
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
        </div>
        <div>
          <select
            value={selectedBlok}
            onChange={(e) => setSelectedBlok(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-950 dark:text-zinc-50 appearance-none"
          >
            <option value="Hepsi">Tüm bloklar</option>
            {[...new Set(residents.map((r) => r.blok).filter(Boolean))].map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-950 dark:text-zinc-50 appearance-none"
          >
            <option value="Hepsi">Tüm durumlar</option>
            <option value="Düzenli">Düzenli</option>
            <option value="Borçlu">Borçlu</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200/60 dark:border-zinc-800/80 text-zinc-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Sakin</th>
                <th className="px-6 py-4">Blok & kapı</th>
                <th className="px-6 py-4 text-right">Ödenmemiş (₺)</th>
                <th className="px-6 py-4">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-400">
                    Yükleniyor…
                  </td>
                </tr>
              ) : filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-zinc-500">
                    Gösterilecek sakin kullanıcı yok veya filtrelere takıldı.
                  </td>
                </tr>
              ) : (
                filteredResidents.map((res) => (
                  <tr key={res.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-xs uppercase">
                          {res.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <span>{res.name}</span>
                      </div>
                      <span className="block text-[10px] font-mono text-zinc-400 mt-1">{res.id.slice(0, 8)}…</span>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 font-semibold">
                      {res.blok} · {res.daire}
                    </td>
                    <td className="px-6 py-4 text-right font-black">
                      {res.borc > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400">{res.borc.toLocaleString("tr-TR")} ₺</span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">Borçsuz</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          res.durum === "Düzenli" ?
                            "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                        }`}
                      >
                        {res.durum}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
