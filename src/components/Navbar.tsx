"use client";

import Link from "next/link";
import { SiteLogo } from "@/components/SiteLogo";
import { useState } from "react";
import { Menu, X, ChevronRight, UserPlus, LogIn } from "lucide-react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/ozellikler", label: "Özellikler" },
  { href: "/fiyatlandirma", label: "Fiyatlandırma" },
  { href: "/destek", label: "Destek" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="flex items-center justify-center h-10 w-10 shrink-0 rounded-xl shadow-xs overflow-hidden bg-white ring-1 ring-slate-200 group-hover:scale-105 transition-transform">
            <SiteLogo width={36} height={36} rounded className="rounded-md" alt="Site Yönetimi logosu" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 leading-none">
              Site Yönetimi
            </span>
            <span className="text-[11px] text-slate-600 font-medium leading-tight mt-0.5">
              Dijital Apartman &amp; Tesis
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "text-indigo-600 bg-indigo-50/80 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Sağ grup (Giriş Yap & Hesap Aç) */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-all"
          >
            <LogIn className="h-4 w-4 text-slate-600" />
            <span>Giriş Yap</span>
          </Link>

          <Link
            href="/kayit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm hover:shadow transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>Hesap Aç</span>
          </Link>
        </div>

        {/* Mobil Menü Butonu */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/login"
            className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg"
          >
            Giriş
          </Link>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobil menü drawer */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-6 py-4 space-y-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "text-indigo-600 bg-indigo-50 font-semibold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4 opacity-40" />
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <Link
              href="/kayit"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
            >
              <UserPlus className="h-4 w-4" />
              Hesap Aç (Kayıt Ol)
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <LogIn className="h-4 w-4 text-slate-600" />
              Giriş Yap
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
