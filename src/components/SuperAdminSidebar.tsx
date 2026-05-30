"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SiteLogo } from "@/components/SiteLogo";
import { SITE_BRAND_NAME } from "@/lib/brand";
import {
  LayoutDashboard,
  Users,
  LifeBuoy,
  UserCog,
  CreditCard,
  Settings,
  ChevronLeft,
  LogOut,
  Menu,
  X,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
  { name: "Kullanıcılar", href: "/super-admin/kullanicilar", icon: Users },
  { name: "Destek", href: "/super-admin/destek", icon: LifeBuoy },
  { name: "Hesabım", href: "/super-admin/hesabim", icon: UserCog },
];

export function SuperAdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isActive = (href: string) => {
    if (href === "/super-admin") return pathname === "/super-admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-[#060a12] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 h-full transition-all duration-300 ease-in-out ${
          collapsed ? "w-[72px]" : "w-[260px]"
        } bg-white dark:bg-zinc-900/80 border-r border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-xl`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 h-16 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0 ${collapsed ? "justify-center" : ""}`}>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
            <SiteLogo width={32} height={32} className="h-7 w-7 brightness-0 invert" alt="" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50 truncate">{SITE_BRAND_NAME}</p>
              <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Süper Yönetici</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  collapsed ? "justify-center" : ""
                } ${
                  active
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className={`h-5 w-5 shrink-0 ${active ? "text-white" : "text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-500"}`} />
                {!collapsed && <span className="text-sm font-semibold">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-zinc-100 dark:border-zinc-800/80 p-3 space-y-1 shrink-0">
          <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
            <ThemeToggle />
            {!collapsed && <span className="text-xs font-medium text-zinc-500">Tema</span>}
          </div>
          <Link
            href="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="text-sm font-semibold">Çıkış Yap</span>}
          </Link>
        </div>

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
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <SiteLogo width={32} height={32} className="h-7 w-7 brightness-0 invert" alt="" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50">{SITE_BRAND_NAME}</p>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Süper Yönetici</p>
                </div>
              </div>
              <button type="button" onClick={() => setMobileOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      active
                        ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${active ? "text-white" : ""}`} />
                    <span className="text-sm font-semibold">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
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
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
              <Zap className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">Canlı</span>
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
