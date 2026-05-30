"use client";

import * as React from "react";
import { Bell } from "lucide-react";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  type: string;
  href: string | null;
  read: boolean;
  createdAt: string | null;
};

const TYPE_STYLES: Record<string, string> = {
  WELCOME: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  PAYMENT: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
  ANNOUNCEMENT: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
  REQUEST: "bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400",
  SYSTEM: "bg-zinc-100 dark:bg-zinc-500/20 text-zinc-600 dark:text-zinc-400",
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Az önce";
  if (mins < 60) return `${mins} dk önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} saat önce`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} gün önce`;
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
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4.5 min-w-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white dark:ring-zinc-900">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[70vh] overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Bildirimler</h3>
            <div className="flex items-center gap-2">
              {permission !== "granted" && "Notification" in window && (
                <button
                  type="button"
                  onClick={requestPermission}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Bildirimlere izin ver
                </button>
              )}
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  Tümünü okundu işaretle
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {items.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-400 dark:text-zinc-500">Henüz bildirim yok</p>
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleToggle(n)}
                  className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                    !n.read ? "bg-indigo-50/40 dark:bg-indigo-500/5" : ""
                  }`}
                >
                  <div className={`mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${TYPE_STYLES[n.type] ?? TYPE_STYLES.SYSTEM}`}>
                    {n.type === "WELCOME" ? "H" : n.type === "PAYMENT" ? "A" : n.type === "ANNOUNCEMENT" ? "D" : n.type === "REQUEST" ? "T" : "S"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold truncate ${!n.read ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-600 dark:text-zinc-400"}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 line-clamp-2 mt-0.5">
                      {n.body}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-600 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <div className="mt-2 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
