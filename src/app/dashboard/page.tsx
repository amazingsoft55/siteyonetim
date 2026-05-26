"use client";

import * as React from "react";
import { CreditCard, CheckCircle2, AlertCircle, Megaphone, Wrench, Shield } from "lucide-react";

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

export default function DashboardPage() {
  const [balance, setBalance] = React.useState(0);
  const [residentName, setResidentName] = React.useState("Sakin");
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [activeRequests, setActiveRequests] = React.useState<RequestItem[]>([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw) as { name?: string };
        if (typeof u?.name === "string" && u.name.trim()) setResidentName(u.name.trim());
      }
    } catch {
      /* ignore */
    }

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
          const list = Array.isArray(j) ? (j as Announcement[]) : [];
          setAnnouncements(list.slice(0, 3));
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
          setBalance(Number.isFinite(unpaid) ? Math.round(unpaid * 100) / 100 : 0);
        }
      } catch {
        /* ağ kopması */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            Merhaba {residentName},
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Görünüşe göre bugün sitenizde her şey yolunda.</p>
        </div>
        <div className="text-left sm:text-right">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold">
            <Shield className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" /> Güvenli oturum · D1 bağlı
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Balance Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 text-white shadow-xl shadow-indigo-600/10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-y-8 translate-x-8 opacity-10">
            <CreditCard className="h-48 w-48" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-indigo-100/90 text-sm uppercase tracking-wider">Aylık Aidat ve Ortak Gider</h3>
              <CreditCard className="h-6 w-6 text-indigo-200" />
            </div>
            <div className="mb-8">
              <span className="text-5xl font-black">₺{balance.toLocaleString("tr-TR")}</span>
              <span className="text-indigo-200 font-bold ml-1">.00</span>
              <p className="text-xs text-indigo-200/80 mt-2">Son ödeme tarihi: 31 Mayıs 2026</p>
            </div>
          </div>

          {balance > 0 ? (
            <a 
              href="/dashboard/payment"
              className="inline-flex items-center justify-center w-full py-4 px-4 bg-white text-indigo-700 rounded-2xl font-bold hover:bg-indigo-50 transition-all hover:scale-[1.02] shadow-md shadow-black/5 active:scale-98 text-center"
            >
              Hemen Güvenle Öde
            </a>
          ) : (
            <div className="flex items-center justify-center w-full py-4 px-4 bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 rounded-2xl font-bold">
              <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-300 animate-pulse" /> Tüm Borçlar Ödendi
            </div>
          )}
        </div>

        {/* Support Request Summary */}
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Aktif Taleplerim</h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                {activeRequests.length} Açık
              </span>
            </div>

            {activeRequests.length === 0 ? (
              <div className="p-6 text-center text-sm text-zinc-500 bg-zinc-50 dark:bg-zinc-950/40 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                Şu an devam eden herhangi bir arıza veya talebiniz yok.
              </div>
            ) : (
              <div className="space-y-3">
                {activeRequests.slice(0, 2).map((req) => (
                  <div key={req.id} className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/20 text-amber-900 dark:text-amber-400">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-extrabold">{req.title}</p>
                        <span className="text-[9px] px-1.5 py-0.2 bg-amber-200/60 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded font-bold">
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs opacity-80 mt-1 line-clamp-1">{req.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <a 
            href="/dashboard/requests"
            className="mt-6 w-full py-3.5 px-4 text-center bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-2xl font-bold text-sm transition-colors block"
          >
            Yeni Talep veya Öneri Gönder
          </a>
        </div>
      </div>

      {/* Announcements */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Yönetimden Duyurular
          </h3>
          <a href="/dashboard/announcements" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Tümünü Gör
          </a>
        </div>
        
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="p-8 text-center text-sm text-zinc-500 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
              Yayınlanmış duyuru bulunmuyor.
            </div>
          ) : (
            announcements.map((ann) => (
              <a 
                href="/dashboard/announcements"
                key={ann.id} 
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-200 cursor-pointer group flex justify-between items-start gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {ann.title}
                    </h4>
                    {ann.isNew && (
                      <span className="px-2 py-0.5 text-[9px] font-extrabold bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 rounded-full">
                        YENİ
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-1">{ann.content}</p>
                </div>
                <span className="text-xs text-zinc-400 whitespace-nowrap">{ann.date}</span>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
