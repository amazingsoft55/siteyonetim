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
  Cell
} from "recharts";

interface RequestItem {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  status: "Bekliyor" | "İşlemde" | "Çözüldü";
}

export default function AdminDashboardPage() {
  const [mounted, setMounted] = React.useState(false);
  const [stats, setStats] = React.useState({
    totalCollected: "47.500 ₺",
    totalResidents: "48 / 50 Dolu",
    pendingRequests: 0,
    occupancyRate: "96%"
  });
  const [recentRequests, setRecentRequests] = React.useState<RequestItem[]>([]);

  React.useEffect(() => {
    setMounted(true);

    // Sync stats from localStorage
    const storedRequests = localStorage.getItem("site_requests");
    if (storedRequests) {
      const list: RequestItem[] = JSON.parse(storedRequests);
      setStats(prev => ({
        ...prev,
        pendingRequests: list.filter(r => r.status === "Bekliyor").length
      }));
      setRecentRequests(list.slice(0, 3));
    } else {
      setStats(prev => ({ ...prev, pendingRequests: 1 }));
    }

    // Sync payments and balance to calculate total collected
    const storedPayments = localStorage.getItem("resident_payments");
    if (storedPayments) {
      const list = JSON.parse(storedPayments);
      // Let's assume some default collection sum + dynamic additions
      const sum = list.reduce((acc: number, curr: any) => acc + curr.amount, 45250);
      setStats(prev => ({
        ...prev,
        totalCollected: `${sum.toLocaleString("tr-TR")} ₺`
      }));
    }
  }, []);

  // Chart Data
  const financialData = [
    { name: "Ocak", Gelir: 45000, Gider: 18200 },
    { name: "Şubat", Gelir: 47500, Gider: 22000 },
    { name: "Mart", Gelir: 46250, Gider: 19500 },
    { name: "Nisan", Gelir: 48000, Gider: 24000 },
    { name: "Mayıs", Gelir: 49250, Gider: 15400 },
  ];

  const collectionData = [
    { name: "Ödeyenler", value: 38, color: "#10b981" },
    { name: "Gecikenler", value: 9, color: "#f59e0b" },
    { name: "Ödemeyenler", value: 3, color: "#ef4444" },
  ];

  if (!mounted) {
    return (
      <div className="p-8 text-center text-zinc-500">
        Panel yükleniyor...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-6xl mx-auto pb-16">
      
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">Yönetim Özet Durumu</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Sitenin genel doluluk, aidat tahsilat ve finansal grafikleri.</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              <Wallet className="h-6 w-6" />
            </div>
            <span className="flex items-center text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
              +14% <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
          <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Aylık Tahsilat</p>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">{stats.totalCollected}</h3>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
              <Users className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-2.5 py-0.5 rounded-full">
              Doluluk
            </span>
          </div>
          <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Sakin & Daireler</p>
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
          <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Bekleyen Talepler</p>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">{stats.pendingRequests} Aktif</h3>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-900/30">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Tahsilat Oranı</p>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">{stats.occupancyRate}</h3>
        </div>
      </div>

      {/* Recharts Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Income / Expense Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50">Mali Göstergeler</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Son 5 ayın gelir ve ortak gider grafiği</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-950 text-zinc-500 border border-zinc-100 dark:border-zinc-800">
              <DollarSign className="h-3.5 w-3.5" /> TL Para Birimi
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
                    color: "#fff"
                  }} 
                />
                <Legend />
                <Bar dataKey="Gelir" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gider" fill="#64748b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Collection Status Pie Chart */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50">Aidat Dağılımı</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Mayıs ayı tahsilat durumu</p>
          </div>
          
          <div className="h-48 w-full relative flex items-center justify-center text-xs my-4">
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
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-zinc-800 dark:text-zinc-100">50</span>
              <span className="text-[10px] uppercase font-bold text-zinc-400">Daire</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {collectionData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-zinc-600 dark:text-zinc-400 font-semibold">{item.name}</span>
                </div>
                <span className="font-black text-zinc-800 dark:text-zinc-100">{item.value} Daire</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Requests and Action Log */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Activity className="h-5 w-5 text-rose-600" /> Son İletilen Talepler
          </h3>
          <a href="/admin/requests" className="text-xs font-bold text-rose-600 hover:underline">
            Tümünü Yönet
          </a>
        </div>
        
        {recentRequests.length === 0 ? (
          <div className="text-center py-6 text-sm text-zinc-500">
            Aktif veya çözülmemiş bir sakin talebi bulunmuyor.
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
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        row.status === 'Çözüldü' 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                          : row.status === 'İşlemde' 
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                      }`}>
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
