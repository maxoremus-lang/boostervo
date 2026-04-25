"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "../../_components/BottomNav";
import SearchButton from "../../_components/SearchButton";
import SearchBar from "../../_components/SearchBar";

type Period = "day" | "week" | "month" | "all" | "custom";

type Bucket = {
  key: string;
  label: string;
  rappels: number;
  rdvs: number;
  ventes: number;
  marge: number;
};

type StatsResponse = {
  impactStats: {
    totalCallbacks: number;
    rappelCallbacks: number;
    directPickups: number;
    distribution: Bucket[];
    current: { rdvs: number; sales: number; margin: number; rdvRate: number; salesRate: number };
    potential: { rdvs: number; sales: number; margin: number };
    best: { rdvRate: number; salesRate: number; sampleSize: number };
    missedMargin: number;
  };
};

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

// Couleurs alignées avec celles utilisées sur la page délai de rappel.
const BUCKET_COLORS: Record<string, { dot: string }> = {
  direct:     { dot: "bg-emerald-500" },
  lt5min:     { dot: "bg-green-500" },
  "5to30min": { dot: "bg-orange-500" },
  "30minTo2h":{ dot: "bg-red-500" },
  gt2h:       { dot: "bg-red-700" },
};

/** Formatte YYYY-MM-DD → 12 avr. 26 */
function formatDateFr(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  const day = d.getDate();
  const monthShort = d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "");
  const year2 = String(d.getFullYear()).slice(-2);
  return `${day} ${monthShort}. ${year2}`;
}

/** Formate un montant en euros avec espace comme séparateur de milliers */
function formatEuros(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} €`;
}

/** Formate un montant en k€ avec une décimale si nécessaire (ex: 12 k€, 8,3 k€). */
function formatKEuros(amount: number): string {
  if (amount === 0) return "—";
  if (amount < 1000) return `${amount} €`;
  const rounded = Math.round((amount / 1000) * 10) / 10;
  return `${rounded.toString().replace(".", ",")} k€`;
}

export default function StatsImpactFinancierPage() {
  const [period, setPeriod] = useState<Period>("month");
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
          if (!cancelled) { setError("Erreur de chargement"); setLoading(false); }
          return;
        }
        const data: StatsResponse = await res.json();
        if (!cancelled) { setStats(data); setError(null); setLoading(false); }
      } catch {
        if (!cancelled) { setError("Erreur réseau"); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
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

  const i = stats?.impactStats;
  const maxPct = 70; // haut de l'axe Y du graph
  const yFromPct = (pct: number) => 150 - (pct / maxPct) * 130;

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
        <h1 className="text-xl font-nunito font-extrabold">Impact financier</h1>
        <p className="text-xs opacity-80">
          {headerSubtitle}
          {i && i.totalCallbacks > 0 && (
            <> · <strong>{i.totalCallbacks} rappels</strong> · <strong>{i.current.rdvs} RDV</strong> · <strong>{i.current.sales} ventes</strong></>
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
              <button onClick={() => { setCustomFrom(""); setCustomTo(""); setPeriod("month"); setShowCustomPanel(false); }} className="col-span-2 text-[11px] text-gray-500 underline text-left mt-0.5">
                Réinitialiser
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-center text-gray-400 text-sm py-12">Chargement…</p>
      ) : error || !i ? (
        <p className="text-center text-red-600 text-sm py-12">{error ?? "Aucune donnée"}</p>
      ) : i.totalCallbacks === 0 ? (
        <div className="px-5 py-12 text-center">
          <div className="text-4xl mb-3">💰</div>
          <p className="font-nunito font-bold text-gray-700">Aucune activité d&apos;appel sur cette période</p>
          <p className="text-sm text-gray-500 mt-1">Choisissez une période plus large pour voir l&apos;impact financier.</p>
        </div>
      ) : (
        <>
          {/* ======== SIMULATEUR MANQUE À GAGNER ======== */}
          <div className="mx-5 mt-5">
            <div className="bg-gradient-to-br from-orange to-orange-dark text-white rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💰</span>
                <p className="text-xs uppercase font-bold opacity-90 tracking-wider">Potentiel inexploité</p>
              </div>
              <p className="text-xs opacity-90 leading-relaxed">
                Si tous vos <strong>{i.rappelCallbacks} rappels</strong> avaient été faits
                <strong> en moins de 5 min</strong> (les {i.directPickups} décrochés directs étant déjà au maximum),
                vous auriez plus de résultats :
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-95">RDV potentiels</span>
                  <span className="font-nunito font-extrabold">
                    {i.current.rdvs} → <span className="text-yellow-300">{i.potential.rdvs}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-95">Ventes potentielles</span>
                  <span className="font-nunito font-extrabold">
                    {i.current.sales} → <span className="text-yellow-300">{i.potential.sales}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-95">Marge potentielle</span>
                  <span className="font-nunito font-extrabold">
                    {formatEuros(i.current.margin)} → <span className="text-yellow-300">{formatEuros(i.potential.margin)}</span>
                  </span>
                </div>
              </div>
            </div>
            {/* Bloc "Manque à gagner" sur fond bleu */}
            <div className="bg-bleu rounded-2xl mt-2 p-4 shadow-md text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-wide">Manque à gagner</span>
                <span className="font-nunito font-black text-3xl text-orange">{formatEuros(i.missedMargin)}</span>
              </div>
              <p className="text-[10px] text-white/90 mt-2 italic font-bold">
                Calcul basé sur votre taux de conversions des rappels &lt;5 min :
                {" "}{i.best.rdvRate}% en RDV, {i.best.salesRate}% en vente.
              </p>
            </div>
          </div>

          {/* ======== 2 TAUX CLÉS ======== */}
          <div className="mx-5 mt-4 grid grid-cols-2 gap-2">
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Conversations → RDV</p>
              <p className="text-2xl font-nunito font-extrabold text-violet-600 mt-0.5">{i.current.rdvRate}%</p>
              <p className="text-[10px] text-gray-400">{i.current.rdvs} RDV / {i.totalCallbacks} conversations</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Conversations → Ventes</p>
              <p className="text-2xl font-nunito font-extrabold text-green-600 mt-0.5">{i.current.salesRate}%</p>
              <p className="text-[10px] text-gray-400">{i.current.sales} ventes / {i.totalCallbacks} conversations</p>
            </div>
          </div>

          {/* ======== ENTONNOIR COMMERCIAL ======== */}
          {(() => {
            const directs = i.distribution.find((b) => b.key === "direct")?.rappels ?? 0;
            const rappels = Math.max(0, i.totalCallbacks - directs);
            const maxLabel = i.totalCallbacks > 0 ? i.totalCallbacks : 1;
            return (
              <div className="mx-5 mt-3 bg-white rounded-xl p-3 shadow-sm">
                <p className="text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Entonnoir commercial</p>
                <p className="text-[10px] text-gray-400 mb-2">Taux calculés sur les {i.totalCallbacks} conversations abouties</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold w-16">Décrochés</span>
                    <div
                      className="h-5 bg-bleu/70 rounded text-white text-[11px] font-bold flex items-center justify-end pr-2"
                      style={{ width: `${Math.max((directs / maxLabel) * 100, 10)}%` }}
                    >
                      {directs}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold w-16">Rappels</span>
                    <div
                      className="h-5 bg-bleu/70 rounded text-white text-[11px] font-bold flex items-center justify-end pr-2"
                      style={{ width: `${Math.max((rappels / maxLabel) * 100, 10)}%` }}
                    >
                      {rappels}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold w-16">Total</span>
                    <div className="flex-1 h-5 bg-bleu rounded text-white text-[11px] font-bold flex items-center justify-end pr-2">
                      {i.totalCallbacks}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold w-16">RDV</span>
                    <div
                      className="h-5 bg-violet-500 rounded text-white text-[11px] font-bold flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(i.current.rdvRate, 10)}%` }}
                    >
                      {i.current.rdvs} ({i.current.rdvRate}%)
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold w-16">Ventes</span>
                    <div
                      className="h-5 bg-green-500 rounded text-white text-[11px] font-bold flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(i.current.salesRate, 10)}%` }}
                    >
                      {i.current.sales} ({i.current.salesRate}%)
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold w-16">Marge</span>
                    <div className="flex-1 text-right text-sm font-nunito font-extrabold text-bleu">
                      {formatEuros(i.current.margin)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ======== TABLEAU PAR TRANCHE ======== */}
          <div className="mx-5 mt-5">
            <p className="text-xs uppercase font-semibold text-gray-500 mb-2">Performance par tranche</p>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-[1fr_48px_64px_60px] gap-1.5 px-3 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                <span>Canal</span>
                <span className="text-right">Vol.</span>
                <span className="text-right text-green-700">Vtes</span>
                <span className="text-right">Marge</span>
              </div>
              <div className="divide-y divide-gray-100">
                {i.distribution.map((b) => {
                  const color = BUCKET_COLORS[b.key]?.dot ?? "bg-gray-400";
                  const ventesPct = b.rappels > 0 ? Math.round((b.ventes / b.rappels) * 100) : 0;
                  return (
                    <div key={b.key} className="grid grid-cols-[1fr_48px_64px_60px] gap-1.5 px-3 py-2.5 items-center">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`}></span>
                        <span className="text-base font-semibold truncate">{b.label}</span>
                      </div>
                      <span className="text-base font-bold text-gray-700 text-right">{b.rappels}</span>
                      <span className="text-base font-bold text-green-600 text-right">
                        {b.ventes}
                        {b.rappels > 0 && (
                          <span className="text-[11px] block text-green-400 font-normal leading-none">{ventesPct}%</span>
                        )}
                      </span>
                      <span className="text-base font-extrabold text-bleu text-right">
                        {formatKEuros(b.marge)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-[1fr_48px_64px_60px] gap-1.5 px-3 py-2.5 bg-gray-50 border-t border-gray-200 items-center">
                <span className="text-base font-extrabold text-gray-700">Total</span>
                <span className="text-base font-extrabold text-gray-700 text-right">{i.totalCallbacks}</span>
                <span className="text-base font-extrabold text-green-600 text-right">
                  {i.current.sales}
                  <span className="text-[11px] block text-green-400 font-normal leading-none">{i.current.salesRate}%</span>
                </span>
                <span className="text-base font-extrabold text-bleu text-right">{formatKEuros(i.current.margin)}</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 italic px-1">
              % = taux de transformation en vente par tranche.
            </p>
          </div>

          {/* ======== COURBE D'IMPACT ======== */}
          <div className="mx-5 mt-5">
            <p className="text-xs uppercase font-semibold text-gray-500 mb-2">Taux de transformation par canal</p>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-4 mb-2 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-violet-500"></span>
                  <span className="font-semibold text-violet-700">Appels → RDV</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-green-500"></span>
                  <span className="font-semibold text-green-700">Appels → Ventes</span>
                </div>
              </div>
              <svg viewBox="0 0 320 190" className="w-full">
                <line x1="40" y1="20" x2="40" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="40" y1="150" x2="310" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                <text x="35" y="25" fill="#9ca3af" fontSize="9" textAnchor="end">70%</text>
                <text x="35" y="60" fill="#9ca3af" fontSize="9" textAnchor="end">50%</text>
                <text x="35" y="104" fill="#9ca3af" fontSize="9" textAnchor="end">25%</text>
                <text x="35" y="153" fill="#9ca3af" fontSize="9" textAnchor="end">0%</text>
                <line x1="40" y1="60" x2="310" y2="60" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,3" />
                <line x1="40" y1="104" x2="310" y2="104" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,3" />

                {(() => {
                  // 5 points alignés : direct + 4 tranches de délai
                  const n = i.distribution.length;
                  const xs = Array.from({ length: n }, (_, k) => 60 + k * ((290 - 60) / Math.max(1, n - 1)));
                  const rdvRates = i.distribution.map((b) =>
                    b.rappels > 0 ? Math.round((b.rdvs / b.rappels) * 100) : 0
                  );
                  const ventesRates = i.distribution.map((b) =>
                    b.rappels > 0 ? Math.round((b.ventes / b.rappels) * 100) : 0
                  );
                  const rdvPath = rdvRates.map((r, k) => `${k === 0 ? "M" : "L"} ${xs[k]} ${yFromPct(r)}`).join(" ");
                  const ventesPath = ventesRates.map((r, k) => `${k === 0 ? "M" : "L"} ${xs[k]} ${yFromPct(r)}`).join(" ");
                  return (
                    <>
                      <path d={rdvPath} stroke="#8b5cf6" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      {rdvRates.map((r, k) => (
                        <g key={`rdv${k}`}>
                          <circle cx={xs[k]} cy={yFromPct(r)} r="5" fill="#8b5cf6" />
                          <circle cx={xs[k]} cy={yFromPct(r)} r="2" fill="white" />
                          <text x={xs[k]} y={yFromPct(r) - 8} fill="#8b5cf6" fontSize="10" fontWeight="700" textAnchor="middle">{r}%</text>
                        </g>
                      ))}
                      <path d={ventesPath} stroke="#10b981" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      {ventesRates.map((r, k) => (
                        <g key={`v${k}`}>
                          <circle cx={xs[k]} cy={yFromPct(r)} r="5" fill="#10b981" />
                          <circle cx={xs[k]} cy={yFromPct(r)} r="2" fill="white" />
                          <text x={xs[k]} y={yFromPct(r) + 14} fill="#10b981" fontSize="10" fontWeight="700" textAnchor="middle">{r}%</text>
                        </g>
                      ))}
                      {i.distribution.map((b, k) => (
                        <g key={`x${k}`}>
                          <text x={xs[k]} y="168" fill="#374151" fontSize="9" fontWeight="700" textAnchor="middle">{b.label}</text>
                          <text x={xs[k]} y="180" fill="#6b7280" fontSize="8" textAnchor="middle">
                            {b.rappels} {b.key === "direct" ? "appel" : "rappel"}{b.rappels > 1 ? "s" : ""}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
              <p className="text-[11px] text-center text-gray-600 mt-2 pt-2 border-t border-gray-100">
                <strong>Tendance :</strong> décrocher direct ou rappeler sous 5 min = meilleure conversion. Plus le délai s&apos;allonge, plus les taux s&apos;effondrent.
              </p>
            </div>
          </div>

          {/* Insight final */}
          <div className="mx-5 mt-4 mb-6 bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-xs text-blue-900 leading-relaxed">
              💡 <strong>À retenir :</strong> vos rappels sous 5 min convertissent à
              {" "}<strong>{i.best.rdvRate}% en RDV</strong> et <strong>{i.best.salesRate}% en ventes</strong>.
              Chaque minute gagnée compte.
            </p>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
