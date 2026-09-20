"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { SiteLogo } from "@/components/SiteLogo";
import { NotificationBell } from "@/components/NotificationBell";
import { SITE_BRAND_NAME } from "@/lib/brand";
import { Home, CreditCard, Megaphone, Wrench, LogOut, MessagesSquare, User, Bell } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [asideName, setAsideName] = React.useState("Sakin");
  const [asideMeta, setAsideMeta] = React.useState("");

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const u = JSON.parse(raw) as { name?: string; apartmentNo?: string | null };
      if (typeof u.name === "string" && u.name.trim()) setAsideName(u.name.trim());
      const apt = typeof u.apartmentNo === "string" ? u.apartmentNo.trim() : "";
      setAsideMeta(apt ? `Daire ${apt}` : "Kayıtlı sakin");
    } catch { /* ignore */ }
  }, []);

  React.useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) router.push("/");
  }, [router]);

  const isActive = (path: string) => pathname === path;

  const menuItems = [
    { name: "Ana Sayfa", shortName: "Anasayfa", href: "/dashboard", icon: Home },
    { name: "Resmi Duyurular", shortName: "Duyuru", href: "/dashboard/announcements", icon: Megaphone },
    { name: "Komşu Sohbeti", shortName: "Topluluk", href: "/dashboard/topluluk", icon: MessagesSquare },
    { name: "Aidat & IBAN", shortName: "Aidat", href: "/dashboard/payments", icon: CreditCard },
    { name: "Taleplerim", shortName: "Talep", href: "/dashboard/requests", icon: Wrench },
    { name: "Bildirimler", shortName: "Bildirim", href: "/dashboard/bildirimler", icon: Bell },
    { name: "Hesabım", shortName: "Hesabım", href: "/dashboard/hesabim", icon: User },
  ];

  return (
    <div className="flex h-dvh bg-zinc-50 dark:bg-[#0b0f19] flex-col sm:flex-row overflow-hidden">

      {/* ══════ DESKTOP SIDEBAR ══════ */}
      <aside className="hidden sm:flex flex-col w-64 border-r border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-full p-4 shrink-0">
        <div className="px-2 py-4 mb-4 border-b border-zinc-100 dark:border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <SiteLogo width={36} height={36} alt="" />
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate">{SITE_BRAND_NAME}</p>
            </div>
            <NotificationBell role="USER" align="left" />
          </div>
          <div className="flex items-center gap-2 px-1">
            <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30 text-xs font-bold shrink-0">
              {asideName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">{asideName}</p>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 truncate">{asideMeta}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 font-medium text-sm ${
                  active
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </a>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-zinc-100 dark:border-zinc-800/80 pt-4 flex justify-between items-center px-2">
          <button
            onClick={async () => {
              try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch {}
              localStorage.removeItem("user");
              router.push("/");
            }}
            className="flex items-center gap-1.5 text-sm text-red-500 dark:text-red-400 hover:text-red-600 font-semibold cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* ══════ MOBILE HEADER ══════ */}
      <header className="sm:hidden flex items-center justify-between px-4 h-14 border-b border-zinc-200/60 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <SiteLogo width={28} height={28} alt="" />
          <span className="text-sm font-bold text-zinc-950 dark:text-zinc-50 truncate">Sakin Paneli</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <NotificationBell role="USER" align="right" />
          <button
            onClick={async () => {
              try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch {}
              localStorage.removeItem("user");
              router.push("/");
            }}
            className="p-2 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
            title="Çıkış Yap"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* ══════ MAIN CONTENT ══════ */}
      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain sm:pb-0 pb-20">
        {children}
      </main>

      {/* ══════ MOBILE BOTTOM NAV ══════ */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-zinc-900 border-t border-zinc-200/60 dark:border-zinc-800/80 z-50" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="flex items-center justify-around h-16">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                  active
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-400 dark:text-zinc-500 active:text-zinc-600"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-colors ${active ? "bg-indigo-50 dark:bg-indigo-950/40" : ""}`}>
                  <item.icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>{item.shortName}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
