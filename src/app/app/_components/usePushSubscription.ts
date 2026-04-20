"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * État du support / de la souscription Web Push côté navigateur.
 *
 * - unsupported : navigateur sans support Push API (ex: iOS < 16.4, ou non-installé sur iOS)
 * - needs-install-ios : Safari iOS mais l'app n'est pas installée sur l'écran d'accueil
 *   (sur iOS, la Push API n'est disponible que dans une PWA standalone)
 * - unregistered : SW pas encore prêt
 * - denied : l'utilisateur a refusé la permission (doit aller dans les réglages OS)
 * - disabled : permission granted mais pas de subscription active
 * - enabled : tout est branché et une subscription est en BDD
 */
export type PushState =
  | "loading"
  | "unsupported"
  | "needs-install-ios"
  | "unregistered"
  | "denied"
  | "disabled"
  | "enabled";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const b64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function detectState(): PushState | null {
  if (typeof window === "undefined") return "loading";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    // iOS Safari : PushManager n'est exposé que dans un contexte PWA standalone
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone =
      (window.matchMedia?.("(display-mode: standalone)").matches) ||
      (navigator as any).standalone === true;
    if (isIOS && !isStandalone) return "needs-install-ios";
    return "unsupported";
  }
  return null;
}

/**
 * Hook qui gère l'enrôlement Push Web pour le user connecté.
 * Expose l'état + enable()/disable() à brancher sur un toggle UI.
 */
export function usePushSubscription() {
  const [state, setState] = useState<PushState>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const initial = detectState();
    if (initial && initial !== "loading") {
      setState(initial);
      return;
    }

    try {
      const reg = await navigator.serviceWorker.getRegistration("/app/");
      if (!reg) {
        setState("unregistered");
        return;
      }
      if (Notification.permission === "denied") {
        setState("denied");
        return;
      }
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "enabled" : "disabled");
    } catch (e: any) {
      console.warn("[push] refresh error", e);
      setState("unsupported");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const enable = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      // Demande de permission (geste utilisateur requis sur iOS)
      const perm = await Notification.requestPermission();
      if (perm === "denied") {
        setState("denied");
        return;
      }
      if (perm !== "granted") {
        setState("disabled");
        return;
      }

      const reg =
        (await navigator.serviceWorker.getRegistration("/app/")) ||
        (await navigator.serviceWorker.ready);
      if (!reg) throw new Error("Service Worker indisponible");

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error("VAPID public key manquante");

      const sub =
        (await reg.pushManager.getSubscription()) ||
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
        }));

      // Envoi au serveur
      const res = await fetch("/api/push/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error(`Serveur: ${res.status}`);
      setState("enabled");
    } catch (e: any) {
      console.warn("[push] enable error", e);
      setError(e?.message || "Erreur activation");
      await refresh();
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  const disable = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/app/");
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (sub) {
        await fetch("/api/push/subscription", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {});
        await sub.unsubscribe().catch(() => {});
      }
      setState("disabled");
    } catch (e: any) {
      console.warn("[push] disable error", e);
      setError(e?.message || "Erreur désactivation");
      await refresh();
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  return { state, busy, error, enable, disable, refresh };
}
