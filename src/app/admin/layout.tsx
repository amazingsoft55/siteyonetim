"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PresenceHeartbeat } from "@/components/PresenceHeartbeat";
import { SiteLogo } from "@/components/SiteLogo";
import { SITE_BRAND_NAME } from "@/lib/brand";
import type { LucideIcon } from "lucide-react";
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
  href: string;
  icon: LucideIcon;
  /** Sadece atanmış site yöneticisi (ADMIN); süper yönetici admin panelinde görünmez */
  siteManagerOnly?: boolean;
}[] = [
  { name: "Özet Durum", href: "/admin", icon: LayoutDashboard },
  { name: "Yönetim kurulu", href: "/admin/kullanicilar", icon: UserSquare2, siteManagerOnly: true },
  { name: "Hesabım", href: "/admin/hesabim", icon: UserCog, siteManagerOnly: true },
  { name: "Sakinler & Aidatlar", href: "/admin/residents", icon: Users },
  { name: "Duyuru Yönetimi", href: "/admin/announcements", icon: Megaphone },
  { name: "Arıza & Talepler", href: "/admin/requests", icon: Wrench },
  { name: "Platform Destek", href: "/admin/destek", icon: LifeBuoy, siteManagerOnly: true },
  { name: "Site Ayarları", href: "/admin/settings", icon: Settings },
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
    <div className="flex h-screen bg-rose-50/10 dark:bg-[#0b0f19] flex-col sm:flex-row transition-colors duration-300">
      <PresenceHeartbeat />
      <aside className="hidden sm:flex flex-col w-64 border-r border-rose-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-full p-4 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-4 mb-6 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="h-11 w-11 rounded-2xl bg-white dark:bg-zinc-950 ring-1 ring-zinc-200/80 dark:ring-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
            <SiteLogo width={40} height={40} className="h-9 w-9" alt="" />
          </div>
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
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-rose-50 dark:hover:bg-zinc-800 hover:text-rose-600 dark:hover:text-rose-400"
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
          <button
            type="button"
            onClick={() => {
              document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              localStorage.removeItem("user");
              router.push("/login");
            }}
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 font-bold hover:underline"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto pb-20 sm:pb-0">
        <div className="sm:hidden flex items-center justify-between p-4 border-b border-rose-200/50 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 sticky top-0 z-10">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-white dark:bg-zinc-950 ring-1 ring-zinc-200/80 dark:ring-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
              <SiteLogo width={32} height={32} className="h-7 w-7" alt="" />
            </div>
            <h1 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 truncate">{SITE_BRAND_NAME}</h1>
          </div>
          <ThemeToggle />
        </div>
        <div className="h-full">{children}</div>
      </main>

      <nav className="sm:hidden fixed bottom-0 w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-around pb-safe z-50">
        {menuItems.map((item) => {
          const active = isActive(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-3 px-1 flex-1 transition-colors ${
                active ? "text-rose-600 dark:text-rose-400" : "text-zinc-400 dark:text-zinc-500"
              }`}
            >
              <item.icon className="h-5.5 w-5.5" />
              <span className="text-[9px] font-semibold">{item.name.split(" ")[0]}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
