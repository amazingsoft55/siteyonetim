"use client";

import * as React from "react";
import {
  Wallet, Users, AlertTriangle, ArrowUpRight, TrendingUp,
  DollarSign, Activity, CheckCircle2, Clock, RefreshCw,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import type { ClientRequestItem } from "@/lib/request-ui";
import { browserApiUrl } from "@/lib/browser-api-base";

type PaymentRow = { amount: number; status: string };
type ResidentRow = { durum: string };

function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-6 rounded-3xl animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-12 w-12 rounded-xl bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-6 w-14 rounded-full bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-700 rounded mb-2" />
      <div className="h-7 w-28 bg-zinc-200 dark:bg-zinc-700 rounded" />
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  Çözüldü: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400",
  İşlemde: "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400",
  Bekliyor: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400",
};

export default function AdminDashboardPage() {
  const [mounted, setMounted] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [loadErr, setLoadErr] = React.useState("");
  const [stats, setStats] = React.useState({
    totalCollected: "0 ₺",
    totalResidents: "0 sakin",
    pendingRequests: 0,
    occupancyRate: "—",
  });
  const [recentRequests, setRecentRequests] = React.useState<ClientRequestItem[]>([]);
  const [collectionData, setCollectionData] = React.useState<{ name: string; value: number; color: string }[]>([]);
  const [totalUnitsPie, setTotalUnitsPie] = React.useState(0);

  const financialData = [
    { name: "Oca", Gelir: 45000, Gider: 18200 },
    { name: "Şub", Gelir: 47500, Gider: 22000 },
    { name: "Mar", Gelir: 46250, Gider: 19500 },
    { name: "Nis", Gelir: 48000, Gider: 24000 },
    { name: "May", Gelir: 49250, Gider: 15400 },
  ];

  const loadData = React.useCallback(async (cancelled: { v: boolean }) => {
    setLoadErr("");
    setLoading(true);
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

      if (cancelled.v) return;

      const pending = requests.filter((r) => r.status === "Bekliyor").length;
      const collected = payments
        .filter((p) => p.status === "Tamamlandı")
        .reduce((a, p) => a + (Number(p.amount) || 0), 0);

      const regular = residents.filter((r) => r.durum !== "Borçlu").length;
      const debt = residents.filter((r) => r.durum === "Borçlu").length;
      const n = residents.length;

      setStats({
        totalCollected: `${Math.round(collected).toLocaleString("tr-TR")} ₺`,
        totalResidents: `${n} sakin`,
        pendingRequests: pending,
        occupancyRate: n > 0 ? `${Math.round((regular / n) * 100)}%` : "—",
      });
      setRecentRequests(requests.slice(0, 5));
      setTotalUnitsPie(n);
      setCollectionData(
        n === 0
          ? []
          : [
              { name: "Düzenli", value: regular, color: "#10b981" },
              { name: "Borçlu", value: debt, color: "#f59e0b" },
            ]
      );
    } catch (e) {
      if (!cancelled.v) setLoadErr(e instanceof Error ? e.message : "Özet yüklenemedi.");
    } finally {
      if (!cancelled.v) setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    setMounted(true);
    const cancelled = { v: false };
    loadData(cancelled);
    return () => { cancelled.v = true; };
  }, [loadData]);

  if (!mounted) return null;

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-6xl mx-auto pb-16">

      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Yönetim Paneli
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
            Canlı istatistikler ve son aktiviteler
          </p>
        </div>
        <button
          onClick={() => { const c = { v: false }; loadData(c); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Yenile
        </button>
      </div>

      {/* Hata */}
      {loadErr && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/50 p-4 text-sm text-amber-900 dark:text-amber-100 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {loadErr}
        </div>
      )}

      {/* İstatistik kartları */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              label: "Tahsil Edilen",
              value: stats.totalCollected,
              icon: Wallet,
              badge: "Canlı",
              badgeColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20",
              iconBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
            },
            {
              label: "Sakinler",
              value: stats.totalResidents,
              icon: Users,
              badge: "Kayıt",
              badgeColor: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20",
              iconBg: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30",
            },
            {
              label: "Bekleyen Talepler",
              value: stats.pendingRequests,
              icon: AlertTriangle,
              badge: stats.pendingRequests > 0 ? "Eylem gerekli" : "Temiz",
              badgeColor: stats.pendingRequests > 0
                ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20"
                : "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20",
              iconBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
            },
            {
              label: "Düzenli Ödeme Oranı",
              value: stats.occupancyRate,
              icon: TrendingUp,
              badge: null,
              badgeColor: "",
              iconBg: "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900/30",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-5">
                <div className={`p-3 rounded-xl border ${card.iconBg}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                {card.badge && (
                  <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${card.badgeColor}`}>
                    {card.label === "Bekleyen Talepler" && Number(card.value) > 0
                      ? <span className="animate-pulse h-1.5 w-1.5 rounded-full bg-rose-500" />
                      : <ArrowUpRight className="h-3 w-3" />}
                    {card.badge}
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{card.label}</p>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1 tabular-nums">{card.value}</h3>
            </div>
          ))}
        </div>
      )}

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Çubuk grafik */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50">Mali Göstergeler</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Son 5 aylık gelir / gider özeti (örnek veri)</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-500 border border-zinc-100 dark:border-zinc-800">
              <DollarSign className="h-3.5 w-3.5" /> TL
            </div>
          </div>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.92)",
                    border: "none",
                    borderRadius: "16px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend />
                {/* Gelir YEŞİL, Gider KIRMIZI — muhasebe standardı */}
                <Bar dataKey="Gelir" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Gider" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pasta grafik */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50">Sakin Durumu</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Canlı borç / düzenli dağılımı</p>
          </div>

          <div className="flex-1 flex items-center justify-center relative min-h-[180px]">
            {collectionData.length > 0 && collectionData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={collectionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {collectionData.map((entry, index) => (
                      <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15,23,42,0.92)",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-zinc-500">Kayıtlı sakin yok.</p>
            )}
            {totalUnitsPie > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-zinc-800 dark:text-zinc-100 tabular-nums">{totalUnitsPie}</span>
                <span className="text-[10px] uppercase font-bold text-zinc-400">Sakin</span>
              </div>
            )}
          </div>

          <div className="space-y-2.5 mt-4">
            {collectionData.map((item, idx) => (
              <div key={`${item.name}-${idx}`} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-zinc-600 dark:text-zinc-400 font-semibold">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-zinc-800 dark:text-zinc-100 tabular-nums">{item.value}</span>
                  {totalUnitsPie > 0 && (
                    <span className="text-xs text-zinc-400">
                      ({Math.round((item.value / totalUnitsPie) * 100)}%)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Son talepler tablosu */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Son İletilen Talepler
          </h3>
          <a href="/admin/requests" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            Tümünü Yönet <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : recentRequests.length === 0 ? (
          <div className="text-center py-10 text-sm text-zinc-500 flex flex-col items-center gap-2">
            <CheckCircle2 className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
            Henüz talep kaydı yok.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[600px]">
              <thead className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="pb-3 px-2">Talep</th>
                  <th className="pb-3 px-2">Kategori</th>
                  <th className="pb-3 px-2">Tarih</th>
                  <th className="pb-3 px-2">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {recentRequests.map((row) => (
                  <tr key={row.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4 px-2">
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{row.title}</p>
                        <p className="text-xs text-zinc-500 line-clamp-1 max-w-xs mt-0.5">{row.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30 font-semibold">
                        {row.category}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-zinc-500 dark:text-zinc-400 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {row.date}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[row.status] ?? STATUS_STYLES["Bekliyor"]}`}>
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
