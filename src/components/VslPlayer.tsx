"use client";

import { forwardRef, useCallback, useEffect, useRef } from "react";

const VISITOR_KEY = "bvo_vid";

// Jalons de progression mesurés (en fraction de la durée).
const MILESTONES: { frac: number; type: "p25" | "p50" | "p75" | "p100" }[] = [
  { frac: 0.25, type: "p25" },
  { frac: 0.5, type: "p50" },
  { frac: 0.75, type: "p75" },
  { frac: 0.95, type: "p100" }, // 95 % = "regardé jusqu'au bout" (génériques/fin ignorés)
];

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    // localStorage indisponible : id éphémère (le funnel comptera ce visiteur,
    // mais sans dédup entre rechargements).
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

type Props = {
  page: "vsl" | "vsl-prive";
} & React.VideoHTMLAttributes<HTMLVideoElement>;

// Lecteur vidéo natif instrumenté : émet play / 25 / 50 / 75 / 100 % vers
// /api/vsl-event (sendBeacon). Partagé par /vsl et /vsl-prive.
const VslPlayer = forwardRef<HTMLVideoElement, Props>(function VslPlayer(
  { page, ...videoProps },
  ref
) {
  const localRef = useRef<HTMLVideoElement | null>(null);
  // Jalons déjà envoyés pour cette lecture (évite les doublons via timeupdate).
  const sent = useRef<Set<string>>(new Set());

  const setRef = useCallback(
    (node: HTMLVideoElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLVideoElement | null>).current = node;
    },
    [ref]
  );

  const track = useCallback(
    (type: string, video: HTMLVideoElement) => {
      if (sent.current.has(type)) return;
      sent.current.add(type);
      const payload = JSON.stringify({
        visitorId: getVisitorId(),
        page,
        type,
        positionSec: Number.isFinite(video.currentTime) ? video.currentTime : null,
        durationSec: Number.isFinite(video.duration) ? video.duration : null,
      });
      try {
        const blob = new Blob([payload], { type: "application/json" });
        if (navigator.sendBeacon?.("/api/vsl-event", blob)) return;
      } catch {
        /* sendBeacon indisponible : on tombe sur fetch keepalive */
      }
      fetch("/api/vsl-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    },
    [page]
  );

  useEffect(() => {
    const video = localRef.current;
    if (!video) return;

    const onPlay = () => track("play", video);
    const onTimeUpdate = () => {
      const d = video.duration;
      if (!Number.isFinite(d) || d <= 0) return;
      const frac = video.currentTime / d;
      for (const m of MILESTONES) {
        if (frac >= m.frac) track(m.type, video);
      }
    };
    const onEnded = () => track("p100", video);

    video.addEventListener("play", onPlay);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
  }, [track]);

  return (
    <video ref={setRef} {...videoProps}>
      Votre navigateur ne supporte pas la lecture vidéo.
    </video>
  );
});

export default VslPlayer;
