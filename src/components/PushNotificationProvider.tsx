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

    // localStorage ile persist ediyoruz — sayfa yenilense bile tekrar sormaz
    if (localStorage.getItem("push_subscribed") === "1") return;

    let cancelled = false;

    async function init() {
      try {
        // Notification izni yoksa bileşik açılışta sorma (sadece abonelik varsa atla)
        if (Notification.permission === "denied") return;

        // İzin yoksa kullanıcı etkileşiminden sonra sor (burada otomatik sormuyoruz)
        if (Notification.permission === "default") {
          // İlk ziyaret — izin iste
          const permission = await Notification.requestPermission();
          if (permission !== "granted" || cancelled) return;
        }

        const reg = await navigator.serviceWorker.ready;

        // Zaten abone miyiz?
        const existingSub = await reg.pushManager.getSubscription();
        if (existingSub) {
          // Abonelik var ama kayıtlı olmayabilir — sunucuya gönder
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
          }).catch(() => {});
          localStorage.setItem("push_subscribed", "1");
          return;
        }

        // VAPID public key al
        const keyRes = await fetch("/api/push/vapid-key", { credentials: "include" });
        if (!keyRes.ok) return;
        const keyData = (await keyRes.json()) as { publicKey?: string };
        const publicKey = keyData.publicKey;
        if (!publicKey || cancelled) return;

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

        localStorage.setItem("push_subscribed", "1");
      } catch {
        // sessiz
      }
    }

    const timer = setTimeout(init, 2000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  return <>{children}</>;
}
