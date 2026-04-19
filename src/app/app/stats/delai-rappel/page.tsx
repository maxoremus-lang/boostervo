"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "../../_components/BottomNav";
import SearchButton from "../../_components/SearchButton";
import SearchBar from "../../_components/SearchBar";

type Period = "day" | "week" | "month" | "custom";

type Note = { letter: string; label: string; color: string };

type RecentCallback = {
  prospectId: string;
  name: string | null;
  phone: string;
  vehicleInterest: string | null;
  answeredAt: string;
  delayMs: number;
};

type StatsResponse = {
  delayStats: {
    totalCallbacks: number;
    avgDelayMs: number;
    fastCallbacks: number;
    fastCallbackRate: number;
    note: Note;
    previousPeriod: {
      avgDelayMs: number;
      fastCallbackRate: number;
      note: Note;
    } | null;
    recentCallbacks: RecentCallback[];
  };
};

const periodLabels: Record<Exclude<Period, "custom">, string> = {
  day: "Jour",
  week: "7 j",
  month: "30 j",
};

const periodSubtitle: Record<Exclude<Period, "custom">, string> = {
  day: "Aujourd'hui",
  week: "7 derniers jours",
  month: "30 derniers jours",
};

const prevPeriodLabel: Record<Exclude<Period, "custom">, string> = {
  day: "qu'hier",
  week: "que les 7 jours précédents",
  month: "que les 30 jours précédents",
};

/** Échelle de notes A+ → E */
const NOTE_SCALE: { letter: string; bg: string }[] = [
  { letter: "A+", bg: "bg-[#0d9f4c]" },
  { letter: "A",  bg: "bg-green-500" },
  { letter: "B",  bg: "bg-lime-500" },
  { letter: "C",  bg: "bg-yellow-500" },
  { letter: "D",  bg: "bg-orange-500" },
  { letter: "E",  bg: "bg-red-500" },
];

function noteBgGradient(color: string): string {
  switch (color) {
    case "green": return "from-green-500 to-green-700";
    case "lime":  return "from-lime-500 to-lime-700";
    case "yellow":return "from-yellow-500 to-yellow-700";
    case "orange":return "from-orange-500 to-orange-dark";
    case "red":   return "from-red-500 to-red-700";
    default:      return "from-gray-500 to-gray-700";
  }
}

function noteTextColor(letter: string): string {
  if (letter === "A+" || letter === "A") return "text-green-600";
  if (letter === "B") return "text-lime-600";
  if (letter === "C") return "text-yellow-600";
  if (letter === "D") return "text-orange-500";
  return "text-red-500";
}

/** Formatte un délai en ms */
function formatDelay(ms: number): string {
  if (ms <= 0) return "—";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMin = minutes % 60;
  if (hours < 24) return remainingMin === 0 ? `${hours} h` : `${hours} h ${String(remainingMin).padStart(2, "0")}`;
  const days = Math.floor(hours / 24);
  const remainingH = hours % 24;
  return remainingH === 0 ? `${days} j` : `${days} j ${remainingH} h`;
}

/** Formate YYYY-MM-DD → 12 avr. 26 */
function formatDateFr(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  const day = d.getDate();
  const monthShort = d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "");
  const year2 = String(d.getFullYear()).slice(-2);
  return `${day} ${monthShort}. ${year2}`;
}

/** Note affichée pour un délai donné */
function delayToNoteLetter(ms: number): string {
  const MIN = 60 * 1000;
  if (ms < 2 * MIN) return "A+";
  if (ms < 5 * MIN) return "A";
  if (ms < 15 * MIN) return "B";
  if (ms < 30 * MIN) return "C";
  if (ms < 60 * MIN) return "D";
  return "E";
}

export default function StatsDelaiRappelPage() {
  const [period, setPeriod] = useState<Period>("week");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");
  const [showCustomPanel, setShowCustomPanel] = useState(false);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const customActive = period === "custom" && (customFrom || customTo);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        let url = "/api/stats";
        if (period === "custom") {
          const params = new URLSearchParams();
          if (customFrom) params.set("from", customFrom);
          if (customTo) params.set("to", customTo);
          if (!customFrom && !customTo) {
            setStats(null);
            setLoading(false);
            return;
          }
          url += `?${params.toString()}`;
        } else {
          url += `?period=${period}`;
        }
        const res = await fetch(url);
        if (!res.ok) {
          if (!cancelled) {
            setError("Erreur de chargement");
            setLoading(false);
          }
          return;
        }
        const data: StatsResponse = await res.json();
        if (!cancelled) {
          setStats(data);
          setError(null);
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
  }, [period, customFrom, customTo]);

  const d = stats?.delayStats;
  const callbacksToShow = expanded
    ? d?.recentCallbacks ?? []
    : (d?.recentCallbacks ?? []).slice(0, 7);
  const remainingCount = (d?.recentCallbacks.length ?? 0) - 7;

  const headerSubtitle =
    period === "custom"
      ? customFrom && customTo
        ? `Du ${formatDateFr(customFrom)} au ${formatDateFr(customTo)}`
        : customFrom
          ? `Depuis le ${formatDateFr(customFrom)}`
          : customTo
            ? `Jusqu'au ${formatDateFr(customTo)}`
            : "Période personnalisée"
      : periodSubtitle[period];

  // Évolution du délai moyen vs période précédente
  const deltaMs =
    d && d.previousPeriod && d.previousPeriod.avgDelayMs > 0
      ? d.avgDelayMs - d.previousPeriod.avgDelayMs
      : null;
  const isFaster = deltaMs !== null && deltaMs < 0;
  const isSlower = deltaMs !== null && deltaMs > 0;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-bleu px-5 pt-6 pb-4 text-white">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <Link href="/app/stats" className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center" aria-label="Retour">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <p className="text-xs uppercase opacity-70 font-semibold">Statistiques</p>
          </div>
          <SearchButton />
        </div>
        <h1 className="text-xl font-nunito font-extrabold">Délai de rappel</h1>
        <p className="text-xs opacity-80">
          {headerSubtitle}
          {d && d.totalCallbacks > 0 && (
            <> · <strong>{d.totalCallbacks} rappel{d.totalCallbacks > 1 ? "s" : ""}</strong></>
          )}
        </p>
      </div>

      <SearchBar />

      {/* Sélecteur période */}
      <div className="px-5 py-3 bg-white border-b border-gray-100">
        <div className="flex gap-2 overflow-x-auto">
          {(Object.keys(periodLabels) as Array<Exclude<Period, "custom">>).map((p) => (
            <button
              key={p}
              onClick={() => { setPeriod(p); setShowCustomPanel(false); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                period === p ? "bg-orange text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
          <button
            onClick={() => { setPeriod("custom"); setShowCustomPanel(true); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition inline-flex items-center gap-1.5 ${
              period === "custom" ? "bg-orange text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Personnalisée
          </button>
        </div>

        {(showCustomPanel || period === "custom") && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Date début</label>
              <input type="date" value={customFrom} onChange={(e) => { setCustomFrom(e.target.value); setPeriod("custom"); }} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Date fin</label>
              <input type="date" value={customTo} onChange={(e) => { setCustomTo(e.target.value); setPeriod("custom"); }} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            {customActive && (
              <button onClick={() => { setCustomFrom(""); setCustomTo(""); setPeriod("week"); setShowCustomPanel(false); }} className="col-span-2 text-[11px] text-gray-500 underline text-left mt-0.5">
                Réinitialiser
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-center text-gray-400 text-sm py-12">Chargement…</p>
      ) : error || !d ? (
        <p className="text-center text-red-600 text-sm py-12">{error ?? "Aucune donnée"}</p>
      ) : d.totalCallbacks === 0 ? (
        <div className="px-5 py-12 text-center">
          <div className="text-4xl mb-3">📞</div>
          <p className="font-nunito font-bold text-gray-700">Aucun rappel sur cette période</p>
          <p className="text-sm text-gray-500 mt-1">Choisissez une période plus large pour voir vos stats.</p>
        </div>
      ) : (
        <>
          {/* Hero : Note de réactivité */}
          <div className="mx-5 mt-5">
            <div className={`bg-gradient-to-br ${noteBgGradient(d.note.color)} rounded-2xl p-6 text-white text-center shadow-lg`}>
              <p className="text-xs uppercase font-bold opacity-90 tracking-wider">Votre note de réactivité</p>
              <p className="text-7xl font-nunito font-black leading-none mt-2">{d.note.letter}</p>
              <p className="text-sm font-bold mt-1 opacity-95">{d.note.label}</p>
            </div>
          </div>

          {/* Échelle des notes */}
          <div className="mx-5 mt-4">
            <div className="grid grid-cols-6 gap-1 items-end">
              {NOTE_SCALE.map((n) => {
                const active = n.letter === d.note.letter;
                return (
                  <div
                    key={n.letter}
                    className={`${n.bg} rounded flex items-center justify-center font-nunito font-black text-white transition ${
                      active ? "h-14 shadow-lg scale-105 ring-2 ring-white" : "h-11 opacity-80"
                    }`}
                  >
                    <span className={active ? "text-base" : "text-sm"}>{n.letter}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2 chiffres clés */}
          <div className="mx-5 mt-4 bg-white rounded-2xl p-4 shadow-sm flex justify-around">
            <div className="text-center">
              <p className="text-3xl font-nunito font-extrabold text-bleu">{formatDelay(d.avgDelayMs)}</p>
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Délai moyen</p>
            </div>
            <div className="w-px bg-gray-200"></div>
            <div className="text-center">
              <p className="text-3xl font-nunito font-extrabold text-green-600">{d.fastCallbackRate}%</p>
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Rappels &lt;5 min</p>
            </div>
          </div>

          {/* Évolution vs période précédente */}
          {d.previousPeriod && deltaMs !== null && period !== "custom" && (
            <div className={`mx-5 mt-3 border rounded-xl p-3 flex items-center gap-3 ${
              isFaster ? "bg-green-50 border-green-200" : isSlower ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
            }`}>
              <span className={`text-2xl ${isFaster ? "text-green-600" : isSlower ? "text-red-600" : "text-gray-400"}`}>
                {isFaster ? "▼" : isSlower ? "▲" : "="}
              </span>
              <div className="flex-1">
                <p className={`text-xs font-bold ${isFaster ? "text-green-900" : isSlower ? "text-red-900" : "text-gray-700"}`}>
                  {isFaster
                    ? `Plus réactif ${prevPeriodLabel[period as Exclude<Period,"custom">]}`
                    : isSlower
                    ? `Moins réactif ${prevPeriodLabel[period as Exclude<Period,"custom">]}`
                    : `Stable ${prevPeriodLabel[period as Exclude<Period,"custom">]}`
                  }
                </p>
                <p className={`text-[11px] mt-0.5 ${isFaster ? "text-green-700" : isSlower ? "text-red-700" : "text-gray-600"}`}>
                  <strong>{isFaster ? "-" : "+"}{formatDelay(Math.abs(deltaMs))}</strong>
                  {" · note "}
                  {d.note.letter !== d.previousPeriod.note.letter ? (
                    <><span className="line-through opacity-60">{d.previousPeriod.note.letter}</span> → <strong>{d.note.letter}</strong></>
                  ) : (
                    <strong>{d.note.letter}</strong>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Derniers rappels */}
          <div className="mx-5 mt-4">
            <p className="text-xs uppercase text-gray-500 font-semibold mb-2">
              {expanded
                ? `${d.recentCallbacks.length} derniers rappels`
                : `${Math.min(7, d.recentCallbacks.length)} derniers rappels`}
            </p>
            <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
              {callbacksToShow.map((c) => {
                const noteL = delayToNoteLetter(c.delayMs);
                const noteColor = noteTextColor(noteL);
                return (
                  <Link
                    key={c.prospectId + c.answeredAt}
                    href={`/app/rappels/${c.prospectId}`}
                    className="flex items-center gap-3 p-2.5 active:bg-gray-50"
                  >
                    <span className={`text-xs font-black ${noteColor} w-6`}>{noteL}</span>
                    <span className="text-sm font-semibold flex-1 truncate">
                      {c.name ?? c.phone}
                    </span>
                    <span className="text-xs font-bold text-gray-600">{formatDelay(c.delayMs)}</span>
                  </Link>
                );
              })}
            </div>
            {!expanded && remainingCount > 0 && (
              <button
                onClick={() => setExpanded(true)}
                className="w-full mt-2 text-center text-xs font-bold text-bleu bg-white rounded-xl shadow-sm py-3 active:opacity-70"
              >
                Voir les {remainingCount} autre{remainingCount > 1 ? "s" : ""} rappel{remainingCount > 1 ? "s" : ""} →
              </button>
            )}
          </div>

          <div className="px-5 mt-5 mb-6">
            <p className="text-[11px] text-gray-400 italic text-center">
              Note calculée selon le % de rappels en moins de 5 min
              (A+ ≥ 80%, A ≥ 60%, B ≥ 40%, C ≥ 20%, D ≥ 10%, E &lt; 10%).
            </p>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
