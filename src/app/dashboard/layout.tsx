"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PresenceHeartbeat } from "@/components/PresenceHeartbeat";
import { Home, CreditCard, Megaphone, Wrench, User, LogOut } from "lucide-react";

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
    } catch {
      /* ignore */
    }
  }, []);

  // Protect route
  React.useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
    }
  }, [router]);

  const isActive = (path: string) => pathname === path;

  const menuItems = [
    { name: "Ana Sayfa", href: "/dashboard", icon: Home },
    { name: "Aidat & Ödemeler", href: "/dashboard/payments", icon: CreditCard },
    { name: "Duyurular", href: "/dashboard/announcements", icon: Megaphone },
    { name: "Taleplerim", href: "/dashboard/requests", icon: Wrench },
  ];

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-[#0b0f19] flex-col sm:flex-row transition-colors duration-300">
      <PresenceHeartbeat />
      {/* Sidebar for Desktop */}
      <aside className="hidden sm:flex flex-col w-64 border-r border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-full p-4">
        <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{asideName}</p>
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{asideMeta}</p>
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
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200"
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
            onClick={() => {
              localStorage.removeItem("user");
              router.push("/login");
            }}
            className="flex items-center gap-1.5 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-semibold hover:underline"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 sm:pb-0">
        <div className="sm:hidden flex items-center justify-between p-4 border-b border-zinc-200/60 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Home className="h-4 w-4" />
            </div>
            <span className="text-md font-bold text-zinc-950 dark:text-zinc-50">Sakin Paneli</span>
          </div>
          <ThemeToggle />
        </div>
        <div className="h-full">
          {children}
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="sm:hidden fixed bottom-0 w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-around pb-safe z-50">
        {menuItems.map((item) => {
          const active = isActive(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-3 px-2 flex-1 transition-colors ${
                active ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500"
              }`}
            >
              <item.icon className="h-5.5 w-5.5" />
              <span className="text-[10px] font-semibold">{item.name.split(" ")[0]}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
