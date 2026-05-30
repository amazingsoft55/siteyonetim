"use client";

import * as React from "react";
import { detectClientPlatform } from "@/lib/detect-platform";
import { Smartphone, Monitor, Download } from "lucide-react";

type Variant = "dark" | "light";

function GooglePlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="currentColor">
      <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 384 512" fill="currentColor">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 24 184.8 8 277.3c-14 78.4 11.5 158.5 57.5 212.8 18.5 22.1 39.7 47.5 68.5 46.5 27.5-.9 38.1-18 70.5-18 32.3 0 41.8 18.1 70.3 17.5 29.1-.5 47.3-20.5 65.8-47 21.2-30.8 29.9-59.7 30.5-61-.5-.2-58.5-22.5-58.8-89.1zM264.5 89.6c15.5-18.8 26.1-44.8 23.3-70.5-22.5 1-49.4 15-65.7 33.8-14.3 16.5-27 42.8-23.8 67.7 25.2 2 50.4-13.2 66.2-31z" />
    </svg>
  );
}

function WindowsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 448 512" fill="currentColor">
      <path d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8v127.5zm0-380.6v180.1H448V32L203.8 65.7z" />
    </svg>
  );
}

function StoreButtons({ variant = "dark" }: { variant?: Variant }) {
  const isDark = variant === "dark";

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      {/* Google Play */}
      <a
        href="#"
        className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl transition-all hover:scale-105 ${
          isDark
            ? "bg-black text-white hover:bg-zinc-800"
            : "bg-white text-black border border-zinc-300 hover:bg-zinc-50"
        }`}
      >
        <GooglePlayIcon className="h-7 w-7" />
        <div className="text-left">
          <p className="text-[10px] leading-tight opacity-80">GET IT ON</p>
          <p className="text-sm font-bold leading-tight">Google Play</p>
        </div>
      </a>

      {/* App Store */}
      <a
        href="#"
        className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl transition-all hover:scale-105 ${
          isDark
            ? "bg-black text-white hover:bg-zinc-800"
            : "bg-white text-black border border-zinc-300 hover:bg-zinc-50"
        }`}
      >
        <AppleIcon className="h-7 w-7" />
        <div className="text-left">
          <p className="text-[10px] leading-tight opacity-80">Download on the</p>
          <p className="text-sm font-bold leading-tight">App Store</p>
        </div>
      </a>
    </div>
  );
}

export function PlatformDownloadButtons({
  showTitle = true,
  variant = "dark",
}: {
  showTitle?: boolean;
  variant?: Variant;
}) {
  const [client, setClient] = React.useState<string>("unknown");

  React.useEffect(() => {
    setClient(detectClientPlatform(navigator.userAgent, navigator.maxTouchPoints));
  }, []);

  const isMobile = client === "android" || client === "ios";

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="text-center">
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            Hemen indirin
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Platformunuza uygun uygulamayı indirin
          </p>
        </div>
      )}

      {/* Tüm platformlar için mağaza butonları */}
      <StoreButtons variant={variant} />

      {/* Mobilde otomatik kurulum butonu */}
      {isMobile && (
        <div className="pt-2">
          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition-all"
          >
            <Download className="h-4 w-4" />
            {client === "android" ? "Android'de Aç" : "iPhone'da Aç"}
          </button>
        </div>
      )}

      {/* Desktop'ta masaüstü ikonu */}
      {!isMobile && client === "desktop" && (
        <div className="pt-2 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Monitor className="h-4 w-4" />
          <span>Chrome veya Edge ile tarayıcınızdan yükleyebilirsiniz</span>
        </div>
      )}
    </div>
  );
}
