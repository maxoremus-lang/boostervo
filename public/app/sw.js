// BoosterVO Rappels · Service Worker (MVP)
// - Cache app shell pour accès hors-ligne basique
// - À étendre avec Web Push quand le backend sera prêt

const CACHE_NAME = "boostervo-rappels-v1";
const APP_SHELL = [
  "/app/manifest.json",
  "/app/icon-192.png",
  "/app/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Ne pas toucher les requêtes API / Next.js internes
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/")) {
    return;
  }
  // Stratégie : network-first, fallback sur cache si offline
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // Cache les ressources statiques /app/*
        if (url.pathname.startsWith("/app/") && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

// Préparation Web Push (à activer quand VAPID configuré côté backend)
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : { title: "BoosterVO", body: "Nouveau rappel" };
  event.waitUntil(
    self.registration.showNotification(data.title || "BoosterVO", {
      body: data.body,
      icon: "/app/icon-192.png",
      badge: "/app/icon-192.png",
      data: data.url ? { url: data.url } : undefined,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/app/dashboard";
  event.waitUntil(self.clients.openWindow(target));
});
