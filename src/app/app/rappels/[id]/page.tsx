"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "../../_components/BottomNav";
import SearchButton from "../../_components/SearchButton";
import SearchBar from "../../_components/SearchBar";
import { StatusBadge, UrgentBadge, NewBadge, KnownBadge } from "../../_components/Badge";
import { useNotificationRinger } from "../../_components/NotificationRinger";
import { useCall } from "../../_components/Providers";
import type { Prospect } from "../../_lib/types";
import { formatRelativeTime, missedCallsCount } from "../../_lib/mockData";

function PhoneIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
  );
}

/** Clé "YYYY-MM-DD" du jour Paris pour comparaison TZ-safe. */
function parisDayKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "short", day: "numeric", month: "short", year: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? "";
  const weekday = get("weekday").replace(".", "");
  const weekdayCap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const month = get("month").replace(".", "");
  // Ex: "Mar. 19 avr. 26 · 14:32"
  return `${weekdayCap}. ${get("day")} ${month}. ${get("year")} · ${get("hour")}:${get("minute")}`;
}

/** Formatte un délai en ms en texte court et lisible : "12 min", "2 h 14", "3 j" */
function formatDelay(ms: number): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return "moins d'1 min";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMin = minutes % 60;
  if (hours < 24) {
    return remainingMin === 0 ? `${hours} h` : `${hours} h ${String(remainingMin).padStart(2, "0")}`;
  }
  const days = Math.floor(hours / 24);
  const remainingH = hours % 24;
  return remainingH === 0 ? `${days} j` : `${days} j ${remainingH} h`;
}

/**
 * Pour chaque event "answered", calcule le délai depuis le premier "missed"
 * de la séquence non encore rappelée qui le précède.
 * Pour chaque event "missed", calcule son numéro d'ordre dans la séquence
 * (le compteur repart à 1 après chaque answered).
 * Retourne { delays, missedNumbers }.
 */
function computeCallbackAnalysis(events: { id: string; at: string; type: string; direction?: string }[]): {
  delays: Map<string, number>;
  missedNumbers: Map<string, number>;
} {
  const delays = new Map<string, number>();
  const missedNumbers = new Map<string, number>();
  // Trier par ordre chronologique ASC
  const sorted = [...events].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  let firstMissedEver: { at: string } | null = null;
  let firstMissedOfRound: { at: string } | null = null;
  let missedCountInRound = 0;
  let firstDelayRecorded = false;
  for (const ev of sorted) {
    if (ev.type === "missed" && ev.direction === "inbound") {
      // Seuls les missed entrants alimentent la file de rappels à traiter
      if (!firstMissedEver) firstMissedEver = { at: ev.at };
      if (!firstMissedOfRound) firstMissedOfRound = { at: ev.at };
      missedCountInRound++;
      missedNumbers.set(ev.id, missedCountInRound);
    } else if (ev.type === "answered" && ev.direction === "outbound") {
      // Seul le 1er outbound-answered après le 1er missed reçoit le badge de délai.
      // Les séquences ultérieures (2e round missed→outbound-answered pour le même prospect)
      // ne sont pas marquées — on veut une seule ligne de délai par fiche.
      if (firstMissedEver && !firstDelayRecorded) {
        const delay = new Date(ev.at).getTime() - new Date(firstMissedEver.at).getTime();
        if (delay > 0) {
          delays.set(ev.id, delay);
          firstDelayRecorded = true;
        }
      }
      firstMissedOfRound = null;
      missedCountInRound = 0;
    }
    // inbound-answered et outbound-missed n'affectent ni la numérotation ni le délai
  }
  return { delays, missedNumbers };
}

function formatEventDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();

  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "short", day: "numeric", month: "short", year: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? "";
  const time = `${get("hour")}:${get("minute")}`;
  const month = get("month").replace(".", "");
  const dateShort = `${get("day")} ${month}. ${get("year")}`;
  const weekday = get("weekday").replace(".", "");
  const weekdayCap = weekday.charAt(0).toUpperCase() + weekday.slice(1);

  const dKey = parisDayKey(d);
  const todayKey = parisDayKey(now);
  if (dKey === todayKey) return `Aujourd'hui · ${time}`;

  const yesterdayKey = parisDayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  if (dKey === yesterdayKey) return `Hier · ${dateShort} · ${time}`;

  const diffDays = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays < 7) return `${weekdayCap}. ${dateShort} · ${time}`;

  return `${dateShort} · ${time}`;
}

export default function ProspectDetailPage({ params }: { params: { id: string } }) {
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { stopRinging } = useNotificationRinger();
  const { startCall } = useCall();

  // Si une sonnerie d'alerte est en cours pour ce prospect, on la coupe dès l'ouverture
  useEffect(() => {
    stopRinging(params.id);
  }, [params.id, stopRinging]);

  // Navigation contextuelle (prev/next) depuis la liste d'origine
  const [contextQuery, setContextQuery] = useState<string>("");
  const [siblings, setSiblings] = useState<{ id: string }[] | null>(null);

  // Parse ?filter=... ou ?status=... depuis l'URL au montage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = window.location.search.replace(/^\?/, "");
    setContextQuery(q);
    if (!q) return;

    // Charger la liste correspondante pour calculer prev/next
    const params = new URLSearchParams(q);
    const apiParams = new URLSearchParams();
    const status = params.get("status");
    const filter = params.get("filter");
    const period = params.get("period");
    if (status) apiParams.set("status", status);
    else if (filter) apiParams.set("filter", filter);
    if (period) apiParams.set("period", period);

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/prospects?${apiParams.toString()}`);
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) {
          setSiblings(json.prospects?.map((p: { id: string }) => ({ id: p.id })) ?? []);
        }
      } catch {
        /* silencieux */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/prospects/${params.id}`);
        if (!res.ok) {
          if (!cancelled) {
            setError(res.status === 404 ? "Prospect introuvable" : "Erreur de chargement");
            setLoading(false);
          }
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setProspect(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("Erreur réseau");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  // Calcul prev/next dans la liste contextuelle
  const currentIndex = siblings?.findIndex((p) => p.id === params.id) ?? -1;
  const prevId = currentIndex > 0 ? siblings?.[currentIndex - 1].id : null;
  const nextId =
    currentIndex >= 0 && siblings && currentIndex < siblings.length - 1
      ? siblings[currentIndex + 1].id
      : null;
  const backHref = contextQuery ? `/app/rappels?${contextQuery}` : "/app/rappels";
  const buildDetailHref = (id: string) => (contextQuery ? `/app/rappels/${id}?${contextQuery}` : `/app/rappels/${id}`);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Chargement…
      </div>
    );
  }

  if (!prospect) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <p className="text-red-600 mb-4">{error ?? "Prospect introuvable"}</p>
        <Link href="/app/rappels" className="text-orange font-bold">
          Retour aux rappels
        </Link>
      </div>
    );
  }

  const missed = missedCallsCount(prospect);
  const triggerCall = () => startCall({
    prospectId: prospect.id,
    prospectPhone: prospect.phone,
    prospectName: prospect.name ?? null,
    prospectVehicle: prospect.vehicleInterest ?? null,
    prospectPrice: prospect.vehiclePrice ?? null,
    prospectNotes: prospect.notes ?? null,
  });

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-bleu px-5 pt-6 pb-5 text-white">
        <div className="flex items-center justify-between mb-4 gap-2">
          <Link href={backHref} className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center shrink-0" aria-label="Retour à la liste">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex gap-2 flex-1 justify-center flex-wrap">
            {prospect.isKnown ? <KnownBadge /> : <NewBadge />}
            {prospect.isUrgent && prospect.status === "pending" && <UrgentBadge />}
            {prospect.status !== "pending" && <StatusBadge status={prospect.status} />}
          </div>
          {/* Navigation contextuelle : flèche suivante si on vient d'une liste */}
          {nextId ? (
            <Link
              href={buildDetailHref(nextId)}
              className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center shrink-0 active:opacity-70"
              aria-label="Rappel suivant"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : siblings ? (
            <div className="w-9 h-9 shrink-0 opacity-30 flex items-center justify-center" aria-label="Fin de liste">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ) : (
            <SearchButton />
          )}
        </div>
        {/* Indicateur de position dans la liste */}
        {siblings && currentIndex >= 0 && siblings.length > 1 && (
          <div className="flex items-center justify-center gap-4 text-[11px] text-white/70 -mt-2 mb-2">
            {prevId ? (
              <Link href={buildDetailHref(prevId)} className="flex items-center gap-1 active:opacity-60">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Précédent
              </Link>
            ) : (
              <span className="opacity-40">Précédent</span>
            )}
            <span className="font-semibold">{currentIndex + 1} / {siblings.length}</span>
            {nextId ? (
              <Link href={buildDetailHref(nextId)} className="flex items-center gap-1 active:opacity-60">
                Suivant
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <span className="opacity-40">Suivant</span>
            )}
          </div>
        )}
        {prospect.isKnown ? (
          <>
            <h1 className="text-2xl font-nunito font-extrabold">{prospect.name}</h1>
            <p className="text-sm opacity-80">{prospect.phone}</p>
          </>
        ) : (
          <>
            <p className="text-xs uppercase opacity-70 font-semibold">Appelant</p>
            <h1 className="text-2xl font-nunito font-extrabold">{prospect.phone}</h1>
            <p className="text-sm opacity-80">Aucune fiche · 1er contact</p>
          </>
        )}
      </div>

      <SearchBar />

      {/* Boutons principaux */}
      <div className="px-5 -mt-3 space-y-2">
        <button
          type="button"
          onClick={triggerCall}
          className="w-full bg-orange hover:bg-orange-dark text-white font-nunito font-extrabold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-lg transition"
        >
          <PhoneIcon /> Rappeler {prospect.isKnown ? "" : "maintenant"}
        </button>
        <Link
          href={`/app/rappels/${prospect.id}/fiche`}
          className="w-full bg-white border-2 border-bleu text-bleu font-nunito font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Saisir la fiche
        </Link>
      </div>

      {/* RDV à venir */}
      {prospect.appointmentAt && (
        <div className="px-5 mt-5">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-green-800 font-semibold uppercase">Prochain RDV</p>
                <p className="font-nunito font-extrabold text-green-900 capitalize">{formatDate(prospect.appointmentAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Véhicule (si connu) */}
      {prospect.isKnown && prospect.vehicleInterest && (
        <div className="px-5 mt-5">
          <h2 className="text-xs uppercase font-semibold text-gray-500 mb-2">Véhicule d&apos;intérêt</h2>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-bleu/10 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-bleu" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 11-4 0 2 2 0 014 0zM20 17a2 2 0 11-4 0 2 2 0 014 0zM4 9h16l-1.5-4.5A2 2 0 0016.6 3H7.4a2 2 0 00-1.9 1.5L4 9zm0 0v7a1 1 0 001 1h1m14-8v7a1 1 0 01-1 1h-1" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-nunito font-bold">{prospect.vehicleInterest}</p>
                {prospect.vehiclePrice && (
                  <p className="text-xs text-gray-500">{prospect.vehiclePrice.toLocaleString("fr-FR")} €</p>
                )}
                {prospect.budget && (
                  <p className="text-xs text-gray-500">Budget ~{prospect.budget.toLocaleString("fr-FR")} €</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {prospect.isKnown && prospect.notes && (
        <div className="px-5 mt-5">
          <h2 className="text-xs uppercase font-semibold text-gray-500 mb-2">Notes</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3">
            <p className="text-sm text-gray-800 italic">&ldquo;{prospect.notes}&rdquo;</p>
          </div>
        </div>
      )}

      {/* Historique */}
      <div className="px-5 mt-5">
        <h2 className="text-xs uppercase font-semibold text-gray-500 mb-2">
          Historique des appels ({missed} manqué{missed > 1 ? "s" : ""})
        </h2>
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          {prospect.callEvents.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Aucun appel enregistré</p>
          ) : (
            (() => {
              const { delays, missedNumbers } = computeCallbackAnalysis(prospect.callEvents);
              return prospect.callEvents.map((ev) => {
                const delayMs = delays.get(ev.id);
                const missedNum = missedNumbers.get(ev.id);
                // 4 cas : outbound+answered (vrai rappel), outbound+missed (rappel sans réponse),
                // inbound+answered (prospect a rappelé lui-même, on a décroché),
                // inbound+missed (appel manqué classique).
                const isOutbound = ev.direction === "outbound";
                const isAnswered = ev.type === "answered";
                // Pastille : vert plein (sortant décroché) / vert contour (entrant décroché)
                // / rouge plein (entrant manqué) / rouge contour (sortant sans réponse)
                const dotClasses = isAnswered
                  ? (isOutbound ? "bg-green-500" : "bg-white border-2 border-green-500")
                  : (isOutbound ? "bg-white border-2 border-red-500" : "bg-red-500");
                const title = isOutbound
                  ? (isAnswered ? "Appel sortant décroché" : "Appel sortant sans réponse")
                  : (isAnswered ? "Appel entrant décroché" : `Appel entrant manqué n°${missedNum ?? "?"}`);
                return (
                  <div key={ev.id} className="flex gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${dotClasses}`} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="text-xs text-gray-500">
                        {formatEventDate(ev.at)} · {formatRelativeTime(ev.at)}
                        {ev.ringSec && ` · sonné ${ev.ringSec}s`}
                        {ev.durationSec && ` · durée ${Math.round(ev.durationSec / 60)}min ${ev.durationSec % 60}s`}
                      </p>
                      {delayMs !== undefined && (
                        <p className="text-[11px] text-green-700 font-semibold mt-0.5 inline-flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Délai de rappel {formatDelay(delayMs)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              });
            })()
          )}
        </div>
      </div>

      {/* Message pour prospects inconnus */}
      {!prospect.isKnown && (
        <div className="px-5 mt-5">
          <div className="bg-gray-100 rounded-2xl p-3 text-center">
            <p className="text-[11px] text-gray-600">
              Après l&apos;appel, tapez <strong>Saisir la fiche</strong> pour enregistrer nom, véhicule et résultat.
            </p>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
