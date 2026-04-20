"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";

type SoundKey = "cloche" | "sonnette";

type Prefs = { soundEnabled: boolean; notificationSound: SoundKey };

type RingerContextValue = {
  prefs: Prefs;
  refreshPrefs: () => Promise<void>;
  updatePrefs: (patch: Partial<Prefs>) => Promise<void>;
  ringingProspectId: string | null;
  stopRinging: (prospectId?: string) => void;
  playPreview: (sound: SoundKey) => void;
};

const DEFAULT_PREFS: Prefs = { soundEnabled: true, notificationSound: "cloche" };

const RingerContext = createContext<RingerContextValue>({
  prefs: DEFAULT_PREFS,
  refreshPrefs: async () => {},
  updatePrefs: async () => {},
  ringingProspectId: null,
  stopRinging: () => {},
  playPreview: () => {},
});

export function useNotificationRinger() {
  return useContext(RingerContext);
}

const POLL_FOREGROUND_MS = 5_000;
const POLL_BACKGROUND_MS = 30_000;
const REPEAT_COUNT = 3;
const REPEAT_INTERVAL_MS = 10_000;

function soundUrl(key: SoundKey) {
  return `/sounds/${key}.mp3`;
}

export default function NotificationRingerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const authenticated = status === "authenticated";

  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [ringingProspectId, setRingingProspectId] = useState<string | null>(null);

  // Timestamp le plus récent d'un CallEvent vu lors du dernier poll.
  // Les events plus récents = nouveaux appels à signaler.
  const lastSeenTsRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ringTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prefsRef = useRef<Prefs>(DEFAULT_PREFS);
  const ringingIdRef = useRef<string | null>(null);

  useEffect(() => {
    prefsRef.current = prefs;
  }, [prefs]);

  useEffect(() => {
    ringingIdRef.current = ringingProspectId;
  }, [ringingProspectId]);

  // ========== Prefs ==========
  const refreshPrefs = useCallback(async () => {
    try {
      const res = await fetch("/api/me");
      if (!res.ok) return;
      const data = await res.json();
      const sound: SoundKey =
        data.notificationSound === "sonnette" ? "sonnette" : "cloche";
      setPrefs({
        soundEnabled: data.soundEnabled !== false,
        notificationSound: sound,
      });
    } catch {
      /* silencieux */
    }
  }, []);

  const updatePrefs = useCallback(
    async (patch: Partial<Prefs>) => {
      // Optimiste : on applique localement puis on pousse au serveur
      setPrefs((p) => ({ ...p, ...patch }));
      try {
        await fetch("/api/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
      } catch {
        /* rollback silencieux : on recharge */
        refreshPrefs();
      }
    },
    [refreshPrefs],
  );

  // ========== Playback ==========
  const playSoundOnce = useCallback((sound: SoundKey) => {
    try {
      // Recréer l'Audio à chaque play pour éviter les conflits de timing
      const a = new Audio(soundUrl(sound));
      a.volume = 1.0;
      audioRef.current = a;
      // play() peut renvoyer une promesse rejetée si autoplay bloqué
      a.play().catch(() => {
        /* bloqué par le navigateur (pas d'interaction utilisateur) */
      });
    } catch {
      /* silencieux */
    }
  }, []);

  const clearRingTimers = useCallback(() => {
    ringTimersRef.current.forEach((t) => clearTimeout(t));
    ringTimersRef.current = [];
  }, []);

  const stopRinging = useCallback(
    (prospectId?: string) => {
      // Si un prospectId est fourni, ne couper que si ça matche
      if (prospectId && ringingIdRef.current !== prospectId) return;
      clearRingTimers();
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch {
          /* silencieux */
        }
      }
      setRingingProspectId(null);
    },
    [clearRingTimers],
  );

  const startRinging = useCallback(
    (prospectId: string) => {
      // Si une séquence est déjà en cours, on ignore (spec: nouvelle alerte ignorée)
      if (ringingIdRef.current !== null) return;
      const sound = prefsRef.current.notificationSound;
      setRingingProspectId(prospectId);
      // Jouer immédiatement
      playSoundOnce(sound);
      // Puis répéter REPEAT_COUNT-1 fois toutes les REPEAT_INTERVAL_MS
      for (let i = 1; i < REPEAT_COUNT; i++) {
        const t = setTimeout(() => {
          if (ringingIdRef.current === prospectId) {
            playSoundOnce(sound);
          }
        }, i * REPEAT_INTERVAL_MS);
        ringTimersRef.current.push(t);
      }
      // Fin de séquence : libère le slot ~2s après le dernier son
      const endTimer = setTimeout(
        () => {
          if (ringingIdRef.current === prospectId) {
            setRingingProspectId(null);
            ringTimersRef.current = [];
          }
        },
        (REPEAT_COUNT - 1) * REPEAT_INTERVAL_MS + 3_000,
      );
      ringTimersRef.current.push(endTimer);
    },
    [playSoundOnce],
  );

  const playPreview = useCallback(
    (sound: SoundKey) => {
      // Pour l'écoute depuis le profil : coupe l'audio en cours puis joue
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {
          /* silencieux */
        }
      }
      playSoundOnce(sound);
    },
    [playSoundOnce],
  );

  // ========== Polling ==========
  useEffect(() => {
    if (!authenticated) return;
    refreshPrefs();
  }, [authenticated, refreshPrefs]);

  useEffect(() => {
    if (!authenticated) return;

    let cancelled = false;

    const computeMaxTs = (prospects: any[]): number | null => {
      let max: number | null = null;
      for (const p of prospects) {
        for (const ev of p.callEvents ?? []) {
          const ts = new Date(ev.at).getTime();
          if (!isNaN(ts) && (max === null || ts > max)) max = ts;
        }
      }
      return max;
    };

    const findFirstNewMissed = (
      prospects: any[],
      since: number,
    ): string | null => {
      // Parcourt tous les prospects et leurs events, retourne l'id du premier
      // prospect ayant un callEvent "missed" strictement plus récent que since.
      for (const p of prospects) {
        for (const ev of p.callEvents ?? []) {
          const ts = new Date(ev.at).getTime();
          if (!isNaN(ts) && ts > since && ev.type === "missed") {
            return p.id;
          }
        }
      }
      return null;
    };

    const tick = async () => {
      if (cancelled) return;
      try {
        const res = await fetch("/api/prospects", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          const prospects: any[] = json.prospects ?? [];
          const maxTs = computeMaxTs(prospects);

          if (!initializedRef.current) {
            // Premier tour : on ne sonne pas sur l'existant
            lastSeenTsRef.current = maxTs;
            initializedRef.current = true;
          } else {
            const since = lastSeenTsRef.current ?? 0;
            const newProspectId = findFirstNewMissed(prospects, since);
            if (newProspectId && prefsRef.current.soundEnabled) {
              startRinging(newProspectId);
            }
            if (maxTs !== null && (lastSeenTsRef.current === null || maxTs > lastSeenTsRef.current)) {
              lastSeenTsRef.current = maxTs;
            }
          }
        }
      } catch {
        /* silencieux — réseau défaillant */
      }
      if (cancelled) return;
      const visible = typeof document !== "undefined" && document.visibilityState === "visible";
      const delay = visible ? POLL_FOREGROUND_MS : POLL_BACKGROUND_MS;
      pollTimerRef.current = setTimeout(tick, delay);
    };

    // Démarrage immédiat
    tick();

    const onVisibilityChange = () => {
      if (cancelled) return;
      // Quand on redevient visible, on déclenche un tick immédiat
      if (document.visibilityState === "visible") {
        if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      clearRingTimers();
    };
  }, [authenticated, startRinging, clearRingTimers]);

  return (
    <RingerContext.Provider
      value={{
        prefs,
        refreshPrefs,
        updatePrefs,
        ringingProspectId,
        stopRinging,
        playPreview,
      }}
    >
      {children}
    </RingerContext.Provider>
  );
}
