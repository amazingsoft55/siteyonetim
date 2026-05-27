"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";
import { SITE_BRAND_NAME } from "@/lib/brand";

type Props = {
  title: string;
  subtitle?: React.ReactNode;
  backHref?: string;
  actions?: React.ReactNode;
};

export function SuperAdminTopBar({ title, subtitle, backHref, actions }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/60 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl shadow-sm shadow-zinc-900/5">
      <div className="max-w-7xl mx-auto flex min-h-[4.25rem] items-center justify-between gap-4 px-4 sm:px-6 py-2">
        <div className="flex items-center gap-3 min-w-0">
          {backHref ? (
            <Link
              href={backHref}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Panele dön"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          ) : null}
          <Link
            href="/super-admin"
            className="flex items-center gap-3 min-w-0 group shrink-0"
          >
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-200/90 dark:ring-zinc-700/80 shadow-sm overflow-hidden shrink-0">
              <SiteLogo width={44} height={44} className="h-10 w-10 sm:h-11 sm:w-11" alt="" />
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 leading-none">
                {SITE_BRAND_NAME}
              </p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Süper yönetici</p>
            </div>
          </Link>
          <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 shrink-0 hidden sm:block" aria-hidden />
          <div className="min-w-0 pl-0 sm:pl-1">
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight truncate text-zinc-950 dark:text-zinc-50">
              {title}
            </h1>
            {subtitle ? (
              <div className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">{subtitle}</div>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end shrink-0">{actions}</div> : null}
      </div>
    </header>
  );
}
