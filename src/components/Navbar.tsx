"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { PublicVisitBeacon } from "@/components/PublicVisitBeacon";
import Link from "next/link";
import { SiteLogo } from "@/components/SiteLogo";
import { useState } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/destek", label: "Destek" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/75 dark:bg-zinc-950/75 backdrop-blur-xl">
      <PublicVisitBeacon />
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center justify-center h-10 w-10 shrink-0 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-zinc-900 ring-1 ring-zinc-200/80 dark:ring-zinc-800">
            <SiteLogo width={36} height={36} rounded className="rounded-md" alt="Site Yönetimi logosu" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Site Yönetimi
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1 mr-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Sağ grup */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center justify-center gap-1 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-sm shadow-indigo-600/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Giriş Yap <ChevronRight className="h-3.5 w-3.5" />
          </Link>

          {/* Mobil hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="sm:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobil menü */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-zinc-200/60 dark:border-zinc-800/60 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl px-6 py-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {link.label}
                <ChevronRight className="h-4 w-4 opacity-40" />
              </Link>
            );
          })}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-colors"
            >
              Giriş Yap <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
