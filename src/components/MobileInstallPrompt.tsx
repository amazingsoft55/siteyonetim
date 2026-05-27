"use client";

import * as React from "react";
import { Smartphone, X, Share } from "lucide-react";

type Variant = "site" | "super-admin";

const COPY: Record<
  Variant,
  { title: string; iosHint: string; androidHint: string; dismissKey: string }
> = {
  site: {
    title: "Site Yönetimi mobil uygulaması",
    iosHint: "Safari’de Paylaş → Ana Ekrana Ekle",
    androidHint: "Chrome menü → Uygulamayı yükle / Ana ekrana ekle",
    dismissKey: "siteyonetim_pwa_dismiss_site",
  },
  "super-admin": {
    title: "Süper yönetici mobil uygulaması",
    iosHint: "Safari’de Paylaş → Ana Ekrana Ekle (bu sekmede /super-admin açıkken)",
    androidHint: "Chrome menü → Uygulamayı yükle",
    dismissKey: "siteyonetim_pwa_dismiss_super",
  },
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** Ana ekrana ekle / native store APK öncesi PWA kurulum kartı */
export function MobileInstallPrompt({ variant }: { variant: Variant }) {
  const copy = COPY[variant];
  const [visible, setVisible] = React.useState(false);
  const [deferred, setDeferred] = React.useState<{ prompt: () => Promise<void> } | null>(null);
  const [ios, setIos] = React.useState(false);

  React.useEffect(() => {
    if (isStandalone()) return;
    try {
      if (sessionStorage.getItem(copy.dismissKey) === "1") return;
    } catch {
      /* ignore */
    }
    setIos(isIos());
    setVisible(true);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      const ev = e as BeforeInstallPromptEvent;
      setDeferred({
        prompt: async () => {
          await ev.prompt();
          void ev.userChoice;
        },
      });
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, [copy.dismissKey]);

  const dismiss = () => {
    try {
      sessionStorage.setItem(copy.dismissKey, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/90 to-white dark:from-indigo-950/40 dark:to-zinc-900/80 p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{copy.title}</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Telefona kurun; tarayıcı sekmesi gibi değil, tam ekran uygulama gibi açılır.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {deferred ? (
        <button
          type="button"
          onClick={() => void deferred.prompt()}
          className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-2.5 transition-colors"
        >
          Uygulamayı yükle
        </button>
      ) : (
        <p className="text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-2 leading-relaxed">
          {ios ? <Share className="h-4 w-4 shrink-0 mt-0.5 text-indigo-600" /> : null}
          <span>{ios ? copy.iosHint : copy.androidHint}</span>
        </p>
      )}
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
