"use client";

import * as React from "react";
import { Chrome, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onRetry: () => void;
  waiting: boolean;
};

export function InstallAndroidSheet({ open, onClose, onRetry, waiting }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button type="button" className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-label="Kapat" onClick={onClose} />
      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-2xl p-6 pb-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="pt-2 text-center">
          <Chrome className="h-10 w-10 mx-auto text-emerald-600" />
          <h2 className="mt-3 text-lg font-extrabold">Android’e yükle</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {waiting ?
              "Kurulum penceresi hazırlanıyor…"
            : "Kurulum penceresi açılmadıysa Chrome ile bu sayfayı açın ve tekrar deneyin."}
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            disabled={waiting}
            onClick={onRetry}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-bold"
          >
            {waiting ? "Bekleyin…" : "Tekrar dene"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-sm font-bold"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
