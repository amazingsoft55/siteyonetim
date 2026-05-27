/** PWA: ana ekrana ekleme ve güncelleme için minimal service worker (ağ öncelikli). */
const CACHE = "siteyonetim-shell-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(["/logo.png", "/manifest.json", "/manifest-super-admin.json"])),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((r) => r || caches.match("/logo.png"))),
  );
});
