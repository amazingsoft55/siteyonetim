"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import {
  type AppDownloadVariant,
  type DownloadPlatform,
  getAppDownloadUrl,
} from "@/lib/app-download-links";
import { detectClientPlatform, isIosSafari } from "@/lib/detect-platform";
import { InstallIosSheet } from "@/components/InstallIosSheet";
import { InstallAndroidSheet } from "@/components/InstallAndroidSheet";

const APP_NAMES: Record<AppDownloadVariant, string> = {
  site: "Site Yönetim",
  "super-admin": "SY Süper",
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function pathMatchesVariant(pathname: string, variant: AppDownloadVariant): boolean {
  if (variant === "super-admin") return pathname.startsWith("/super-admin");
  return !pathname.startsWith("/super-admin");
}

function storePlatform(client: ReturnType<typeof detectClientPlatform>): DownloadPlatform {
  if (client === "ios") return "ios";
  if (client === "android") return "android";
  return "windows";
}

/** Tek dokunuşla kur — Android/PC’de sistem penceresi, iPhone’da 2 adımlık rehber. */
export function AppDownloadButtons({
  variant,
  compact,
}: {
  variant: AppDownloadVariant;
  compact?: boolean;
}) {
  const deferredRef = React.useRef<BeforeInstallPromptEvent | null>(null);
  const waitIntervalRef = React.useRef<number | null>(null);
  const [ready, setReady] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [iosOpen, setIosOpen] = React.useState(false);
  const [androidOpen, setAndroidOpen] = React.useState(false);
  const [androidWaiting, setAndroidWaiting] = React.useState(false);
  const [client, setClient] = React.useState<ReturnType<typeof detectClientPlatform>>("unknown");
  const [safariOk, setSafariOk] = React.useState(true);

  React.useEffect(() => {
    const ua = navigator.userAgent;
    setClient(detectClientPlatform(ua, navigator.maxTouchPoints));
    setSafariOk(isIosSafari(ua));
  }, []);

  React.useEffect(() => {
    return () => {
      if (waitIntervalRef.current !== null) window.clearInterval(waitIntervalRef.current);
    };
  }, []);

  React.useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      if (!pathMatchesVariant(window.location.pathname, variant)) return;
      e.preventDefault();
      deferredRef.current = e as BeforeInstallPromptEvent;
      setReady(true);
      setAndroidWaiting(false);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, [variant]);

  const appName = APP_NAMES[variant];

  const runNativeInstall = React.useCallback(async (): Promise<boolean> => {
    const ev = deferredRef.current;
    if (!ev) return false;
    setBusy(true);
    try {
      await ev.prompt();
      const choice = await ev.userChoice;
      if (choice.outcome === "accepted") {
        deferredRef.current = null;
        setReady(false);
        return true;
      }
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const openStoreIfAny = React.useCallback((): boolean => {
    const platform = storePlatform(client);
    const url = getAppDownloadUrl(variant, platform);
    if (!url) return false;
    window.location.href = url;
    return true;
  }, [client, variant]);

  const handleInstall = React.useCallback(async () => {
    if (openStoreIfAny()) return;

    if (client === "ios") {
      setIosOpen(true);
      return;
    }

    if (ready) {
      await runNativeInstall();
      return;
    }

    if (client === "android" || client === "desktop") {
      if (waitIntervalRef.current !== null) window.clearInterval(waitIntervalRef.current);
      setAndroidWaiting(true);
      setAndroidOpen(true);
      const deadline = Date.now() + 4000;
      waitIntervalRef.current = window.setInterval(async () => {
        if (deferredRef.current) {
          if (waitIntervalRef.current !== null) window.clearInterval(waitIntervalRef.current);
          waitIntervalRef.current = null;
          setAndroidWaiting(false);
          const ok = await runNativeInstall();
          if (ok) setAndroidOpen(false);
          return;
        }
        if (Date.now() > deadline) {
          if (waitIntervalRef.current !== null) window.clearInterval(waitIntervalRef.current);
          waitIntervalRef.current = null;
          setAndroidWaiting(false);
        }
      }, 200);
    }
  }, [client, openStoreIfAny, ready, runNativeInstall]);

  const label =
    client === "ios" ? "iPhone’a yükle"
    : client === "android" ? "Android’e yükle"
    : client === "desktop" ? "Bilgisayara yükle"
    : "Uygulamayı yükle";

  const sub =
    ready ? "Tek dokunuş — kurulum penceresi açılır"
    : client === "ios" ? "2 dokunuş — rehber açılır"
    : "Chrome / Edge ile tek dokunuş";

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

        {ready && client !== "ios" && (
          <p className="text-[10px] text-center text-emerald-600 dark:text-emerald-400 font-semibold">
            Kurulum hazır — düğmeye basın
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
        onRetry={() => void handleInstall()}
      />
    </>
  );
}
