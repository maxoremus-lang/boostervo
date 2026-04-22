"use client";

import { useEffect, useRef, useState } from "react";

type CallStatus =
  | "initializing"   // création du Device, requête token
  | "ready"          // Device prêt, on va connecter
  | "ringing"        // appel sortant en cours, en attente du décroché prospect
  | "in_progress"    // prospect décroché, conversation
  | "ended"          // appel terminé proprement
  | "error";         // échec (permissions micro, réseau, etc.)

export type CallScreenProps = {
  prospectId: string;
  prospectPhone: string;
  prospectName?: string | null;
  prospectVehicle?: string | null;
  prospectPrice?: number | null;
  prospectNotes?: string | null;
  onClose: () => void;
};

/**
 * Modal plein écran qui gère un appel sortant via Twilio Voice SDK (WebRTC).
 *
 * Flow :
 *   1. Monte : requête /api/twilio/token, instancie Device
 *   2. Device prêt : Device.connect({ params: { To, prospectId } })
 *   3. Twilio appelle /api/webhooks/twilio/voice-app qui retourne le TwiML Dial
 *   4. Le prospect décroche ou non → events "accept", "disconnect", "error"
 *   5. À la fin : cleanup Device, ferme le modal
 */
export default function CallScreen({
  prospectId,
  prospectPhone,
  prospectName,
  prospectVehicle,
  prospectPrice,
  prospectNotes,
  onClose,
}: CallScreenProps) {
  const [status, setStatus] = useState<CallStatus>("initializing");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [muted, setMuted] = useState(false);

  // Références stables pour éviter les re-render du SDK
  const deviceRef = useRef<any>(null);
  const callRef = useRef<any>(null);
  const answeredAtRef = useRef<number | null>(null);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Initialisation Device + connexion ---
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Récupère le token d'accès
        const res = await fetch("/api/twilio/token", { method: "POST" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || `Token HTTP ${res.status}`);
        }
        const { token } = await res.json();
        if (cancelled) return;

        // Import dynamique pour éviter le SSR
        const { Device } = await import("@twilio/voice-sdk");
        const device = new Device(token, {
          codecPreferences: ["opus", "pcmu"] as any,
          logLevel: "warn" as any,
        });
        deviceRef.current = device;

        device.on("error", (err: any) => {
          if (cancelled) return;
          console.error("[CallScreen] Device error", err);
          setStatus("error");
          setErrorMsg(err?.message || "Erreur inattendue");
        });

        setStatus("ready");

        // Lance l'appel
        const call = await device.connect({
          params: { To: prospectPhone, prospectId },
        });
        if (cancelled) {
          call.disconnect();
          return;
        }
        callRef.current = call;
        setStatus("ringing");

        call.on("accept", () => {
          if (cancelled) return;
          answeredAtRef.current = Date.now();
          setStatus("in_progress");
          tickerRef.current = setInterval(() => {
            if (answeredAtRef.current) {
              setElapsedSec(Math.floor((Date.now() - answeredAtRef.current) / 1000));
            }
          }, 500);
        });

        call.on("disconnect", () => {
          if (cancelled) return;
          setStatus("ended");
          if (tickerRef.current) clearInterval(tickerRef.current);
          // Ferme automatiquement après un court délai pour laisser voir le récap
          setTimeout(() => onClose(), 1500);
        });

        call.on("error", (err: any) => {
          if (cancelled) return;
          console.error("[CallScreen] Call error", err);
          setStatus("error");
          setErrorMsg(err?.message || "Erreur pendant l'appel");
        });
      } catch (e: any) {
        if (cancelled) return;
        console.error("[CallScreen] Init error", e);
        setStatus("error");
        const parts = [
          e?.name,
          e?.code,
          e?.message,
        ].filter(Boolean);
        let detail = parts.join(" · ");
        if (!detail) {
          try { detail = typeof e === "string" ? e : JSON.stringify(e); } catch { detail = String(e); }
        }
        setErrorMsg(detail || "Impossible d'initialiser l'appel (erreur inconnue)");
      }
    })();

    return () => {
      cancelled = true;
      if (tickerRef.current) clearInterval(tickerRef.current);
      try { callRef.current?.disconnect?.(); } catch {}
      try { deviceRef.current?.destroy?.(); } catch {}
    };
  }, [prospectId, prospectPhone, onClose]);

  const hangUp = () => {
    try { callRef.current?.disconnect?.(); } catch {}
  };

  const toggleMute = () => {
    try {
      const newMuted = !muted;
      callRef.current?.mute?.(newMuted);
      setMuted(newMuted);
    } catch {}
  };

  const statusLabel: Record<CallStatus, string> = {
    initializing: "Initialisation…",
    ready: "Connexion…",
    ringing: "La ligne sonne…",
    in_progress: "En communication",
    ended: "Appel terminé",
    error: "Erreur",
  };

  const initials = prospectName
    ? prospectName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const formattedElapsed = (() => {
    const m = Math.floor(elapsedSec / 60);
    const s = elapsedSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  })();

  return (
    <div className="fixed inset-0 z-50 bg-bleu text-white flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 text-center">
        <p className="text-xs uppercase tracking-wider opacity-80 font-bold">
          {statusLabel[status]}
        </p>
        {status === "in_progress" && (
          <p className="text-2xl font-nunito font-extrabold mt-1">{formattedElapsed}</p>
        )}
      </div>

      {/* Avatar + infos prospect */}
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <div className="w-28 h-28 rounded-full bg-white/15 flex items-center justify-center mb-4">
          <span className="text-4xl font-nunito font-black">{initials}</span>
        </div>
        <p className="text-xl font-nunito font-extrabold text-center">
          {prospectName || prospectPhone}
        </p>
        {prospectName && <p className="text-sm opacity-75 mt-1">{prospectPhone}</p>}
        {prospectVehicle && (
          <p className="text-sm opacity-90 mt-4 text-center">
            {prospectVehicle}
            {prospectPrice != null && ` · ${prospectPrice.toLocaleString("fr-FR")} €`}
          </p>
        )}
        {prospectNotes && (
          <p className="text-xs opacity-75 mt-3 text-center max-w-xs italic">
            « {prospectNotes} »
          </p>
        )}

        {/* Indicateur sonnerie */}
        {status === "ringing" && (
          <div className="flex items-center gap-2 mt-8">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:200ms]"></span>
            <span className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:400ms]"></span>
          </div>
        )}

        {status === "error" && errorMsg && (
          <p className="mt-8 text-sm text-red-200 text-center max-w-xs">{errorMsg}</p>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-8 pt-4 flex items-center justify-center gap-8">
        {status === "in_progress" && (
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center ${
              muted ? "bg-white text-bleu" : "bg-white/20 text-white"
            }`}
            aria-label={muted ? "Réactiver le micro" : "Couper le micro"}
          >
            {muted ? "🎙️" : "🔇"}
          </button>
        )}
        {(status === "ringing" || status === "in_progress") && (
          <button
            onClick={hangUp}
            className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center active:bg-red-700"
            aria-label="Raccrocher"
          >
            <svg className="w-7 h-7 text-white rotate-[135deg]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </button>
        )}
        {(status === "error" || status === "ended") && (
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white text-bleu font-bold rounded-xl"
          >
            Fermer
          </button>
        )}
      </div>
    </div>
  );
}
