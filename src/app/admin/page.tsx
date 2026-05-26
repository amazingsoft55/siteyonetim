"use client";

import * as React from "react";
import { Wallet, Users, AlertTriangle, ArrowUpRight, TrendingUp, DollarSign, Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { ClientRequestItem } from "@/lib/request-ui";
import { browserApiUrl } from "@/lib/browser-api-base";

type PaymentRow = { amount: number; status: string };
type ResidentRow = { durum: string };

export default function AdminDashboardPage() {
  const [mounted, setMounted] = React.useState(false);
  const [loadErr, setLoadErr] = React.useState("");
  const [stats, setStats] = React.useState({
    totalCollected: "0 ₺",
    totalResidents: "0 sakin",
    pendingRequests: 0,
    occupancyRate: "—",
  });
  const [recentRequests, setRecentRequests] = React.useState<ClientRequestItem[]>([]);
  const [collectionData, setCollectionData] = React.useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [totalUnitsPie, setTotalUnitsPie] = React.useState(0);

  const financialData = [
    { name: "Ocak", Gelir: 45000, Gider: 18200 },
    { name: "Şubat", Gelir: 47500, Gider: 22000 },
    { name: "Mart", Gelir: 46250, Gider: 19500 },
    { name: "Nisan", Gelir: 48000, Gider: 24000 },
    { name: "Mayıs", Gelir: 49250, Gider: 15400 },
  ];

  React.useEffect(() => {
    setMounted(true);
    let cancelled = false;
    (async () => {
      setLoadErr("");
      try {
        const [reqRes, payRes, resRes] = await Promise.all([
          fetch(browserApiUrl("/api/requests"), { credentials: "include" }),
          fetch(browserApiUrl("/api/payments"), { credentials: "include" }),
          fetch(browserApiUrl("/api/admin/residents"), { credentials: "include" }),
        ]);
        const parseFail = async (res: Response, label: string) => {
          if (res.ok) return null;
          const j = (await res.json().catch(() => null)) as { error?: string } | null;
          return j?.error ?? `${label}: ${res.status}`;
        };
        const e1 = await parseFail(reqRes, "Talepler");
        const e2 = await parseFail(payRes, "Ödemeler");
        const e3 = await parseFail(resRes, "Sakinler");
        const firstErr = e1 ?? e2 ?? e3;
        if (firstErr) throw new Error(firstErr);
        const requests = (await reqRes.json()) as ClientRequestItem[];
        const payments = (await payRes.json()) as PaymentRow[];
        const residents = (await resRes.json()) as ResidentRow[];

        if (cancelled) return;

        const pending = requests.filter((r) => r.status === "Bekliyor").length;
        const collected = payments
          .filter((p) => p.status === "Tamamlandı")
          .reduce((a, p) => a + (Number(p.amount) || 0), 0);

        const regular = residents.filter((r) => r.durum !== "Borçlu").length;
        const debt = residents.filter((r) => r.durum === "Borçlu").length;
        const n = residents.length;
        const rate =
          n > 0 ? `${Math.round((regular / n) * 100)}%` : "—";

        setStats({
          totalCollected: `${Math.round(collected).toLocaleString("tr-TR")} ₺`,
          totalResidents: `${n} sakin`,
          pendingRequests: pending,
          occupancyRate: rate,
        });
        setRecentRequests(requests.slice(0, 3));

        setTotalUnitsPie(n);
        if (n === 0) {
          setCollectionData([]);
        } else {
          setCollectionData([
            { name: "Düzenli", value: regular, color: "#10b981" },
            { name: "Borçlu", value: debt, color: "#f59e0b" },
          ]);
        }
      } catch (e) {
        if (!cancelled) setLoadErr(e instanceof Error ? e.message : "Özet yüklenemedi.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!mounted) {
    return (
      <div className="p-8 text-center text-zinc-500">
        Panel yükleniyor...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-6xl mx-auto pb-16">
      {loadErr && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/50 p-4 text-sm text-amber-900 dark:text-amber-100">
          {loadErr}
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">Yönetim Özet Durumu</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Göstergeler canlı SQLite verisinden (/api): talepler, tahsilatlar ve sakin listesi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              <Wallet className="h-6 w-6" />
            </div>
            <span className="flex items-center text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
              Canlı <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
          <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Tahsil edilen</p>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">{stats.totalCollected}</h3>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
              <Users className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-2.5 py-0.5 rounded-full">
              Kayıt
            </span>
          </div>
          <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Sakinler</p>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">{stats.totalResidents}</h3>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-900/30">
              <AlertTriangle className="h-6 w-6" />
            </div>
            {stats.pendingRequests > 0 && (
              <span className="animate-pulse flex h-2.5 w-2.5 rounded-full bg-rose-600" />
            )}
          </div>
          <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Bekleyen talepler</p>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">{stats.pendingRequests}</h3>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-900/30">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Düzenli oranı</p>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">{stats.occupancyRate}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50">Mali Göstergeler</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Örnek beş ay — detaylı muhasebe geçmişi veritabanında ayrı tabloda yok; görsel için statik örnek.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-950 text-zinc-500 border border-zinc-100 dark:border-zinc-800">
              <DollarSign className="h-3.5 w-3.5" /> TL
            </div>
          </div>

          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "none",
                    borderRadius: "16px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar dataKey="Gelir" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gider" fill="#64748b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50">Sakin borç özeti</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              API: <span className="font-mono text-[10px]">/api/admin/residents</span> canlı dağılım
            </p>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center text-xs my-4">
            {collectionData.length > 0 && collectionData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={collectionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {collectionData.map((entry, index) => (
                      <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-zinc-500">Kayıtlı sakin yok.</p>
            )}
            {totalUnitsPie > 0 && (
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-zinc-800 dark:text-zinc-100">{totalUnitsPie}</span>
                <span className="text-[10px] uppercase font-bold text-zinc-400">Sakin</span>
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            {collectionData.map((item, idx) => (
              <div key={`${item.name}-${idx}`} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-zinc-600 dark:text-zinc-400 font-semibold">{item.name}</span>
                </div>
                <span className="font-black text-zinc-800 dark:text-zinc-100">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Activity className="h-5 w-5 text-rose-600" /> Son iletilen talepler
          </h3>
          <a href="/admin/requests" className="text-xs font-bold text-rose-600 hover:underline">
            Tümünü Yönet
          </a>
        </div>

        {recentRequests.length === 0 ? (
          <div className="text-center py-6 text-sm text-zinc-500">
            Henüz talep kaydı yok veya liste boş.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="pb-3">Talep ID</th>
                  <th className="pb-3">Kategori</th>
                  <th className="pb-3">Detay / Başlık</th>
                  <th className="pb-3">Tarih</th>
                  <th className="pb-3">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {recentRequests.map((row) => (
                  <tr key={row.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4 font-mono text-xs font-bold text-zinc-400">{row.id}</td>
                    <td className="py-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/30 font-semibold">
                        {row.category}
                      </span>
                    </td>
                    <td className="py-4">
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">{row.title}</p>
                        <p className="text-xs text-zinc-500 line-clamp-1 max-w-xs">{row.description}</p>
                      </div>
                    </td>
                    <td className="py-4 text-zinc-500 dark:text-zinc-400">{row.date}</td>
                    <td className="py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          row.status === "Çözüldü"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                            : row.status === "İşlemde"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
