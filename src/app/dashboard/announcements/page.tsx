"use client";

import * as React from "react";
import { Megaphone, Search, Calendar } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  date: string;
  content: string;
  category?: string;
  isNew?: boolean;
}

export default function ResidentAnnouncementsPage() {
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [search, setSearch] = React.useState("");
  const [loadErr, setLoadErr] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadErr("");
      const res = await fetch("/api/announcements", { credentials: "include" });
      const j: unknown = await res.json().catch(() => null);
      if (!res.ok || !Array.isArray(j)) {
        if (!cancelled) {
          setLoadErr("Duyurular sunucudan alınamadı. Oturumunuzu veya D1 bağlantısını kontrol edin.");
          setAnnouncements([]);
        }
        return;
      }
      if (!cancelled) setAnnouncements(j as Announcement[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = announcements.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.content.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryColor = (cat?: string) => {
    switch (cat) {
      case "Mali":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400";
      case "Teknik":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400";
      default:
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400";
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">Yönetim Duyuruları</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Yönetim tarafından yayınlanan güncel gelişmeleri takip edin.</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Duyuru ara..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-zinc-950 dark:text-zinc-50"
          />
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
        </div>
      </div>

      {loadErr && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/25 p-4 text-sm text-amber-950 dark:text-amber-100">
          {loadErr}
        </div>
      )}

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-12 text-center text-zinc-500">
            {!loadErr && announcements.length === 0
              ? "Henüz yayınlanmış duyuru yok."
              : "Aramanızla eşleşen duyuru bulunamadı."}
          </div>
        ) : (
          filtered.map((a) => (
            <div 
              key={a.id} 
              className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 p-3.5 rounded-2xl shrink-0 border border-indigo-100 dark:border-indigo-900/30">
                  <Megaphone className="h-6 w-6" />
                </div>
                <div className="space-y-2 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50">{a.title}</h3>
                      {a.isNew && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 rounded-full">
                          YENİ
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-xs text-zinc-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {a.date}
                    </span>
                  </div>
                  
                  {a.category && (
                    <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full ${getCategoryColor(a.category)}`}>
                      {a.category}
                    </span>
                  )}
                  
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed pt-1">
                    {a.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
