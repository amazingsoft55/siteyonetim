"use client";

import * as React from "react";
import Link from "next/link";
import {
  Wallet,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Activity,
  CheckCircle2,
  Clock,
  RefreshCw,
  Plus,
  Minus,
  Megaphone,
  Wrench,
  ChevronRight,
  Building2,
  Receipt,
  UserCheck,
} from "lucide-react";
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
type ResidentRow = { id: string; name: string; durum: string; status?: string; daire: string };

function StatCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200/80 p-6 rounded-3xl animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-12 w-12 rounded-xl bg-slate-200" />
        <div className="h-6 w-14 rounded-full bg-slate-200" />
      </div>
      <div className="h-3 w-20 bg-slate-200 rounded mb-2" />
      <div className="h-7 w-28 bg-slate-200 rounded" />
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  Çözüldü: "bg-emerald-50 text-emerald-700",
  İşlemde: "bg-blue-50 text-blue-700",
  Bekliyor: "bg-amber-50 text-amber-700",
};

export default function AdminDashboardPage() {
  const [mounted, setMounted] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [loadErr, setLoadErr] = React.useState("");
  const [stats, setStats] = React.useState({
    totalCollected: "0 ₺",
    totalResidents: "0 sakin",
    pendingRequests: 0,
    pendingResidents: 0,
    occupancyRate: "—",
    netBalance: "0 ₺",
  });
  const [recentRequests, setRecentRequests] = React.useState<ClientRequestItem[]>([]);
  const [pendingResidentsList, setPendingResidentsList] = React.useState<ResidentRow[]>([]);
  const [collectionData, setCollectionData] = React.useState<{ name: string; value: number; color: string }[]>([]);

  const financialData = [
    { name: "Oca", Gelir: 45000, Gider: 18200 },
    { name: "Şub", Gelir: 47500, Gider: 22000 },
    { name: "Mar", Gelir: 46250, Gider: 19500 },
    { name: "Nis", Gelir: 48000, Gider: 24000 },
    { name: "May", Gelir: 49250, Gider: 15400 },
    { name: "Haz", Gelir: 52000, Gider: 21800 },
  ];

  const loadData = React.useCallback(async (cancelled: { v: boolean }) => {
    setLoadErr("");
    setLoading(true);
    try {
      const [reqRes, payRes, resRes, finRes] = await Promise.all([
        fetch(browserApiUrl("/api/requests"), { credentials: "include" }),
        fetch(browserApiUrl("/api/payments"), { credentials: "include" }),
        fetch(browserApiUrl("/api/admin/residents"), { credentials: "include" }),
        fetch(browserApiUrl("/api/admin/finans"), { credentials: "include" }),
      ]);

      const requests = reqRes.ok ? ((await reqRes.json()) as ClientRequestItem[]) : [];
      const payments = payRes.ok ? ((await payRes.json()) as PaymentRow[]) : [];
      const residents = resRes.ok ? ((await resRes.json()) as ResidentRow[]) : [];
      const finansData = finRes.ok ? ((await finRes.json()) as { summary?: { netBalance?: number } }) : null;

      if (cancelled.v) return;

      const pendingReq = requests.filter((r) => r.status === "Bekliyor").length;
      const pendingRes = residents.filter((r) => r.status === "PENDING");

      const collected = payments
        .filter((p) => p.status === "Tamamlandı")
        .reduce((a, p) => a + (Number(p.amount) || 0), 0);

      const regular = residents.filter((r) => r.durum !== "Borçlu" && r.status !== "PENDING").length;
      const debt = residents.filter((r) => r.durum === "Borçlu" && r.status !== "PENDING").length;
      const n = residents.filter((r) => r.status !== "PENDING").length;

      const netBalance = finansData?.summary?.netBalance ?? collected;

      setStats({
        totalCollected: `${Math.round(collected).toLocaleString("tr-TR")} ₺`,
        totalResidents: `${n} Sakin`,
        pendingRequests: pendingReq,
        pendingResidents: pendingRes.length,
        occupancyRate: n > 0 ? `${Math.round((regular / n) * 100)}%` : "—",
        netBalance: `${Math.round(netBalance).toLocaleString("tr-TR")} ₺`,
      });

      setRecentRequests(requests.slice(0, 5));
      setPendingResidentsList(pendingRes.slice(0, 3));
      setCollectionData(
        n === 0
          ? []
          : [
              { name: "Düzenli", value: regular, color: "#10b981" },
              { name: "Borçlu", value: debt, color: "#f43f5e" },
            ]
      );
    } catch (e) {
      if (!cancelled.v) setLoadErr(e instanceof Error ? e.message : "Veriler alınamadı.");
    } finally {
      if (!cancelled.v) setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    setMounted(true);
    const cancelled = { v: false };
    loadData(cancelled);
    return () => {
      cancelled.v = true;
    };
  }, [loadData]);

  if (!mounted) return null;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Site Yönetim Paneli
          </h1>
          <p className="text-slate-600 mt-1 text-sm">
            Canlı bina istatistikleri, kasa durumu ve bekleyen sakin onayları
          </p>
        </div>
        <button
          onClick={() => {
            const c = { v: false };
            loadData(c);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Yenile
        </button>
      </div>

      {/* Onay Bekleyen Sakin Uyarısı */}
      {stats.pendingResidents > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
              {stats.pendingResidents}
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950">Onay Bekleyen Sakin Kayıtları Var</h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Web üzerinden sitenize yeni başvuru yapan {stats.pendingResidents} adet sakin onayınızı bekliyor.
              </p>
            </div>
          </div>
          <Link
            href="/admin/residents"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all shrink-0"
          >
            Sakinleri Onayla &rarr;
          </Link>
        </div>
      )}

      {/* Quick Action Hub */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-3">
          Hızlı Yönetim İşlemleri
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/admin/residents"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-200 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Plus className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 block truncate">Aidat Tanımla</span>
              <span className="text-[11px] text-slate-600 truncate block">Toplu tahakkuk</span>
            </div>
          </Link>

          <Link
            href="/admin/finans"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-200 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Wallet className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 block truncate">Kasa &amp; Gider</span>
              <span className="text-[11px] text-slate-600 truncate block">Gelir/Gider ekle</span>
            </div>
          </Link>

          <Link
            href="/admin/announcements"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-200 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Megaphone className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 block truncate">Duyuru Paylaş</span>
              <span className="text-[11px] text-slate-600 truncate block">Tüm sakinlere</span>
            </div>
          </Link>

          <Link
            href="/admin/requests"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-200 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Wrench className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 block truncate">Talepleri Yönet</span>
              <span className="text-[11px] text-slate-600 truncate block">Arıza kayıtları</span>
            </div>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Net Kasa &amp; Banka</span>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Wallet className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.netBalance}</p>
              <span className="text-[11px] text-slate-600 font-medium mt-1 block">
                Toplam bakiye durumu
              </span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Toplam Sakin</span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalResidents}</p>
              <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
                %{stats.occupancyRate} Tahsilat Oranı
              </span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Bekleyen Talepler</span>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Wrench className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.pendingRequests} Talep</p>
              <span className="text-[11px] text-slate-600 font-medium mt-1 block">
                İşlem bekleyen arıza bildirimi
              </span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Onay Bekleyenler</span>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <UserCheck className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-700">{stats.pendingResidents} Kişi</p>
              <span className="text-[11px] text-slate-600 font-medium mt-1 block">
                Yönetici onayı bekleyen sakin
              </span>
            </div>
          </>
        )}
      </div>

      {/* Financial Chart & Aidat Status Doughnut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Aylık Nakit Akışı */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Aylık Finansal Akış</h2>
              <p className="text-xs text-slate-600 mt-0.5">Gelir ve gider kalemlerinin son 6 aylık karşılaştırması</p>
            </div>
            <Link href="/admin/finans" className="text-xs font-bold text-indigo-600 hover:underline">
              Kasa Detayı &rarr;
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `₺${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                  formatter={(value: unknown) => [
                    `${Number(value).toLocaleString("tr-TR")} ₺`,
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar dataKey="Gelir" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar dataKey="Gider" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aidat Düzenlilik Oranı */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Aidat Ödeme Dağılımı</h2>
            <p className="text-xs text-slate-600 mt-0.5">Mevcut sakinlerin borç durumu</p>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[180px]">
            {collectionData.length === 0 ? (
              <p className="text-xs text-slate-600">Kayıtlı sakin verisi yok</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={collectionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {collectionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-around text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-700">Düzenli Ödeyen</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="font-semibold text-slate-700">Gecikmiş Borçlu</span>
            </div>
          </div>
        </div>

      </div>

      {/* Son Talepler ve Aktiviteler */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Son Arıza &amp; Talepler</h2>
            <p className="text-xs text-slate-600 mt-0.5">Sakinlerden gelen son bildirimler</p>
          </div>
          <Link href="/admin/requests" className="text-xs font-bold text-indigo-600 hover:underline">
            Tümünü Gör ({recentRequests.length}) &rarr;
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <p className="text-xs text-slate-600 py-6 text-center">Henüz açılmış bir talep bulunmuyor.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentRequests.map((req) => (
              <div key={req.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">{req.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_STYLES[req.status] || "bg-slate-100 text-slate-700"}`}>
                      {req.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-600 block mt-0.5">
                    {req.category || "Genel Talep"} &bull; {req.date}
                  </span>
                </div>
                <Link
                  href="/admin/requests"
                  className="px-3 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg shrink-0"
                >
                  İncele
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
