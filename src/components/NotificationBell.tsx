"use client";

import * as React from "react";
import { Bell, Megaphone, CreditCard, UserPlus, Wrench, CheckCheck, X } from "lucide-react";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  type: string;
  href: string | null;
  read: boolean;
  createdAt: string | null;
};

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  WELCOME: { icon: UserPlus, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/15" },
  PAYMENT: { icon: CreditCard, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/15" },
  ANNOUNCEMENT: { icon: Megaphone, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/15" },
  REQUEST: { icon: Wrench, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-500/15" },
  SYSTEM: { icon: Bell, color: "text-zinc-600 dark:text-zinc-400", bg: "bg-zinc-100 dark:bg-zinc-500/15" },
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Az önce";
  if (mins < 60) return `${mins} dk`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} sa`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} gün`;
  return new Date(dateStr).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

export function NotificationBell() {
  const [items, setItems] = React.useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [permission, setPermission] = React.useState<NotificationPermission>("default");
  const panelRef = React.useRef<HTMLDivElement>(null);
  const btnRef = React.useRef<HTMLButtonElement>(null);

  const fetchNotifications = React.useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = (await res.json()) as { notifications?: NotificationItem[]; unreadCount?: number };
      setItems(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);

      if ((data.unreadCount ?? 0) > 0 && "Notification" in window && Notification.permission === "granted") {
        const latest = data.notifications?.find((n: NotificationItem) => !n.read);
        if (latest && !sessionStorage.getItem(`notif-shown-${latest.id}`)) {
          sessionStorage.setItem(`notif-shown-${latest.id}`, "1");
          new Notification(latest.title, { body: latest.body, icon: "/logo.png" });
        }
      }
    } catch { /* sessiz */ }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  React.useEffect(() => {
    if ("Notification" in window) setPermission(Notification.permission);
  }, []);

  React.useEffect(() => {
    function handleClickOutside(e: Event) {
      const target = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(target) && btnRef.current && !btnRef.current.contains(target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  // Mobilde body scroll kilitle
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.inset = "0";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.inset = "";
    };
  }, [open]);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const handleToggle = async (notif: NotificationItem) => {
    if (!notif.read) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: notif.id }),
        });
        setItems((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch { /* sessiz */ }
    }
    if (notif.href) window.location.href = notif.href;
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "readAll" }),
      });
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { /* sessiz */ }
  };

  function renderList() {
    if (items.length === 0) {
      return (
        <div className="py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
            <Bell className="h-7 w-7 text-zinc-300 dark:text-zinc-600" />
          </div>
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Bildirim yok</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">Yeni bildirimler burada görünecek</p>
        </div>
      );
    }

    return items.map((n) => {
      const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.SYSTEM;
      const Icon = cfg.icon;
      return (
        <button
          key={n.id}
          type="button"
          onClick={() => handleToggle(n)}
          className={`w-full text-left px-5 py-3.5 flex gap-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-150 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0 ${
            !n.read ? "bg-indigo-50/40 dark:bg-indigo-500/5" : ""
          }`}
        >
          <div className={`mt-0.5 h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
            <Icon className={`h-4.5 w-4.5 ${cfg.color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className={`text-sm leading-snug pr-2 ${!n.read ? "font-bold text-zinc-900 dark:text-zinc-50" : "font-medium text-zinc-600 dark:text-zinc-400"}`}>
                {n.title}
              </p>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-600 shrink-0 mt-0.5 whitespace-nowrap">{timeAgo(n.createdAt)}</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 line-clamp-2 mt-0.5 leading-relaxed">
              {n.body}
            </p>
          </div>
          {!n.read && (
            <div className="mt-2 h-2 w-2 rounded-full bg-indigo-500 shrink-0 ring-4 ring-indigo-50 dark:ring-indigo-500/10" />
          )}
        </button>
      );
    });
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (unreadCount === 0) fetchNotifications();
        }}
        className="relative p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        aria-label="Bildirimler"
      >
        <Bell className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4.5 min-w-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white dark:ring-zinc-900 animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* === MOBİL: Tam ekran bottom sheet === */}
          <div className="fixed inset-0 z-[9998] bg-black/40 sm:hidden" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 top-14 z-[9999] sm:hidden flex flex-col bg-white dark:bg-zinc-900 rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            </div>
            {/* Header */}
            <div className="px-5 pt-2 pb-3 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Bildirimler</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full">
                    {unreadCount} yeni
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {permission !== "granted" && "Notification" in window && (
                  <button type="button" onClick={requestPermission} className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                    İzin Ver
                  </button>
                )}
                {unreadCount > 0 && (
                  <button type="button" onClick={handleMarkAllRead} className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500">
                    <CheckCheck className="h-3.5 w-3.5" /> Okundu
                  </button>
                )}
                <button type="button" onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <X className="h-4 w-4 text-zinc-400" />
                </button>
              </div>
            </div>
            {/* List */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {renderList()}
            </div>
          </div>

          {/* === TABLET / DESKTOP: Dropdown === */}
          <div className="hidden sm:block fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="hidden sm:flex absolute right-0 top-full mt-2 w-[380px] max-h-[70vh] flex-col rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Bildirimler</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full">
                      {unreadCount} yeni
                    </span>
                  )}
                </div>
                {permission !== "granted" && "Notification" in window && (
                  <button type="button" onClick={requestPermission} className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    İzin Ver
                  </button>
                )}
              </div>
              {unreadCount > 0 && (
                <button type="button" onClick={handleMarkAllRead} className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <CheckCheck className="h-3.5 w-3.5" />
                  Tümünü okundu işaretle
                </button>
              )}
            </div>
            {/* List */}
            <div className="overflow-y-auto flex-1 min-h-0 overscroll-contain">
              {renderList()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
