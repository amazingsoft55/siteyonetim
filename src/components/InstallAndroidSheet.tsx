"use client";

import * as React from "react";
import { Chrome, MoreVertical, Smartphone, X } from "lucide-react";

export type AndroidInstallMode = "waiting" | "manual" | "in-app" | "standalone";

type Props = {
  open: boolean;
  onClose: () => void;
  onRetry: () => void;
  waiting: boolean;
  mode: AndroidInstallMode;
  pageUrl: string;
};

function openInChrome(url: string) {
  try {
    const path = url.replace(/^https?:\/\//, "");
    window.location.href =
      `intent://${path}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export function InstallAndroidSheet({ open, onClose, onRetry, waiting, mode, pageUrl }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button type="button" className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-label="Kapat" onClick={onClose} />
      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-2xl p-6 pb-8 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="pt-2 text-center">
          <Smartphone className="h-10 w-10 mx-auto text-emerald-600" />
          <h2 className="mt-3 text-lg font-extrabold">Android’e yükle</h2>
        </div>

        {mode === "standalone" && (
          <p className="mt-4 text-sm text-center text-emerald-700 dark:text-emerald-300 font-semibold">
            Uygulama zaten yüklü görünüyor. Ana ekrandaki <strong>Site Yönetim</strong> simgesinden açabilirsiniz.
          </p>
        )}

        {mode === "in-app" && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
              WhatsApp, Instagram vb. içindeki tarayıcıda kurulum çalışmaz. Önce{" "}
              <strong>Chrome</strong> ile açın.
            </p>
            <button
              type="button"
              onClick={() => openInChrome(pageUrl)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold"
            >
              <Chrome className="h-4 w-4" />
              Chrome’da aç
            </button>
          </div>
        )}

        {(mode === "manual" || mode === "waiting") && (
          <div className="mt-5 space-y-3">
            {waiting ?
              <p className="text-sm text-center text-zinc-500">Kurulum penceresi deneniyor…</p>
            : <p className="text-sm text-center text-zinc-600 dark:text-zinc-400">
                Chrome’da 2 adımda kurun (otomatik pencere gelmezse bu yöntem her zaman çalışır):
              </p>
            }
            <ol className="space-y-3">
              <li className="flex gap-3 items-start rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-sm font-black">
                  1
                </span>
                <div className="text-left text-sm">
                  <p className="font-bold flex items-center gap-1">
                    <MoreVertical className="h-4 w-4" /> Sağ üstteki menü (⋮)
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">Chrome’da üç nokta menüsünü açın</p>
                </div>
              </li>
              <li className="flex gap-3 items-start rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-sm font-black">
                  2
                </span>
                <div className="text-left text-sm">
                  <p className="font-bold">Uygulamayı yükle</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    veya <strong>Ana ekrana ekle</strong> → <strong>Yükle</strong>. Ad:{" "}
                    <strong>Site Yönetim</strong>
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2">
          {mode !== "standalone" && mode !== "in-app" && (
            <button
              type="button"
              disabled={waiting}
              onClick={onRetry}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-bold"
            >
              {waiting ? "Bekleyin…" : "Otomatik kurulumu dene"}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-sm font-bold"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
}
