"use client";

import * as React from "react";
import { Bell, Megaphone, CreditCard, UserPlus, Wrench, Check, CheckCheck } from "lucide-react";

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
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
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
    } catch {
      /* sessiz */
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  React.useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      } catch {
        /* sessiz */
      }
    }
    if (notif.href) {
      window.location.href = notif.href;
    }
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
    } catch {
      /* sessiz */
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
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
        <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] max-h-[75vh] overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xl z-50 flex flex-col">
          
          {/* Header */}
          <div className="px-5 pt-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Bildirimler</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full">
                    {unreadCount} yeni
                  </span>
                )}
              </div>
              {permission !== "granted" && "Notification" in window && (
                <button
                  type="button"
                  onClick={requestPermission}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  İzin Ver
                </button>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Tümünü okundu işaretle
              </button>
            )}
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {items.length === 0 ? (
              <div className="py-14 text-center">
                <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                  <Bell className="h-6 w-6 text-zinc-300 dark:text-zinc-600" />
                </div>
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Bildirim yok</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">Yeni bildirimler burada görünecek</p>
              </div>
            ) : (
              items.map((n) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.SYSTEM;
                const Icon = cfg.icon;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleToggle(n)}
                    className={`w-full text-left px-5 py-3.5 flex gap-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-150 border-b border-zinc-50 dark:border-zinc-800/30 last:border-0 ${
                      !n.read ? "bg-indigo-50/30 dark:bg-indigo-500/5" : ""
                    }`}
                  >
                    <div className={`mt-0.5 h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                      <Icon className={`h-4.5 w-4.5 ${cfg.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-snug ${!n.read ? "font-bold text-zinc-900 dark:text-zinc-50" : "font-medium text-zinc-600 dark:text-zinc-400"}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-600 shrink-0 mt-0.5">{timeAgo(n.createdAt)}</span>
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
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
