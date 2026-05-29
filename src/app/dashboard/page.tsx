"use client";

import * as React from "react";
import {
  CreditCard, CheckCircle2, AlertCircle, Megaphone, Wrench,
  Shield, Plus, ArrowRight, Clock, TrendingUp, Bell,
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  date: string;
  content: string;
  category?: string;
  isNew?: boolean;
}

interface PaymentRow {
  id: string;
  period: string;
  amount: number;
  date: string;
  status: string;
  type: string;
}

interface RequestItem {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  status: "Bekliyor" | "İşlemde" | "Çözüldü";
}

function SkeletonCard() {
  return (
    <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 animate-pulse">
      <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-700 rounded mb-4" />
      <div className="h-10 w-24 bg-zinc-200 dark:bg-zinc-700 rounded mb-6" />
      <div className="h-10 w-full bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  Bekliyor: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40",
  İşlemde: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40",
  Çözüldü: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40",
};

export default function DashboardPage() {
  const [loading, setLoading] = React.useState(true);
  const [balance, setBalance] = React.useState(0);
  const [residentName, setResidentName] = React.useState("");
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [activeRequests, setActiveRequests] = React.useState<RequestItem[]>([]);
  const [paidCount, setPaidCount] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(0);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw) as { name?: string };
        if (typeof u?.name === "string" && u.name.trim()) setResidentName(u.name.trim());
      }
    } catch { /* ignore */ }

    let cancelled = false;
    (async () => {
      const opts = { credentials: "include" as const };
      try {
        const [annRes, reqRes, payRes] = await Promise.all([
          fetch("/api/announcements", opts),
          fetch("/api/requests", opts),
          fetch("/api/payments", opts),
        ]);

        if (!cancelled && annRes.ok) {
          const j: unknown = await annRes.json();
          setAnnouncements(Array.isArray(j) ? (j as Announcement[]).slice(0, 3) : []);
        }

        if (!cancelled && reqRes.ok) {
          const j: unknown = await reqRes.json();
          const allReq = Array.isArray(j) ? (j as RequestItem[]) : [];
          setActiveRequests(allReq.filter((r) => r.status !== "Çözüldü"));
        }

        if (!cancelled && payRes.ok) {
          const j: unknown = await payRes.json();
          const plist = Array.isArray(j) ? (j as PaymentRow[]) : [];
          const unpaid = plist.filter((p) => p.status === "Bekliyor").reduce((a, p) => a + Number(p.amount), 0);
          const paid = plist.filter((p) => p.status !== "Bekliyor").length;
          setBalance(Number.isFinite(unpaid) ? Math.round(unpaid * 100) / 100 : 0);
          setPaidCount(paid);
          setTotalCount(plist.length);
        }
      } catch { /* ağ kopması */ }
      finally { if (!cancelled) setLoading(false); }
    })();

    return () => { cancelled = true; };
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";

  if (loading) {
    return (
      <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto pb-16">
        <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="h-48 bg-zinc-100 dark:bg-zinc-900 rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-5xl mx-auto pb-16">

      {/* Karşılama başlığı */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            {greeting}{residentName ? `, ${residentName}` : ""} 👋
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
            Panelinize hoş geldiniz. Güncel durumunuz aşağıda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200/60 dark:border-emerald-800/40">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Canlı veri
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold">
            <Shield className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" /> Güvenli oturum
          </div>
        </div>
      </div>

      {/* Hızlı istatistikler */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Borç", value: `₺${balance.toLocaleString("tr-TR")}`, icon: CreditCard, color: balance > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400" },
          { label: "Ödenen", value: `${paidCount}/${totalCount}`, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Aktif Talep", value: activeRequests.length, icon: Wrench, color: "text-amber-600 dark:text-amber-400" },
          { label: "Duyuru", value: announcements.length, icon: Bell, color: "text-indigo-600 dark:text-indigo-400" },
        ].map((stat) => (
          <div key={stat.label} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 shadow-sm flex flex-col gap-3">
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
            <div>
              <p className="text-xl font-black text-zinc-900 dark:text-zinc-50">{stat.value}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Ana kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Aidat / Borç kartı */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 text-white shadow-xl shadow-indigo-600/15 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-y-10 translate-x-10 opacity-10" aria-hidden>
            <CreditCard className="h-52 w-52" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-indigo-100/90 text-sm uppercase tracking-wider">Aidat & Ortak Gider</h3>
              <CreditCard className="h-5 w-5 text-indigo-200" />
            </div>
            <div className="mb-8">
              <span className="text-5xl font-black tabular-nums">₺{balance.toLocaleString("tr-TR")}</span>
              {totalCount > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white/80 rounded-full transition-all duration-700"
                      style={{ width: `${Math.round((paidCount / totalCount) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-indigo-200 font-semibold whitespace-nowrap">
                    {Math.round((paidCount / totalCount) * 100)}% ödendi
                  </span>
                </div>
              )}
              <p className="text-xs text-indigo-200/80 mt-3">Ödenmemiş aidat ve giderler toplamı</p>
            </div>
          </div>
          {balance > 0 ? (
            <a
              href="/dashboard/payment"
              className="inline-flex items-center justify-center gap-2 w-full py-4 px-4 bg-white text-indigo-700 rounded-2xl font-bold hover:bg-indigo-50 transition-all hover:scale-[1.02] shadow-md shadow-black/10 text-center"
            >
              <TrendingUp className="h-4 w-4" /> Hemen Öde
            </a>
          ) : (
            <div className="flex items-center justify-center w-full py-4 px-4 bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 rounded-2xl font-bold gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" /> Tüm Borçlar Temiz
            </div>
          )}
        </div>

        {/* Aktif talepler kartı */}
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-amber-500" /> Aktif Taleplerim
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                {activeRequests.length} açık
              </span>
            </div>

            {activeRequests.length === 0 ? (
              <div className="p-6 text-center text-sm text-zinc-500 bg-zinc-50 dark:bg-zinc-950/40 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
                Devam eden talebiniz yok.
              </div>
            ) : (
              <div className="space-y-3">
                {activeRequests.slice(0, 2).map((req) => (
                  <div
                    key={req.id}
                    className={`flex items-start gap-3 p-4 rounded-2xl border ${STATUS_STYLES[req.status] ?? STATUS_STYLES["Bekliyor"]}`}
                  >
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-extrabold truncate">{req.title}</p>
                        <span className="text-[9px] px-1.5 py-0.5 bg-white/50 dark:bg-black/20 rounded font-bold">
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs opacity-75 mt-1 line-clamp-1">{req.description}</p>
                      <p className="text-[10px] opacity-60 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {req.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <a
            href="/dashboard/requests"
            className="mt-6 w-full py-3.5 px-4 text-center bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-700 dark:hover:text-indigo-400 rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" /> Yeni Talep Gönder
          </a>
        </div>
      </div>

      {/* Duyurular */}
      <div>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Yönetimden Duyurular
          </h3>
          <a
            href="/dashboard/announcements"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Tümünü Gör <ArrowRight className="h-3 w-3" />
          </a>
        </div>

        <div className="space-y-3">
          {announcements.length === 0 ? (
            <div className="p-10 text-center text-sm text-zinc-500 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
              <Megaphone className="h-8 w-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
              Yayınlanmış duyuru bulunmuyor.
            </div>
          ) : (
            announcements.map((ann) => (
              <a
                href="/dashboard/announcements"
                key={ann.id}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all duration-200 cursor-pointer group flex justify-between items-start gap-4 block"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {ann.title}
                    </h4>
                    {ann.isNew && (
                      <span className="px-2 py-0.5 text-[9px] font-extrabold bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 rounded-full shrink-0">
                        YENİ
                      </span>
                    )}
                    {ann.category && (
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-900/40 shrink-0">
                        {ann.category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-1">{ann.content}</p>
                </div>
                <span className="text-xs text-zinc-400 whitespace-nowrap flex items-center gap-1 shrink-0">
                  <Clock className="h-3 w-3" /> {ann.date}
                </span>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
