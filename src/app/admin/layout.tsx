"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PresenceHeartbeat } from "@/components/PresenceHeartbeat";
import { SiteLogo } from "@/components/SiteLogo";
import { SITE_BRAND_NAME } from "@/lib/brand";
import type { LucideIcon } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import {
  Users,
  Megaphone,
  LayoutDashboard,
  Wrench,
  Settings,
  LogOut,
  UserSquare2,
  LifeBuoy,
  UserCog,
} from "lucide-react";

const ADMIN_MENU: {
  name: string;
  shortName: string;
  href: string;
  icon: LucideIcon;
  siteManagerOnly?: boolean;
}[] = [
  { name: "Özet Durum", shortName: "Özet", href: "/admin", icon: LayoutDashboard },
  { name: "Yönetim kurulu", shortName: "Kurul", href: "/admin/kullanicilar", icon: UserSquare2, siteManagerOnly: true },
  { name: "Hesabım", shortName: "Hesap", href: "/admin/hesabim", icon: UserCog, siteManagerOnly: true },
  { name: "Sakinler & Aidatlar", shortName: "Sakinler", href: "/admin/residents", icon: Users },
  { name: "Duyuru Yönetimi", shortName: "Duyuru", href: "/admin/announcements", icon: Megaphone },
  { name: "Arıza & Talepler", shortName: "Talepler", href: "/admin/requests", icon: Wrench },
  { name: "Platform Destek", shortName: "Destek", href: "/admin/destek", icon: LifeBuoy, siteManagerOnly: true },
  { name: "Site Ayarları", shortName: "Ayarlar", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [managerRole, setManagerRole] = React.useState<string | null>(null);
  const [navReady, setNavReady] = React.useState(false);

  React.useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.push("/login");
      return;
    }
    try {
      const u = JSON.parse(raw) as { role?: string };
      const r = u.role ?? null;
      setManagerRole(r);
      setNavReady(true);
      if (r !== "ADMIN" && r !== "SUPER_ADMIN") {
        router.push("/dashboard");
      }
    } catch {
      router.push("/login");
    }
  }, [router]);

  const menuItems = React.useMemo(() => {
    return ADMIN_MENU.filter((item) => {
      if (!item.siteManagerOnly) return true;
      return navReady && managerRole === "ADMIN";
    });
  }, [navReady, managerRole]);

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex h-dvh bg-rose-50/10 dark:bg-[#0b0f19] flex-col sm:flex-row overflow-hidden">
      <PresenceHeartbeat />

      {/* ══════ DESKTOP SIDEBAR ══════ */}
      <aside className="hidden sm:flex flex-col w-64 border-r border-rose-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-full p-4 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-4 mb-6 border-b border-zinc-100 dark:border-zinc-800/80">
          <SiteLogo width={40} height={40} alt="" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate">{SITE_BRAND_NAME}</p>
            <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">Yönetici paneli</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 font-medium text-sm ${
                  active
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/10"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-rose-50 dark:hover:bg-zinc-800"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </a>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-zinc-100 dark:border-zinc-800/80 pt-4 flex justify-between items-center px-2">
          <ThemeToggle />
          <div className="flex items-center gap-1">
            <NotificationBell />
            <button
              onClick={async () => {
                try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch {}
                localStorage.removeItem("user");
                router.push("/login");
              }}
              className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-rose-600 font-bold"
            >
              <LogOut className="h-4 w-4" />
              Çıkış Yap
            </button>
          </div>
        </div>
      </aside>

      {/* ══════ MOBILE HEADER ══════ */}
      <header className="sm:hidden flex items-center justify-between px-4 h-14 border-b border-rose-200/50 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <SiteLogo width={28} height={28} alt="" />
          <span className="text-sm font-bold text-zinc-950 dark:text-zinc-50 truncate">{SITE_BRAND_NAME}</span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <NotificationBell />
          <button
            onClick={async () => {
              try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch {}
              localStorage.removeItem("user");
              router.push("/login");
            }}
            className="p-2 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            title="Çıkış Yap"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* ══════ MAIN CONTENT ══════ */}
      <main className="flex-1 overflow-y-auto overscroll-contain sm:pb-0 pb-20">
        <div className="h-full">{children}</div>
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
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-zinc-400 dark:text-zinc-500 active:text-zinc-600"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-colors ${active ? "bg-rose-50 dark:bg-rose-950/40" : ""}`}>
                  <item.icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                </div>
                <span className={`text-[11px] ${active ? "font-bold" : "font-medium"}`}>{item.shortName}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
