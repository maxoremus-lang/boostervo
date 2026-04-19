"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "../../_components/BottomNav";
import SearchButton from "../../_components/SearchButton";
import SearchBar from "../../_components/SearchBar";

type Period = "day" | "week" | "month" | "custom";

type DelayBucket = { key: string; label: string; count: number };

type StatsResponse = {
  delayStats: {
    totalCallbacks: number;
    avgDelayMs: number;
    fastCallbacks: number;
    fastCallbackRate: number;
    distribution: DelayBucket[];
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

/** Formate un délai en ms en texte court : "45 s", "12 min", "2 h 14", "3 j" */
function formatDelay(ms: number): string {
  if (ms <= 0) return "—";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.round(ms / 60000);
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

/** Couleur selon la "qualité" de la tranche (< 5min = vert, plus lent = plus rouge) */
function bucketColor(key: string): string {
  switch (key) {
    case "lt1min":
    case "1to3min":
    case "3to5min":
      return "bg-green-500";
    case "5to10min":
    case "10to15min":
      return "bg-lime-500";
    case "15to20min":
      return "bg-yellow-500";
    case "20minTo1h":
      return "bg-orange-500";
    case "1hTo24h":
      return "bg-red-500";
    case "gt24h":
      return "bg-red-700";
    default:
      return "bg-gray-400";
  }
}

/** Couleur du hero selon la perf moyenne */
function heroColorClass(avgMs: number): string {
  if (avgMs === 0) return "from-gray-400 to-gray-500";
  const minutes = avgMs / 60000;
  if (minutes < 5) return "from-green-500 to-green-700";
  if (minutes < 30) return "from-orange-500 to-orange-700";
  return "from-red-500 to-red-700";
}

/** Message selon le % rappels < 5 min */
function fastMessage(rate: number): { emoji: string; text: string; color: string } {
  if (rate >= 80) return { emoji: "⭐", text: "Excellent réflexe commercial", color: "text-green-700" };
  if (rate >= 50) return { emoji: "👍", text: "Bonne réactivité", color: "text-lime-700" };
  if (rate >= 25) return { emoji: "💪", text: "À améliorer", color: "text-orange-700" };
  return { emoji: "⚠️", text: "Réactivité à travailler en priorité", color: "text-red-700" };
}

export default function StatsDelaiRappelPage() {
  const [period, setPeriod] = useState<Period>("week");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");
  const [showCustomPanel, setShowCustomPanel] = useState(false);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const d = stats?.delayStats;
  const maxCount = d ? Math.max(...d.distribution.map((b) => b.count), 1) : 1;
  const msg = d ? fastMessage(d.fastCallbackRate) : null;

  return (
    <div className="pb-24">
      {/* Header avec bouton retour */}
      <div className="bg-bleu px-5 pt-6 pb-5 text-white">
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
        <p className="text-xs opacity-80">{headerSubtitle}</p>
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
              <input
                type="date"
                value={customFrom}
                onChange={(e) => { setCustomFrom(e.target.value); setPeriod("custom"); }}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Date fin</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => { setCustomTo(e.target.value); setPeriod("custom"); }}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            {customActive && (
              <button
                onClick={() => { setCustomFrom(""); setCustomTo(""); setPeriod("week"); setShowCustomPanel(false); }}
                className="col-span-2 text-[11px] text-gray-500 underline text-left mt-0.5"
              >
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
          <p className="font-nunito font-bold text-gray-700">Aucun rappel effectué</p>
          <p className="text-sm text-gray-500 mt-1">Sur cette période, aucun appel manqué n&apos;a encore été rappelé.</p>
        </div>
      ) : (
        <>
          {/* Hero : Délai moyen */}
          <div className="px-5 pt-5">
            <div className={`bg-gradient-to-br ${heroColorClass(d.avgDelayMs)} text-white rounded-2xl p-5 shadow-lg`}>
              <p className="text-xs uppercase font-bold opacity-90 tracking-wider">Délai moyen de rappel</p>
              <p className="text-5xl font-nunito font-extrabold mt-1">{formatDelay(d.avgDelayMs)}</p>
              <p className="text-xs opacity-90 mt-2">
                Calculé sur {d.totalCallbacks} rappel{d.totalCallbacks > 1 ? "s" : ""} effectué{d.totalCallbacks > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* KPI phare : % rappels < 5 min */}
          <div className="px-5 mt-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs uppercase font-semibold text-gray-500">Rappels en moins de 5 min</p>
                  <p className="text-4xl font-nunito font-extrabold text-bleu mt-1">{d.fastCallbackRate}%</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {d.fastCallbacks} sur {d.totalCallbacks} rappels
                  </p>
                </div>
                {msg && (
                  <div className="text-right">
                    <div className="text-3xl">{msg.emoji}</div>
                    <p className={`text-[10px] font-bold ${msg.color}`}>{msg.text}</p>
                  </div>
                )}
              </div>
              {/* Barre de progression */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                  style={{ width: `${d.fastCallbackRate}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-2 italic">
                💡 Benchmark commerce : un prospect rappelé en moins de 5 min a jusqu&apos;à 20× plus de
                chances d&apos;être transformé.
              </p>
            </div>
          </div>

          {/* Répartition par tranches */}
          <div className="px-5 mt-5">
            <p className="text-xs uppercase font-semibold text-gray-500 mb-2">Répartition par tranche</p>
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2.5">
              {d.distribution.map((b) => {
                const pct = d.totalCallbacks > 0 ? (b.count / d.totalCallbacks) * 100 : 0;
                const barWidth = d.totalCallbacks > 0 ? (b.count / maxCount) * 100 : 0;
                return (
                  <div key={b.key} className="flex items-center gap-2">
                    <span className="w-24 text-[11px] font-semibold text-gray-700 shrink-0">{b.label}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden relative">
                      <div
                        className={`h-full ${bucketColor(b.key)} transition-all`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-[11px] font-bold text-gray-700 tabular-nums shrink-0">
                      {b.count} <span className="text-gray-400 font-normal">({Math.round(pct)}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div className="px-5 mt-5">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-[11px] text-blue-900">
                ℹ️ Le délai est mesuré depuis le <strong>premier appel manqué</strong> d&apos;une séquence
                jusqu&apos;au rappel effectué. Un prospect qui rappelle plusieurs fois avant d&apos;être
                rejoint compte pour un seul délai (le temps total d&apos;attente).
              </p>
            </div>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
