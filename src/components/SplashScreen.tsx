"use client";

import * as React from "react";

/**
 * PWA splash screen — uygulama ilk açıldığında logo + loading gösterir.
 * 3 saniye sonra otomatik kapanır veya sayfa yüklendiğinde kapanır.
 */
export function SplashScreen() {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className={`pwa-splash ${!visible ? "hidden" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Site Yönetimi" className="pwa-splash-logo" />
      <p className="pwa-splash-text">Site Yönetimi</p>
      <div className="pwa-splash-loader" />
    </div>
  );
}
