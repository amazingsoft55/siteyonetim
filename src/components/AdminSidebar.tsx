"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PresenceHeartbeat } from "@/components/PresenceHeartbeat";
import { SiteLogo } from "@/components/SiteLogo";
import { SITE_BRAND_NAME } from "@/lib/brand";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  UserSquare2,
  UserCog,
  Users,
  Megaphone,
  Wrench,
  LifeBuoy,
  Settings,
  ChevronLeft,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS: {
  name: string;
  href: string;
  icon: LucideIcon;
  siteManagerOnly?: boolean;
}[] = [
  { name: "Özet Durum", href: "/admin", icon: LayoutDashboard },
  { name: "Yönetim Kurulu", href: "/admin/kullanicilar", icon: UserSquare2, siteManagerOnly: true },
  { name: "Hesabım", href: "/admin/hesabim", icon: UserCog, siteManagerOnly: true },
  { name: "Sakinler & Aidatlar", href: "/admin/residents", icon: Users },
  { name: "Duyuru Yönetimi", href: "/admin/announcements", icon: Megaphone },
  { name: "Arıza & Talepler", href: "/admin/requests", icon: Wrench },
  { name: "Platform Destek", href: "/admin/destek", icon: LifeBuoy, siteManagerOnly: true },
  { name: "Site Ayarları", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [managerRole, setManagerRole] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);

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
      setReady(true);
      if (r !== "ADMIN" && r !== "SUPER_ADMIN") {
        router.push("/dashboard");
      }
    } catch {
      router.push("/login");
    }
  }, [router]);

  const menuItems = React.useMemo(() => {
    return NAV_ITEMS.filter((item) => {
      if (!item.siteManagerOnly) return true;
      return ready && managerRole === "ADMIN";
    });
  }, [ready, managerRole]);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const nav = (onNavigate?: () => void) => (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      {menuItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              collapsed && !onNavigate ? "justify-center" : ""
            } ${
              active
                ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
            title={collapsed && !onNavigate ? item.name : undefined}
          >
            <item.icon className={`h-5 w-5 shrink-0 ${active ? "text-white" : "text-zinc-400 dark:text-zinc-500 group-hover:text-rose-500"}`} />
            {(!collapsed || !!onNavigate) && <span className="text-sm font-semibold">{item.name}</span>}
          </Link>
        );
      })}
    </nav>
  );

  const bottomActions = (onNavigate?: () => void) => (
    <div className="border-t border-zinc-100 dark:border-zinc-800/80 p-3 space-y-1 shrink-0">
      <div className={`flex items-center gap-2 ${collapsed && !onNavigate ? "justify-center" : ""}`}>
        <ThemeToggle />
        {(!collapsed || !!onNavigate) && <span className="text-xs font-medium text-zinc-500">Tema</span>}
      </div>
      <button
        type="button"
        onClick={async () => {
          onNavigate?.();
          try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch {}
          localStorage.removeItem("user");
          router.push("/login");
        }}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full ${collapsed && !onNavigate ? "justify-center" : ""}`}
      >
        <LogOut className="h-5 w-5 shrink-0" />
        {(!collapsed || !!onNavigate) && <span className="text-sm font-semibold">Çıkış Yap</span>}
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-[#0b0f19] overflow-hidden">
      <PresenceHeartbeat />

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 h-full transition-all duration-300 ease-in-out relative ${
          collapsed ? "w-[72px]" : "w-[260px]"
        } bg-white dark:bg-zinc-900/80 border-r border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-xl`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 h-16 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0 ${collapsed ? "justify-center" : ""}`}>
          <SiteLogo width={36} height={36} className="shrink-0" alt="" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50 truncate">{SITE_BRAND_NAME}</p>
              <p className="text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider">Yönetici</p>
            </div>
          )}
        </div>

        {nav()}
        {bottomActions()}

        {/* Collapse button */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-md flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
        >
          <ChevronLeft className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[260px] bg-white dark:bg-zinc-900 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 h-16 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <SiteLogo width={36} height={36} alt="" />
                <div>
                  <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50">{SITE_BRAND_NAME}</p>
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Yönetici</p>
                </div>
              </div>
              <button type="button" onClick={() => setMobileOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav(() => setMobileOpen(false))}
            {bottomActions(() => setMobileOpen(false))}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50">
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">Yönetici Paneli</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
