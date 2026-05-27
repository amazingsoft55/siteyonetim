"use client";

import * as React from "react";
import { Share, X } from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";

type Props = {
  open: boolean;
  onClose: () => void;
  appName: string;
  needsSafari?: boolean;
};

export function InstallIosSheet({ open, onClose, appName, needsSafari }: Props) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-2xl p-6 pb-8 animate-in slide-in-from-bottom duration-300">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center pt-2">
          <SiteLogo width={56} height={56} className="h-14 w-14 rounded-2xl" alt="" />
          <h2 className="mt-4 text-lg font-extrabold text-zinc-900 dark:text-zinc-50">{appName}</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Ana ekrana ekleyin — 2 dokunuş</p>
        </div>

        {needsSafari ? (
          <div className="mt-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-4 text-sm text-amber-950 dark:text-amber-100">
            iPhone’da kurulum için sayfayı <strong>Safari</strong> ile açın. Adres çubuğundaki linki kopyalayıp Safari’ye
            yapıştırabilirsiniz.
          </div>
        ) : (
          <ol className="mt-6 space-y-4">
            <li className="flex gap-4 items-start rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-black">
                1
              </span>
              <div className="text-left">
                <p className="font-bold text-sm">Alttaki Paylaş düğmesine dokunun</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
                  <Share className="h-3.5 w-3.5" /> Safari’de ekranın altındaki kare ve ok simgesi
                </p>
              </div>
            </li>
            <li className="flex gap-4 items-start rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-black">
                2
              </span>
              <div className="text-left">
                <p className="font-bold text-sm">Ana Ekrana Ekle → Ekle</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Kısayol <strong>{appName}</strong> adıyla ana ekranınıza eklenir.
                </p>
              </div>
            </li>
          </ol>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold"
        >
          Tamam
        </button>
      </div>
    </div>
  );
}
