// BoosterVO Rappels · Service Worker
// - Cache app shell pour accès hors-ligne basique
// - Web Push + notificationclick pour routing vers la fiche du rappel

const CACHE_NAME = "boostervo-rappels-v4";
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
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/")) {
    return;
  }
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (url.pathname.startsWith("/app/") && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

// ===== Web Push =====
self.addEventListener("push", (event) => {
  let data = { title: "BoosterVO", body: "Nouvel appel manqué", url: "/app/rappels" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (err) {
    console.warn("[SW] push payload invalide", err);
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/app/icon-192.png",
      badge: "/app/icon-192.png",
      tag: data.tag || "boostervo-missed",
      renotify: true,
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/app/rappels";
  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      // Essayer de focuser un onglet déjà ouvert de l'app
      for (const client of allClients) {
        const url = new URL(client.url);
        if (url.pathname.startsWith("/app")) {
          // Naviguer l'onglet existant vers la cible puis lui donner le focus
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(target);
            } catch {
              /* certains navigateurs bloquent navigate cross-scope — fallback openWindow */
            }
          }
          return;
        }
      }
      // Aucun onglet ouvert → nouvelle fenêtre
      await self.clients.openWindow(target);
    })()
  );
});
