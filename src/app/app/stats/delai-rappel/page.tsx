"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "../../_components/BottomNav";
import SearchButton from "../../_components/SearchButton";
import SearchBar from "../../_components/SearchBar";

type Period = "day" | "week" | "month" | "all" | "custom";

type Note = { letter: string; label: string; color: string };

type DistributionBucket = { key: string; label: string; count: number };

type RecentCallback = {
  prospectId: string;
  name: string | null;
  phone: string;
  vehicleInterest: string | null;
  answeredAt: string;
  delayMs: number;
};

type ImpactBucket = {
  key: string;
  label: string;
  rappels: number;
  rdvs: number;
  ventes: number;
  marge: number;
};

type StatsResponse = {
  delayStats: {
    totalCallbacks: number;
    avgDelayMs: number;
    fastCallbacks: number;
    fastCallbackRate: number;
    distribution: DistributionBucket[];
    note: Note;
    previousPeriod: {
      avgDelayMs: number;
      fastCallbackRate: number;
      note: Note;
    } | null;
    recentCallbacks: RecentCallback[];
  };
  impactStats: {
    totalCallbacks: number;
    distribution: ImpactBucket[];
    current: { rdvs: number; sales: number; margin: number; rdvRate: number; salesRate: number };
  };
};

const IMPACT_BUCKET_DOT: Record<string, string> = {
  direct:      "bg-emerald-500",
  lt5min:      "bg-green-500",
  "5to30min":  "bg-lime-500",
  "30minTo2h": "bg-orange-500",
  gt2h:        "bg-red-500",
};

function formatEuros(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} €`;
}

const periodLabels: Record<Exclude<Period, "custom">, string> = {
  day: "Jour",
  week: "7 j",
  month: "30 j",
  all: "Tout",
};

const periodSubtitle: Record<Exclude<Period, "custom">, string> = {
  day: "Aujourd'hui",
  week: "7 derniers jours",
  month: "30 derniers jours",
  all: "Tout l'historique",
};

const prevPeriodLabel: Record<Exclude<Period, "custom">, string> = {
  day: "qu'hier",
  week: "que les 7 jours précédents",
  month: "que les 30 jours précédents",
  all: "",
};

/** Couleur de fond (gradient) du hero "Délai moyen" selon la perf */
function heroBgGradient(avgMs: number): string {
  const MIN = 60 * 1000;
  if (avgMs < 5 * MIN)       return "from-green-500 to-green-700";
  if (avgMs < 30 * MIN)      return "from-lime-500 to-lime-700";
  if (avgMs < 2 * 60 * MIN)  return "from-orange to-orange-dark";
  return "from-red-500 to-red-700";
}

/** Catégorie de délai (pour la pastille des rappels récents + libellé des tuiles) */
type DelayCategory = "fast" | "ok" | "slow" | "verySlow";

function delayCategory(ms: number): DelayCategory {
  const MIN = 60 * 1000;
  if (ms < 5 * MIN)      return "fast";
  if (ms < 30 * MIN)     return "ok";
  if (ms < 2 * 60 * MIN) return "slow";
  return "verySlow";
}

/** Pastille colorée par catégorie (vert / vert clair / orange / rouge) */
const CATEGORY_DOT_BG: Record<DelayCategory, string> = {
  fast:     "bg-green-500",
  ok:       "bg-lime-500",
  slow:     "bg-orange-500",
  verySlow: "bg-red-500",
};

/** Couleur de texte des valeurs dans les 4 tuiles */
const CATEGORY_TEXT: Record<DelayCategory, string> = {
  fast:     "text-green-600",
  ok:       "text-lime-600",
  slow:     "text-orange-500",
  verySlow: "text-red-500",
};

const BUCKET_KEYS_ORDER: Array<{ key: string; cat: DelayCategory }> = [
  { key: "lt5min",  cat: "fast" },
  { key: "lt30min", cat: "ok" },
  { key: "lt2h",    cat: "slow" },
  { key: "gte2h",   cat: "verySlow" },
];

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
  const DEFAULT_CALLS = 5;
  const callbacksToShow = expanded
    ? d?.recentCallbacks ?? []
    : (d?.recentCallbacks ?? []).slice(0, DEFAULT_CALLS);
  const remainingCount = (d?.recentCallbacks.length ?? 0) - DEFAULT_CALLS;

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
          {(["day", "week", "month", "all"] as Array<Exclude<Period, "custom">>).map((p) => (
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
              <input type="date" onClick={(e) => e.currentTarget.showPicker?.()} value={customFrom} onChange={(e) => { setCustomFrom(e.target.value); setPeriod("custom"); }} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Date fin</label>
              <input type="date" onClick={(e) => e.currentTarget.showPicker?.()} value={customTo} onChange={(e) => { setCustomTo(e.target.value); setPeriod("custom"); }} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
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
          <p className="text-sm text-gray-500 mt-1">Choisissez une période plus large pour voir vos statistiques.</p>
        </div>
      ) : (
        <>
          {/* Hero : Délai moyen */}
          <div className="mx-5 mt-5">
            <div className={`bg-gradient-to-br ${heroBgGradient(d.avgDelayMs)} rounded-2xl p-5 text-white shadow-lg`}>
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase font-bold opacity-90 tracking-wider">Délai moyen</p>
              </div>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <p className="text-5xl font-nunito font-black leading-none">
                  {formatDelay(d.avgDelayMs)}
                </p>
                {deltaMs !== null && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm">
                    <span>{isFaster ? "▼" : isSlower ? "▲" : "="}</span>
                    <span>{isFaster ? "-" : isSlower ? "+" : ""}{formatDelay(Math.abs(deltaMs))}</span>
                  </span>
                )}
              </div>
              {/* Progress bar = fastCallbackRate */}
              <div className="mt-4 h-2 bg-white/25 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, d.fastCallbackRate))}%` }}
                />
              </div>
              <p className="text-xs mt-3 font-semibold flex items-center gap-1.5 opacity-95">
                <span>⭐</span>
                <strong className="font-extrabold">{d.fastCallbackRate}%</strong>
                <span>des rappels en moins de 5 min</span>
              </p>
            </div>
          </div>

          {/* 4 tuiles : décroché + 3 tranches de délai de rappel (alignées 1:1 avec le tableau) */}
          {(() => {
            const directCount = stats?.impactStats?.distribution.find((b) => b.key === "direct")?.rappels ?? 0;
            const lt5 = d.distribution.find((x) => x.key === "lt5min")?.count ?? 0;
            const lt30 = d.distribution.find((x) => x.key === "lt30min")?.count ?? 0;
            const lt2h = d.distribution.find((x) => x.key === "lt2h")?.count ?? 0;
            const tiles: Array<{ count: number; label: string; sub: string; textClass: string }> = [
              { count: directCount, label: "Décroché", sub: "",       textClass: "text-emerald-600" },
              { count: lt5,         label: "< 5 min",  sub: "rappel", textClass: "text-green-600" },
              { count: lt30,        label: "> 5 min",  sub: "rappel", textClass: "text-orange-500" },
              { count: lt2h,        label: "> 30 min", sub: "rappel", textClass: "text-red-500" },
            ];
            return (
              <div className="mx-5 mt-4 grid grid-cols-4 gap-2">
                {tiles.map((t) => (
                  <div key={t.label} className="bg-white rounded-xl p-3 text-center shadow-sm">
                    <p className={`text-xl font-nunito font-extrabold ${t.textClass}`}>{t.count}</p>
                    <p className="text-[10px] text-gray-500 font-semibold mt-0.5 leading-tight">{t.label}</p>
                    {t.sub && (
                      <p className="text-[10px] text-gray-500 font-semibold leading-tight">{t.sub}</p>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Taux de conversion par tranche de délai */}
          {stats?.impactStats && stats.impactStats.totalCallbacks > 0 && (
            <div className="mx-5 mt-5">
              <p className="text-xs uppercase font-semibold text-gray-500 mb-2">Taux de conversion par délai</p>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-[1fr_48px_64px_64px] gap-1.5 px-3 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                  <span>Canal</span>
                  <span className="text-right">Vol.</span>
                  <span className="text-right text-violet-700">RDV</span>
                  <span className="text-right text-green-700">Vtes</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {stats.impactStats.distribution.map((b) => {
                    const dot = IMPACT_BUCKET_DOT[b.key] ?? "bg-gray-400";
                    const rdvPct = b.rappels > 0 ? Math.round((b.rdvs / b.rappels) * 100) : 0;
                    const ventesPct = b.rappels > 0 ? Math.round((b.ventes / b.rappels) * 100) : 0;
                    return (
                      <div key={b.key} className="grid grid-cols-[1fr_48px_64px_64px] gap-1.5 px-3 py-2.5 items-center">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`}></span>
                          <span className="text-base font-semibold truncate">{b.label}</span>
                        </div>
                        <span className="text-base font-bold text-gray-700 text-right">{b.rappels}</span>
                        <span className="text-base font-bold text-violet-600 text-right">
                          {b.rdvs}
                          {b.rappels > 0 && (
                            <span className="text-[11px] block text-violet-400 font-normal leading-none">{rdvPct}%</span>
                          )}
                        </span>
                        <span className="text-base font-bold text-green-600 text-right">
                          {b.ventes}
                          {b.rappels > 0 && (
                            <span className="text-[11px] block text-green-400 font-normal leading-none">{ventesPct}%</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-[1fr_48px_64px_64px] gap-1.5 px-3 py-2.5 bg-gray-50 border-t border-gray-200 items-center">
                  <span className="text-base font-extrabold text-gray-700">Total</span>
                  <span className="text-base font-extrabold text-gray-700 text-right">{stats.impactStats.totalCallbacks}</span>
                  <span className="text-base font-extrabold text-violet-700 text-right">
                    {stats.impactStats.current.rdvs}
                    <span className="text-[11px] block text-violet-400 font-normal leading-none">{stats.impactStats.current.rdvRate}%</span>
                  </span>
                  <span className="text-base font-extrabold text-green-600 text-right">
                    {stats.impactStats.current.sales}
                    <span className="text-[11px] block text-green-400 font-normal leading-none">{stats.impactStats.current.salesRate}%</span>
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 italic px-1">
                % = taux de transformation par tranche (🟣 RDV · 🟢 Ventes).
              </p>
            </div>
          )}

          {/* Évolution vs période précédente */}
          {d.previousPeriod && deltaMs !== null && period !== "custom" && (
            <div className={`mx-5 mt-4 border rounded-xl p-3 flex items-center gap-3 ${
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
                  {" "}({formatDelay(d.previousPeriod.avgDelayMs)} → <strong>{formatDelay(d.avgDelayMs)}</strong>)
                </p>
              </div>
            </div>
          )}

          {/* Derniers rappels */}
          <div className="mx-5 mt-4">
            <p className="text-xs uppercase text-gray-500 font-semibold mb-2">
              {expanded
                ? `${d.recentCallbacks.length} derniers rappels`
                : `${Math.min(DEFAULT_CALLS, d.recentCallbacks.length)} derniers rappels`}
            </p>
            <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
              {callbacksToShow.map((c) => {
                const cat = delayCategory(c.delayMs);
                return (
                  <Link
                    key={c.prospectId + c.answeredAt}
                    href={`/app/rappels/${c.prospectId}`}
                    className="flex items-center gap-3 p-2.5 active:bg-gray-50"
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${CATEGORY_DOT_BG[cat]} flex-shrink-0`} aria-hidden="true"></span>
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
        </>
      )}

      <BottomNav />
    </div>
  );
}
