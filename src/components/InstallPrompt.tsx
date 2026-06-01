"use client";

import * as React from "react";
import { X } from "lucide-react";
import { isStandaloneDisplay } from "@/lib/pwa-install";

export function InstallPrompt() {
  const [show, setShow] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(true);
  const promptRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandaloneDisplay()) return;
    if (localStorage.getItem("pwa-install-dismissed") === "1") return;

    function handler(e: Event) {
      e.preventDefault();
      promptRef.current = e;
      setTimeout(() => setShow(true), 2000);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!promptRef.current) return;
    await promptRef.current.prompt();
    const choice = await promptRef.current.userChoice;
    if (choice.outcome === "accepted") {
      setShow(false);
      localStorage.setItem("pwa-install-dismissed", "1");
    }
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "1");
  };

  if (!show || dismissed) return null;

  return (
    <div className="pwa-install-banner">
      <div className="pwa-install-banner-content">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" className="pwa-install-banner-icon" />
        <div className="pwa-install-banner-text">
          <p className="pwa-install-banner-title">{"Site Yönetimi'ni Yükle"}</p>
          <p className="pwa-install-banner-desc">Ana ekrana ekle — daha hızlı eriş</p>
        </div>
        <div className="pwa-install-banner-actions">
          <button type="button" onClick={handleInstall} className="pwa-install-btn pwa-install-btn-primary">
            Yükle
          </button>
          <button type="button" onClick={handleDismiss} className="pwa-install-btn pwa-install-btn-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
