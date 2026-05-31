"use client";

import * as React from "react";
import { Download, Smartphone, Monitor } from "lucide-react";
import type { AppDownloadVariant } from "@/lib/app-download-links";
import { detectClientPlatform } from "@/lib/detect-platform";
import { getDeferredInstallPrompt, triggerInstallPrompt, isStandaloneDisplay } from "@/lib/pwa-install";

const APP_NAMES: Record<AppDownloadVariant, string> = {
  site: "Site Yönetim",
  "super-admin": "SY Süper",
};

export function AppDownloadButtons({ variant }: { variant: AppDownloadVariant; compact?: boolean }) {
  const [client, setClient] = React.useState<"ios" | "android" | "desktop" | "unknown">("unknown");
  const [installReady, setInstallReady] = React.useState(false);
  const [installing, setInstalling] = React.useState(false);
  const [installed, setInstalled] = React.useState(false);
  const [showGuide, setShowGuide] = React.useState<"ios" | "android" | null>(null);

  React.useEffect(() => {
    const ua = navigator.userAgent;
    setClient(detectClientPlatform(ua, navigator.maxTouchPoints));
    setInstallReady(getDeferredInstallPrompt() !== null);
  }, []);

  const handleAndroidInstall = async () => {
    // Otomatik PWA kurulumu dene
    if (installReady) {
      setInstalling(true);
      try {
        const result = await triggerInstallPrompt();
        if (result === "accepted") {
          setInstalled(true);
          setInstalling(false);
          return;
        }
      } catch {
        // sessiz
      }
      setInstalling(false);
    }
    // Kurulamıyorsa rehber göster
    setShowGuide("android");
  };

  const handleIosInstall = () => {
    setShowGuide("ios");
  };

  return (
    <div className="space-y-3">
      {/* Android Butonu */}
      <button
        type="button"
        onClick={handleAndroidInstall}
        disabled={installing || installed}
        className="w-full flex items-center gap-4 rounded-2xl py-4 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold shadow-lg shadow-emerald-600/25 disabled:opacity-70 transition-all active:scale-[0.98]"
      >
        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.523 2.363l1.071-1.835a.5.5 0 0 0-.868-.496l-1.1 1.905A8.495 8.495 0 0 0 12 1.5c-1.804 0-3.491.464-4.956 1.276L5.944.088a.5.5 0 0 0-.868.496l1.071 1.835C3.178 3.995 1 7.126 1 10.75c0 1.066.24 2.074.665 2.967L1 15v1a1 1 0 0 0 1 1h1v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1h1a1 1 0 0 0 1-1v-1l-.665-2.267A6.96 6.96 0 0 0 23 10.75c0-3.624-2.178-6.755-5.477-8.387zM7 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm10 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
          </svg>
        </div>
        <div className="text-left flex-1">
          <p className="text-sm font-black">Android&apos;e Yükle</p>
          <p className="text-[11px] font-medium text-emerald-100/80">
            {installed ? "Yüklendi!" : installReady ? "Tek dokunuşla kur" : "Rehber ile kur"}
          </p>
        </div>
        {!installed && <Download className="h-5 w-5 shrink-0" />}
      </button>

      {/* iPhone Butonu */}
      <button
        type="button"
        onClick={handleIosInstall}
        className="w-full flex items-center gap-4 rounded-2xl py-4 px-5 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-white font-extrabold shadow-lg shadow-zinc-900/25 transition-all active:scale-[0.98]"
      >
        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.04-3.19z"/>
          </svg>
        </div>
        <div className="text-left flex-1">
          <p className="text-sm font-black">iPhone&apos;a Yükle</p>
          <p className="text-[11px] font-medium text-zinc-400">Safari ile kurulum rehberi</p>
        </div>
        <Download className="h-5 w-5 shrink-0" />
      </button>

      {/* PC Butonu */}
      {client === "desktop" && (
        <button
          type="button"
          onClick={() => setShowGuide(showGuide === "android" ? null : "android")}
          className="w-full flex items-center gap-4 rounded-2xl py-4 px-5 bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600 text-zinc-900 dark:text-zinc-50 font-extrabold transition-all active:scale-[0.98]"
        >
          <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
            <Monitor className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-black">Bilgisayara Yükle</p>
            <p className="text-[11px] font-medium text-zinc-500">Chrome ile kurulum</p>
          </div>
          <Download className="h-5 w-5 shrink-0" />
        </button>
      )}

      {/* Android Rehber Modal */}
      {showGuide === "android" && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowGuide(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">Android Kurulum</h3>
              <button type="button" onClick={() => setShowGuide(null)} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <span className="text-zinc-400">✕</span>
              </button>
            </div>
            <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                <span className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <p>Chrome tarayıcısında bu sayfayı açın</p>
              </div>
              <div className="flex gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                <span className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <p>Adres çubuğunun yanındaki <strong>⋮ (üç nokta)</strong> menüsüne tıklayın</p>
              </div>
              <div className="flex gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                <span className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <p><strong>&quot;Ana ekrana ekle&quot;</strong> veya <strong>&quot;Yükle&quot;</strong> seçeneğine tıklayın</p>
              </div>
              <div className="flex gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                <span className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">4</span>
                <p><strong>&quot;Yükle&quot;</strong> butonuna basın — uygulama ana ekrana eklenir</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-xs text-emerald-700 dark:text-emerald-300 text-center font-semibold">
              Kurulumdan sonra uygulama doğrudan ana ekrandan açılabilir
            </div>
          </div>
        </div>
      )}

      {/* iOS Rehber Modal */}
      {showGuide === "ios" && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowGuide(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">iPhone Kurulum</h3>
              <button type="button" onClick={() => setShowGuide(null)} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <span className="text-zinc-400">✕</span>
              </button>
            </div>
            <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                <span className="h-6 w-6 rounded-full bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <p><strong>Safari</strong> tarayıcısında bu sayfayı açın (Chrome değil!)</p>
              </div>
              <div className="flex gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                <span className="h-6 w-6 rounded-full bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <p>Alt çubuktaki <strong>Paylaş</strong> butonuna (kare ok) tıklayın</p>
              </div>
              <div className="flex gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                <span className="h-6 w-6 rounded-full bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <p><strong>&quot;Ana Ekrana Ekle&quot;</strong> seçeneğine tıklayın</p>
              </div>
              <div className="flex gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                <span className="h-6 w-6 rounded-full bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-bold shrink-0">4</span>
                <p>Sağ üstteki <strong>&quot;Ekle&quot;</strong> butonuna basın</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 text-center font-semibold">
              Uygulama ana ekrana eklenir, doğrudan açılabilir
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
