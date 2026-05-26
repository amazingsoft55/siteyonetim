"use client";

import * as React from "react";
import { Wrench, Clock, AlertCircle, CheckCircle2, ChevronRight, Filter, Search } from "lucide-react";

interface RequestItem {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  status: "Bekliyor" | "İşlemde" | "Çözüldü";
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = React.useState<RequestItem[]>([]);
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("Hepsi");
  const [loadErr, setLoadErr] = React.useState("");

  async function loadRequests() {
    setLoadErr("");
    const res = await fetch("/api/requests", { credentials: "include" });
    const raw: unknown = await res.json().catch(() => null);
    if (!res.ok || !Array.isArray(raw)) {
      setLoadErr("Talepler veritabanından okunamıyor. Oturumu ve site bağlamını kontrol edin.");
      setRequests([]);
      return;
    }
    setRequests(raw as RequestItem[]);
  }

  React.useEffect(() => {
    void loadRequests();
  }, []);

  const updateStatus = async (id: string, newStatus: "Bekliyor" | "İşlemde" | "Çözüldü") => {
    const res = await fetch("/api/requests", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if (!res.ok) {
      alert("Durum güncellenemedi.");
      return;
    }
    await loadRequests();
    alert(`Talep ${id.slice(0, 8)}… durumu "${newStatus}" olarak kaydedildi.`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Bekliyor":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "İşlemde":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "Çözüldü":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      default:
        return null;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Bekliyor":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30";
      case "İşlemde":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30";
      case "Çözüldü":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30";
      default:
        return "";
    }
  };

  const filtered = requests.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Hepsi" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">Arıza & Talepler</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Sakinlerden gelen bildirimleri takip edin, iş atamalarını yapın ve çözün.</p>
        {loadErr && <p className="text-sm text-rose-600 dark:text-rose-400 mt-2 font-semibold">{loadErr}</p>}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 p-5 rounded-3xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        
        {/* Search */}
        <div className="relative md:col-span-2">
          <input 
            type="text" 
            placeholder="Talep adı veya ID ara..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-rose-500 outline-none text-zinc-950 dark:text-zinc-50"
          />
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-400" />
        </div>

        {/* Status select */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 py-3 px-4 text-sm focus:ring-2 focus:ring-rose-500 outline-none text-zinc-950 dark:text-zinc-50 appearance-none"
          >
            <option value="Hepsi">🏷️ Tüm Talepler</option>
            <option value="Bekliyor">🕒 Bekleyenler</option>
            <option value="İşlemde">⚙️ İşlemdekiler</option>
            <option value="Çözüldü">✅ Çözülenler</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-12 text-center text-zinc-500">
            Filtrelere uygun talep bulunamadı.
          </div>
        ) : (
          filtered.map((req) => (
            <div 
              key={req.id} 
              className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-6 flex flex-col md:flex-row justify-between gap-6 shadow-sm hover:border-rose-200 dark:hover:border-rose-950/40 transition-all duration-200"
            >
              <div className="flex gap-4">
                <div className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 p-3.5 rounded-2xl shrink-0 border border-rose-100 dark:border-rose-900/30 h-fit">
                  <Wrench className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-zinc-400">{req.id}</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">
                      {req.category}
                    </span>
                    <span className="text-xs text-zinc-400">{req.date}</span>
                  </div>
                  
                  <h4 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50 mt-1.5">{req.title}</h4>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1 leading-relaxed max-w-xl">{req.description}</p>
                  
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex flex-col justify-center gap-3 md:items-end shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-zinc-100 dark:border-zinc-800/80">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusStyles(req.status)}`}>
                  {getStatusIcon(req.status)}
                  {req.status}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-bold mr-1">Durumu Güncelle:</span>
                  
                  {req.status !== "Bekliyor" && (
                    <button 
                      type="button"
                      onClick={() => void updateStatus(req.id, "Bekliyor")}
                      className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 dark:border-amber-900/40 dark:text-amber-400 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                    >
                      Beklet
                    </button>
                  )}
                  {req.status !== "İşlemde" && (
                    <button 
                      type="button"
                      onClick={() => void updateStatus(req.id, "İşlemde")}
                      className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:border-blue-900/40 dark:text-blue-400 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                    >
                      İşleme Al
                    </button>
                  )}
                  {req.status !== "Çözüldü" && (
                    <button 
                      type="button"
                      onClick={() => void updateStatus(req.id, "Çözüldü")}
                      className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-900/40 dark:text-emerald-400 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                    >
                      Çözüldü
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
