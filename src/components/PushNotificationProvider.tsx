"use client";

import * as React from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) return;

    let cancelled = false;

    async function init() {
      try {
        // Zaten izin verilmiş mi kontrol et
        const permission = await Notification.requestPermission();
        if (permission !== "granted" || cancelled) return;

        // Service worker'ın hazır olmasını bekle
        const reg = await navigator.serviceWorker.ready;

        // VAPID public key al
        const keyRes = await fetch("/api/push/vapid-key", { credentials: "include" });
        if (!keyRes.ok) return;
        const keyData = await keyRes.json() as { publicKey?: string };
        const publicKey = keyData.publicKey;
        if (!publicKey || cancelled) return;

        // Mevcut aboneliği kontrol et
        const existingSub = await reg.pushManager.getSubscription();

        if (existingSub) {
          // Mevcut aboneliği sunucuya kaydet
          const subJson = existingSub.toJSON();
          await fetch("/api/push/subscribe", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              endpoint: existingSub.endpoint,
              p256dh: subJson.keys?.p256dh,
              auth: subJson.keys?.auth,
            }),
          });
          return;
        }

        // Yeni abonelik oluştur
        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        const subJson = subscription.toJSON();
        await fetch("/api/push/subscribe", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            p256dh: subJson.keys?.p256dh,
            auth: subJson.keys?.auth,
          }),
        });
      } catch {
        // Push notification başarısızsa sessizce devam et
      }
    }

    // Sayfa yüklendiğinde 2 saniye bekle, sonra dene
    const timer = setTimeout(init, 2000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  return <>{children}</>;
}
