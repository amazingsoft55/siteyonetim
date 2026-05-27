"use client";

import * as React from "react";
import Link from "next/link";
import { Monitor, Smartphone, Terminal } from "lucide-react";
import {
  type AppDownloadVariant,
  type DownloadPlatform,
  getAppDownloadUrl,
  mobilGuideHref,
} from "@/lib/app-download-links";

const TITLES: Record<AppDownloadVariant, string> = {
  site: "Site Yönetimi uygulamasını indir",
  "super-admin": "Süper yönetici uygulamasını indir",
};

const PLATFORMS: {
  id: DownloadPlatform;
  label: string;
  sub: string;
  icon: React.ReactNode;
  btnClass: string;
}[] = [
  {
    id: "ios",
    label: "iPhone / iPad",
    sub: "App Store",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="currentColor">
        <path d="M16.365 1.43c0 1.14-.467 2.226-1.177 3.036-.79.89-2.086 1.577-3.188 1.483-.14-1.09.48-2.247 1.22-3.023.84-.88 2.286-1.562 3.145-1.496zM20.5 17.1c-.622 1.394-.918 2.012-1.718 3.244-1.116 1.712-2.689 3.846-4.633 3.866-1.73.018-2.173-1.125-4.52-1.11-2.346.015-2.838 1.128-4.568 1.11-1.944-.02-3.422-2.02-4.538-3.732-3.108-4.755-3.436-10.32-1.515-13.276 1.372-2.192 3.546-3.482 5.587-3.482 2.08 0 3.387 1.125 5.105 1.125 1.667 0 2.683-1.125 5.08-1.125 1.806 0 3.716.984 5.08 2.676-4.465 2.436-3.743 8.785.7 10.504z" />
      </svg>
    ),
    btnClass:
      "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900",
  },
  {
    id: "android",
    label: "Android",
    sub: "Google Play / APK",
    icon: <Smartphone className="h-5 w-5" />,
    btnClass: "bg-emerald-600 hover:bg-emerald-500 text-white",
  },
  {
    id: "windows",
    label: "Windows",
    sub: "PC uygulaması",
    icon: <Monitor className="h-5 w-5" />,
    btnClass: "bg-sky-600 hover:bg-sky-500 text-white",
  },
  {
    id: "linux",
    label: "Linux",
    sub: "Masaüstü",
    icon: <Terminal className="h-5 w-5" />,
    btnClass: "bg-amber-700 hover:bg-amber-600 text-white",
  },
];

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function pathMatchesVariant(pathname: string, variant: AppDownloadVariant): boolean {
  if (variant === "super-admin") return pathname.startsWith("/super-admin");
  return !pathname.startsWith("/super-admin");
}

/** Apple, Android, Windows ve Linux için ayrı indir butonları */
export function AppDownloadButtons({
  variant,
  compact,
}: {
  variant: AppDownloadVariant;
  compact?: boolean;
}) {
  const [pwaInstall, setPwaInstall] = React.useState<(() => Promise<void>) | null>(null);
  const [onMatchingPath, setOnMatchingPath] = React.useState(true);

  React.useEffect(() => {
    const path = window.location.pathname;
    setOnMatchingPath(pathMatchesVariant(path, variant));
  }, [variant]);

  React.useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      const path = window.location.pathname;
      if (!pathMatchesVariant(path, variant)) return;

      e.preventDefault();
      const ev = e as BeforeInstallPromptEvent;
      setPwaInstall(() => async () => {
        await ev.prompt();
        void ev.userChoice;
      });
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, [variant]);

  const handleClick = async (platform: DownloadPlatform) => {
    const url = getAppDownloadUrl(variant, platform);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    if ((platform === "android" || platform === "windows" || platform === "linux") && pwaInstall && onMatchingPath) {
      await pwaInstall();
      return;
    }
  };

  return (
    <div
      className={
        compact ?
          "space-y-3"
        : "rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 bg-zinc-50/80 dark:bg-zinc-900/40 p-4 space-y-3"
      }
    >
      <div className={compact ? "text-center" : undefined}>
        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{TITLES[variant]}</p>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
          {variant === "site" ?
            "Sakin ve site yöneticileri için — girişten panele erişim."
          : "Yalnızca platform süper yöneticileri için ayrı uygulama."}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PLATFORMS.map((p) => {
          const url = getAppDownloadUrl(variant, p.id);
          const guide = mobilGuideHref(variant, p.id);
          const canPwa =
            !url &&
            pwaInstall &&
            onMatchingPath &&
            (p.id === "android" || p.id === "windows" || p.id === "linux");

          if (url || canPwa) {
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => void handleClick(p.id)}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-3 text-center text-xs font-bold transition-colors ${p.btnClass}`}
              >
                {p.icon}
                <span>{p.label}</span>
                <span className="text-[10px] font-semibold opacity-90">{canPwa ? "Bu cihaza kur" : p.sub}</span>
              </button>
            );
          }

          return (
            <Link
              key={p.id}
              href={guide}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-3 text-center text-xs font-bold transition-colors ${p.btnClass}`}
            >
              {p.icon}
              <span>{p.label}</span>
              <span className="text-[10px] font-semibold opacity-90">İndir / kur</span>
            </Link>
          );
        })}
      </div>
      {!compact && (
        <p className="text-[10px] text-center text-zinc-400 dark:text-zinc-500">
          <Link href="/mobil" className="underline hover:text-indigo-600 dark:hover:text-indigo-400">
            Tüm platformlar için kurulum rehberi
          </Link>
        </p>
      )}
    </div>
  );
}
