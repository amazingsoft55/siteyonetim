"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import {
  type AppDownloadVariant,
  type DownloadPlatform,
  getAppDownloadUrl,
} from "@/lib/app-download-links";
import { detectClientPlatform, isIosSafari } from "@/lib/detect-platform";
import {
  getDeferredInstallPrompt,
  isAndroidInAppBrowser,
  isStandaloneDisplay,
  subscribeDeferredInstall,
  triggerInstallPrompt,
} from "@/lib/pwa-install";
import { InstallIosSheet } from "@/components/InstallIosSheet";
import { InstallAndroidSheet, type AndroidInstallMode } from "@/components/InstallAndroidSheet";

const APP_NAMES: Record<AppDownloadVariant, string> = {
  site: "Site Yönetim",
  "super-admin": "SY Süper",
};

function storePlatform(client: ReturnType<typeof detectClientPlatform>): DownloadPlatform {
  if (client === "ios") return "ios";
  if (client === "android") return "android";
  return "windows";
}

/** Tek dokunuşla kur — Android/PC’de sistem penceresi veya adım adım rehber. */
export function AppDownloadButtons({
  variant,
  compact,
}: {
  variant: AppDownloadVariant;
  compact?: boolean;
}) {
  const [ready, setReady] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [iosOpen, setIosOpen] = React.useState(false);
  const [androidOpen, setAndroidOpen] = React.useState(false);
  const [androidWaiting, setAndroidWaiting] = React.useState(false);
  const [androidMode, setAndroidMode] = React.useState<AndroidInstallMode>("manual");
  const [client, setClient] = React.useState<ReturnType<typeof detectClientPlatform>>("unknown");
  const [safariOk, setSafariOk] = React.useState(true);
  const [pageUrl, setPageUrl] = React.useState("");

  React.useEffect(() => {
    const ua = navigator.userAgent;
    setClient(detectClientPlatform(ua, navigator.maxTouchPoints));
    setSafariOk(isIosSafari(ua));
    setPageUrl(window.location.href);
    setReady(getDeferredInstallPrompt() !== null);

    return subscribeDeferredInstall(() => {
      setReady(true);
      setAndroidWaiting(false);
    });
  }, []);

  const appName = APP_NAMES[variant];

  const openStoreIfAny = React.useCallback((): boolean => {
    const platform = storePlatform(client);
    const url = getAppDownloadUrl(variant, platform);
    if (!url) return false;
    window.location.href = url;
    return true;
  }, [client, variant]);

  const tryAutoInstall = React.useCallback(async (): Promise<boolean> => {
    if (!getDeferredInstallPrompt()) return false;
    setBusy(true);
    try {
      const outcome = await triggerInstallPrompt();
      if (outcome === "accepted") {
        setReady(false);
        setAndroidOpen(false);
        return true;
      }
      return false;
    } finally {
      setBusy(false);
      setAndroidWaiting(false);
    }
  }, []);

  const openAndroidSheet = React.useCallback((mode: AndroidInstallMode) => {
    setAndroidMode(mode);
    setAndroidOpen(true);
  }, []);

  const handleInstall = React.useCallback(async () => {
    if (openStoreIfAny()) return;

    if (client === "ios") {
      setIosOpen(true);
      return;
    }

    if (isStandaloneDisplay()) {
      openAndroidSheet("standalone");
      return;
    }

    const ua = navigator.userAgent;

    if (client === "android") {
      if (isAndroidInAppBrowser(ua)) {
        openAndroidSheet("in-app");
        return;
      }

      if (getDeferredInstallPrompt() || ready) {
        setAndroidWaiting(true);
        openAndroidSheet("waiting");
        const ok = await tryAutoInstall();
        if (ok) return;
        openAndroidSheet("manual");
        return;
      }

      openAndroidSheet("manual");
      return;
    }

    if (client === "desktop") {
      if (getDeferredInstallPrompt()) {
        await tryAutoInstall();
        return;
      }
      openAndroidSheet("manual");
    }
  }, [client, openAndroidSheet, openStoreIfAny, ready, tryAutoInstall]);

  const label =
    client === "ios" ? "iPhone’a yükle"
    : client === "android" ? "Android’e yükle"
    : client === "desktop" ? "Bilgisayara yükle"
    : "Uygulamayı yükle";

  const sub =
    client === "ios" ? "2 dokunuş — rehber açılır"
    : client === "android" ? "Tek dokunuş — kurulum rehberi"
    : "Chrome / Edge ile kurulum";

  return (
    <>
      <div
        className={
          compact ?
            "space-y-3"
          : "rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 bg-zinc-50/80 dark:bg-zinc-900/40 p-4 space-y-3"
        }
      >
        {!compact && (
          <div className="text-center sm:text-left">
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              {variant === "site" ? "Site Yönetimi uygulaması" : "Süper yönetici uygulaması"}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{sub}</p>
          </div>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() => void handleInstall()}
          className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 px-5 text-base font-extrabold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/25 disabled:opacity-70 transition-transform active:scale-[0.98]"
        >
          {busy ?
            <Loader2 className="h-5 w-5 animate-spin" />
          : <Download className="h-5 w-5" />}
          {busy ? "Yükleniyor…" : label}
        </button>

        {ready && client === "android" && (
          <p className="text-[10px] text-center text-emerald-600 dark:text-emerald-400 font-semibold">
            Otomatik kurulum hazır
          </p>
        )}
      </div>

      <InstallIosSheet
        open={iosOpen}
        onClose={() => setIosOpen(false)}
        appName={appName}
        needsSafari={!safariOk}
      />

      <InstallAndroidSheet
        open={androidOpen}
        onClose={() => {
          setAndroidOpen(false);
          setAndroidWaiting(false);
        }}
        waiting={androidWaiting}
        mode={androidMode}
        pageUrl={pageUrl}
        onRetry={() => void tryAutoInstall()}
      />
    </>
  );
}
