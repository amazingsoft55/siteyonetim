"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Megaphone,
  CreditCard,
  Wrench,
  Sparkles,
  Info,
  ExternalLink,
  Trash2,
  Clock,
  Loader2,
} from "lucide-react";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  type: "WELCOME" | "PAYMENT" | "ANNOUNCEMENT" | "REQUEST" | "SYSTEM";
  href?: string | null;
  read: boolean;
  createdAt: string | null;
};

function formatTimeAgo(isoString: string | null): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 45) return "Az önce";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} dk önce`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} sa önce`;
    if (diffSec < 172800) return "Dün";
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "ANNOUNCEMENT":
      return <Megaphone className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
    case "PAYMENT":
      return <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case "REQUEST":
      return <Wrench className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
    case "WELCOME":
      return <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />;
    default:
      return <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
  }
}

function getNotificationBadgeColor(type: string) {
  switch (type) {
    case "ANNOUNCEMENT":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300";
    case "PAYMENT":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "REQUEST":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300";
    case "WELCOME":
      return "bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300";
    default:
      return "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300";
  }
}

export function NotificationBell({
  role = "USER",
  align = "right",
}: {
  role?: "USER" | "ADMIN" | "SUPER_ADMIN";
  align?: "left" | "right";
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const fetchNotifications = React.useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await fetch("/api/notifications", { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as {
          notifications?: NotificationItem[];
          unreadCount?: number;
        };
        setItems(data.notifications || []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch {
      // sessiz
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  // Sayfa yüklendiğinde ve 25 saniyede bir otomatik sorgula
  React.useEffect(() => {
    fetchNotifications(true);

    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 25000);

    const handleFocus = () => fetchNotifications(false);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchNotifications]);

  // Dışarı tıklandığında menüyü kapat
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Tek bildirimi okundu yap ve yönlendir
  const handleClickNotification = async (item: NotificationItem) => {
    if (!item.read) {
      // İyimser güncelleme
      setItems((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));

      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id }),
        });
      } catch {}
    }

    setOpen(false);

    if (item.href) {
      router.push(item.href);
    }
  };

  // Tümünü okundu yap
  const handleMarkAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "readAll" }),
      });
    } catch {}
  };

  // Bildirimi sil
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const itemToDelete = items.find((n) => n.id === id);
    setItems((prev) => prev.filter((n) => n.id !== id));
    if (itemToDelete && !itemToDelete.read) {
      setUnreadCount((c) => Math.max(0, c - 1));
    }

    try {
      await fetch(`/api/notifications?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {}
  };

  const allViewHref = role === "ADMIN" || role === "SUPER_ADMIN" ? "/admin/bildirimler" : "/dashboard/bildirimler";

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Zil Butonu */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) fetchNotifications(false);
        }}
        className="relative p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-all duration-200 focus:outline-none cursor-pointer"
        aria-label="Bildirimler"
        title="Bildirimler"
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in-50">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Çekmecesi */}
      {open && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-2 w-80 sm:w-96 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-zinc-100">
                Bildirimler
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-900/30">
                  {unreadCount} yeni
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition cursor-pointer"
                  title="Tümünü Okundu İşaretle"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Tümünü Oku</span>
                </button>
              )}
            </div>
          </div>

          {/* Bildirim Listesi */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/60">
            {loading && items.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-500" />
                <p className="text-xs">Bildirimler yükleniyor…</p>
              </div>
            ) : items.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Bell className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                  Henüz bildiriminiz yok
                </p>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
                  Yeni duyuru veya aidat eklendiğinde burada görebilirsiniz.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleClickNotification(item)}
                  className={`group relative flex items-start gap-3 p-3.5 transition-all cursor-pointer ${
                    !item.read
                      ? "bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30"
                      : "hover:bg-slate-50 dark:hover:bg-zinc-800/40"
                  }`}
                >
                  {/* İkon */}
                  <div className="mt-0.5 p-2 rounded-xl bg-white dark:bg-zinc-800 shadow-xs border border-slate-100 dark:border-zinc-700/60 shrink-0">
                    {getNotificationIcon(item.type)}
                  </div>

                  {/* İçerik */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-xs font-bold truncate ${
                          !item.read
                            ? "text-slate-900 dark:text-zinc-100"
                            : "text-slate-700 dark:text-zinc-300"
                        }`}
                      >
                        {item.title}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.createdAt && (
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" />
                            {formatTimeAgo(item.createdAt)}
                          </span>
                        )}
                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.body}
                    </p>

                    {item.href && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 pt-0.5 group-hover:underline">
                        Görüntüle <ExternalLink className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </div>

                  {/* Sil Butonu (Hover) */}
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity rounded-md hover:bg-red-50 dark:hover:bg-red-950/30"
                    title="Bildirimi Sil"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/50 text-center">
            <Link
              href={allViewHref}
              onClick={() => setOpen(false)}
              className="block w-full py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-zinc-800 transition"
            >
              Tüm Bildirimleri ve Geçmişi Gör &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
