"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { SiteLogo } from "@/components/SiteLogo";
import { NotificationBell } from "@/components/NotificationBell";
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
  Wallet,
  Building2,
  MessagesSquare,
  Bell,
} from "lucide-react";

const NAV_ITEMS: {
  name: string;
  href: string;
  icon: LucideIcon;
  siteManagerOnly?: boolean;
}[] = [
  { name: "Özet Durum", href: "/admin", icon: LayoutDashboard },
  { name: "Sakinler & Onay", href: "/admin/residents", icon: Users },
  { name: "Topluluk & Sohbet", href: "/admin/topluluk", icon: MessagesSquare },
  { name: "Finans & Kasa", href: "/admin/finans", icon: Wallet },
  { name: "Duyuru Yönetimi", href: "/admin/announcements", icon: Megaphone },
  { name: "Arıza & Talepler", href: "/admin/requests", icon: Wrench },
  { name: "Bildirimler", href: "/admin/bildirimler", icon: Bell },
  { name: "Yönetim Kurulu", href: "/admin/kullanicilar", icon: UserSquare2, siteManagerOnly: true },
  { name: "Site Ayarları", href: "/admin/settings", icon: Settings },
  { name: "Platform Destek", href: "/admin/destek", icon: LifeBuoy, siteManagerOnly: true },
  { name: "Hesabım", href: "/admin/hesabim", icon: UserCog, siteManagerOnly: true },
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
      router.push("/");
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
      router.push("/");
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
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              collapsed && !onNavigate ? "justify-center" : ""
            } ${
              active
                ? "bg-indigo-600 text-white shadow-xs font-bold"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
            }`}
            title={collapsed && !onNavigate ? item.name : undefined}
          >
            <item.icon className={`h-5 w-5 shrink-0 ${active ? "text-white" : "text-slate-400 group-hover:text-indigo-600"}`} />
            {(!collapsed || !!onNavigate) && <span className="text-sm">{item.name}</span>}
          </Link>
        );
      })}
    </nav>
  );

  const bottomActions = (onNavigate?: () => void) => (
    <div className="border-t border-slate-100 p-3 space-y-1 shrink-0">
      <button
        type="button"
        onClick={async () => {
          onNavigate?.();
          try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch {}
          localStorage.removeItem("user");
          router.push("/");
        }}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors w-full cursor-pointer ${collapsed && !onNavigate ? "justify-center" : ""}`}
      >
        <LogOut className="h-5 w-5 shrink-0" />
        {(!collapsed || !!onNavigate) && <span className="text-sm font-semibold">Çıkış Yap</span>}
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 h-full transition-all duration-300 ease-in-out relative ${
          collapsed ? "w-[72px]" : "w-[260px]"
        } bg-white border-r border-slate-200/80`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 h-16 border-b border-slate-100 shrink-0 ${collapsed ? "justify-center" : ""}`}>
          <SiteLogo width={36} height={36} rounded className="shrink-0 rounded-lg" alt="" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-slate-900 truncate">Site Yönetimi</p>
              <p className="text-[11px] font-medium text-slate-500 truncate">Yönetici Portalı</p>
            </div>
          )}
        </div>

        {/* Nav Links */}
        {nav()}

        {/* Bottom Actions */}
        {bottomActions()}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-20 z-10 hidden lg:flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-900 shadow-xs hover:scale-110 transition-all cursor-pointer"
          aria-label={collapsed ? "Genişlet" : "Daralt"}
        >
          <ChevronLeft className={`h-3.5 w-3.5 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="relative flex flex-col w-[280px] max-w-[85vw] h-full bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <SiteLogo width={32} height={32} rounded className="rounded-lg" alt="" />
                <div>
                  <span className="text-sm font-extrabold text-slate-900">Site Yönetimi</span>
                  <span className="block text-[10px] text-slate-500">Yönetici Paneli</span>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav(() => setMobileOpen(false))}
            {bottomActions(() => setMobileOpen(false))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between h-16 px-8 bg-white border-b border-slate-200/80 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold text-slate-900">Yönetici Kontrol Paneli</span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell role="ADMIN" align="right" />
            <Link
              href="/"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-xl hover:bg-indigo-50 transition"
            >
              Siteye Dön &rarr;
            </Link>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-bold text-slate-900">Yönetici Portalı</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell role="ADMIN" align="right" />
            <Link href="/" className="text-xs font-semibold text-indigo-600 hover:underline">
              Siteye Dön
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
