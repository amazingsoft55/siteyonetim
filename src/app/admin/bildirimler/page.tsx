"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Megaphone,
  CreditCard,
  Wrench,
  Sparkles,
  Info,
  Trash2,
  Clock,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Send,
  Loader2,
  Mail,
  ShieldAlert,
} from "lucide-react";
import type { NotificationItem } from "@/components/NotificationBell";

function formatTimeAgo(isoString: string | null): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 45) return "Az önce";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} dakika önce`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} saat önce`;
    if (diffSec < 172800) return "Dün";
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "ANNOUNCEMENT":
      return <Megaphone className="h-5 w-5 text-amber-600" />;
    case "PAYMENT":
      return <CreditCard className="h-5 w-5 text-emerald-600" />;
    case "REQUEST":
      return <Wrench className="h-5 w-5 text-indigo-600" />;
    case "WELCOME":
      return <Sparkles className="h-5 w-5 text-violet-600" />;
    default:
      return <Info className="h-5 w-5 text-blue-600" />;
  }
}

function getTypeName(type: string) {
  switch (type) {
    case "ANNOUNCEMENT":
      return "Duyuru";
    case "PAYMENT":
      return "Aidat / Ödeme";
    case "REQUEST":
      return "Arıza / Talep";
    case "WELCOME":
      return "Sakin Kaydı";
    default:
      return "Sistem";
  }
}

export default function AdminNotificationsPage() {
  const [items, setItems] = React.useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<"ALL" | "UNREAD" | "REQUEST" | "ANNOUNCEMENT" | "SYSTEM">("ALL");
  const [testSending, setTestSending] = React.useState(false);
  const [testResult, setTestResult] = React.useState<string | null>(null);

  const loadNotifications = React.useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAllRead = async () => {
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

  const markSingleRead = async (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {}
  };

  const deleteSingle = async (id: string) => {
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

  // Test bildirimi oluştur
  const sendTestNotification = async () => {
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/notifications/test", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Yönetici Test Bildirimi 🔔",
          body: `Test başarılı! Tarih: ${new Date().toLocaleTimeString("tr-TR")}. Bildirim sistemi sorunsuz çalışıyor.`,
          type: "SYSTEM",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      if (res.ok && data.ok) {
        setTestResult(data.message || "Test bildirimi oluşturuldu.");
        await loadNotifications();
      } else {
        setTestResult(data.error || "Bildirim oluşturulamadı.");
      }
    } catch {
      setTestResult("Sunucu bağlantı hatası.");
    } finally {
      setTestSending(false);
    }
  };

  const filteredItems = items.filter((n) => {
    if (filter === "UNREAD") return !n.read;
    if (filter === "REQUEST") return n.type === "REQUEST";
    if (filter === "ANNOUNCEMENT") return n.type === "ANNOUNCEMENT";
    if (filter === "SYSTEM") return n.type === "SYSTEM" || n.type === "WELCOME";
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="h-7 w-7 text-indigo-600" />
            Yönetici Bildirim Merkezi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Yeni talep, sakin kayıtları ve sistem uyarılarını buradan yönetin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={sendTestNotification}
            disabled={testSending}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
            title="Test Bildirimi Gönder"
          >
            {testSending ? <Loader2 className="h-4 w-4 animate-spin text-indigo-600" /> : <Send className="h-4 w-4 text-indigo-600" />}
            <span>Test Bildirimi Oluştur</span>
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-2xl text-xs font-bold transition cursor-pointer"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Tümünü Oku ({unreadCount})</span>
            </button>
          )}
        </div>
      </div>

      {testResult && (
        <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>{testResult}</span>
          <button
            onClick={() => setTestResult(null)}
            className="text-indigo-400 hover:text-indigo-700"
          >
            &times;
          </button>
        </div>
      )}

      {/* Filtreleme Butonları */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
            filter === "ALL"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Tümü ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("UNREAD")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
            filter === "UNREAD"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Okunmamış ({unreadCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter("REQUEST")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
            filter === "REQUEST"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Talepler & Arızalar
        </button>
        <button
          type="button"
          onClick={() => setFilter("SYSTEM")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
            filter === "SYSTEM"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Sakin Kayıtları & Sistem
        </button>
      </div>

      {/* Bildirim Kartları */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-indigo-600" />
            <p className="text-xs font-medium">Bildirimler yükleniyor…</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              Bildirim Bulunmuyor
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {filter === "UNREAD"
                ? "Tüm bildirimleri incelediniz! Yeni bir sakin kaydı veya talep geldiğinde burada görünecektir."
                : "Bu filtreye ait herhangi bir bildirim kaydı bulunamadı."}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`group bg-white rounded-3xl p-4 sm:p-5 border transition-all duration-200 shadow-xs flex items-start gap-4 ${
                !item.read
                  ? "border-indigo-200 bg-indigo-50/20"
                  : "border-slate-200/80 hover:border-slate-300"
              }`}
            >
              {/* İkon */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 shrink-0">
                {getNotificationIcon(item.type)}
              </div>

              {/* Detaylar */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-slate-100 text-slate-600 uppercase tracking-wider">
                      {getTypeName(item.type)}
                    </span>
                    <h3
                      className={`text-sm font-bold ${
                        !item.read ? "text-slate-900" : "text-slate-700"
                      }`}
                    >
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatTimeAgo(item.createdAt)}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {item.body}
                </p>

                {/* Butonlar */}
                <div className="flex items-center gap-3 pt-2">
                  {item.href && (
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (!item.read) markSingleRead(item.id);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
                    >
                      <span>İlgili Sayfaya Git</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}

                  {!item.read && (
                    <button
                      type="button"
                      onClick={() => markSingleRead(item.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <CheckCheck className="h-3.5 w-3.5 text-indigo-600" />
                      Okundu Olarak İşaretle
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteSingle(item.id)}
                    className="ml-auto p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Bildirimi Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
