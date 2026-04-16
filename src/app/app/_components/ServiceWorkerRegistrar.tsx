"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }
    navigator.serviceWorker
      .register("/app/sw.js", { scope: "/app/" })
      .catch((err) => console.warn("[SW] registration failed:", err));
  }, []);

  return null;
}
