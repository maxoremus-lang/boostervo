"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "../../_components/BottomNav";
import SearchButton from "../../_components/SearchButton";
import SearchBar from "../../_components/SearchBar";

type Period = "day" | "week" | "month" | "all" | "custom";

type StatsResponse = {
  period: Period;
  marginRecovered: number;
  salesCount: number;
  conversionRate: number;
  callbacksDone: number;
  callbackRate: number;
  avgDelayMin: number;
  appointmentsCount: number;
  directPickupsCount: number;
  salesFromDirect: number;
  salesRateDirect: number;
  salesFromRappel: number;
  salesRateRappel: number;
  incomingCalls: number;
  prospectsWithMissed: number;
  missedNotAnswered: number;
  unreachableCount: number;
  stillToCall: number;
  appointmentsFromRappel: number;
  appointmentsFromDirect: number;
  marginGainedByDirect: number;
  marginPerDirectCall: number;
  globalConversionRate: number;
  potentialMarginMissed: number;
  displayHypoSales: number;
  displayAdditionalSales: number;
  marginLostPerMissed: number;
  byDay: { day: string; count: number; isToday?: boolean }[];
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

/**
 * Formate un délai en minutes vers "45 min" / "1h30" / "2j 4h".
 * Au-delà de 24h on passe en jours pour rester lisible.
 */
function formatDelay(minutes: number): string {
  if (minutes <= 0) return "—";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) {
    return mins > 0 ? `${hours}h ${String(mins).padStart(2, "0")}` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}j ${remainingHours}h` : `${days}j`;
}

export default function StatsGeneralPage() {
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

  const maxCount = stats ? Math.max(...stats.byDay.map((d) => d.count), 1) : 1;

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
        <h1 className="text-xl font-nunito font-extrabold">Statistiques générales</h1>
        <p className="text-xs opacity-80">{headerSubtitle}</p>
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

        {/* Panneau date début / date fin */}
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
      ) : error || !stats ? (
        <p className="text-center text-red-600 text-sm py-12">{error ?? "Aucune donnée"}</p>
      ) : (
        <>
          {/* Hero : Marge générée */}
          <div className="px-5 pt-5">
            <div className="bg-gradient-to-br from-orange to-orange-dark text-white rounded-2xl p-5 shadow-lg">
              <p className="text-xs uppercase font-bold opacity-90 tracking-wider">Marge générée</p>
              <p className="text-5xl font-nunito font-extrabold mt-1">
                {stats.marginRecovered.toLocaleString("fr-FR")} <span className="text-2xl">€</span>
              </p>
              <p className="text-xs opacity-90 mt-2">
                Estimation : {stats.salesCount} vente{stats.salesCount > 1 ? "s" : ""} × 800 € de marge moyenne
              </p>
            </div>
          </div>

          {/* Parcours des appels entrants — entonnoir narratif */}
          <div className="px-5 mt-5">
            <h3 className="text-xs uppercase font-semibold text-gray-500 mb-2 tracking-wide">Parcours de vos appels entrants</h3>
            <p className="text-[11px] text-gray-500 mb-3">Ce qui s&apos;est passé quand vos prospects vous ont appelé.</p>

            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              {/* Étape 1 : Total reçus */}
              <FunnelStep
                iconBg="bg-bleu"
                iconText="total"
                number={stats.incomingCalls}
                label="Appels reçus"
                meta={`Total des appels entrants de prospects sur cette période`}
              />

              {/* Étape 2 : Décrochés immédiatement */}
              <FunnelStep
                iconBg="bg-green-600"
                iconText="direct"
                number={stats.directPickupsCount}
                outOf={stats.incomingCalls}
                label="Décrochés immédiatement"
                pctBadge={{ pct: stats.incomingCalls > 0 ? Math.round((stats.directPickupsCount / stats.incomingCalls) * 100) : 0, color: "green" }}
                barColor="bg-green-500"
                barPct={stats.incomingCalls > 0 ? (stats.directPickupsCount / stats.incomingCalls) * 100 : 0}
                conversion={{
                  label: "→ convertis en vente",
                  value: `${stats.salesFromDirect} vente${stats.salesFromDirect > 1 ? "s" : ""}`,
                  pct: stats.salesRateDirect,
                  pctColor: "green",
                }}
              />

              {/* Étape 3 : Rappelés avec succès */}
              <FunnelStep
                iconBg="bg-orange"
                iconText="rappel"
                number={stats.callbacksDone}
                outOf={stats.prospectsWithMissed}
                outOfLabel="manqués"
                label="Rappelés avec succès"
                pctBadge={{ pct: stats.callbackRate, color: "orange" }}
                barColor="bg-orange"
                barPct={stats.incomingCalls > 0 ? (stats.callbacksDone / stats.incomingCalls) * 100 : 0}
                conversion={{
                  label: "→ convertis en vente",
                  value: `${stats.salesFromRappel} vente${stats.salesFromRappel > 1 ? "s" : ""}`,
                  pct: stats.salesRateRappel,
                  pctColor: "orange",
                }}
                extraRow={{
                  label: "Délai moyen de rappel",
                  value: formatDelay(stats.avgDelayMin),
                }}
              />

              {/* Étape 4 : Non encore rappelés ou injoignables */}
              <FunnelStep
                iconBg="bg-red-600"
                iconText="miss"
                number={stats.missedNotAnswered}
                outOf={stats.prospectsWithMissed}
                outOfLabel="manqués"
                label="Non encore rappelés ou injoignables"
                barColor="bg-red-500"
                barPct={stats.incomingCalls > 0 ? (stats.missedNotAnswered / stats.incomingCalls) * 100 : 0}
                meta={`${stats.stillToCall} en attente, ${stats.unreachableCount} injoignable${stats.unreachableCount > 1 ? "s" : ""} après plusieurs tentatives`}
              />
            </div>
          </div>

          {/* Callout : impact de la réactivité — manque à gagner sur les rappels */}
          {stats.potentialMarginMissed > 500 && stats.salesRateDirect > stats.salesRateRappel && (() => {
            // Arrondis "digestes" pour rester stable entre périodes :
            //  - ratio direct/rappel au plus proche 0.5 ("≈ 2× plus", "≈ 1,5× plus")
            //  - manque total à la centaine
            //  - manque par appel à la dizaine
            const rawRatio = stats.salesRateDirect / Math.max(1, stats.salesRateRappel);
            const roundedRatioHalf = Math.round(rawRatio * 2) / 2;
            let ratioLabel: string;
            if (rawRatio < 1.2) ratioLabel = "un peu plus";
            else if (roundedRatioHalf === 1.5) ratioLabel = "1,5× plus";
            else ratioLabel = `${roundedRatioHalf.toString().replace(".", ",")}× plus`;
            const roundTo = (n: number, step: number) => Math.round(n / step) * step;
            const displayTotal = roundTo(stats.potentialMarginMissed, 100);
            const displayPerCall = roundTo(stats.marginLostPerMissed, 10);
            return (
              <div className="px-5 mt-5">
                <div className="bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-400 rounded-2xl p-4">
                  <p className="text-[10px] uppercase font-extrabold tracking-widest text-amber-900">⚡ Impact de la réactivité</p>
                  <p className="text-sm font-bold text-amber-900 mt-2 leading-snug">
                    Décrocher dans l&apos;instant, c&apos;est <b>{ratioLabel} de ventes</b> qu&apos;un rappel.
                  </p>
                  <p className="text-3xl font-nunito font-extrabold text-amber-900 mt-2">
                    ≈ {displayTotal.toLocaleString("fr-FR")} €
                  </p>
                  <p className="text-[11px] text-amber-900 mt-1 leading-relaxed">
                    Manque à gagner estimé sur cette période. Chaque appel manqué que vous rappelez coûte en moyenne{" "}
                    <b>≈ {displayPerCall} €</b> de marge non réalisée.
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Détail : taux de conversion en vente par canal */}
          <div className="px-5 mt-5">
            <h3 className="text-xs uppercase font-semibold text-gray-500 mb-2 tracking-wide">Détail</h3>
            <div className="grid grid-cols-2 gap-3">
              <KPI
                label="Tx rappels / ventes"
                value={`${stats.salesRateRappel}%`}
                color="text-orange-700"
                subtitle={`${stats.salesFromRappel} vente${stats.salesFromRappel > 1 ? "s" : ""} / ${stats.callbacksDone} rappel${stats.callbacksDone > 1 ? "s" : ""}`}
              />
              <KPI
                label="Tx décrochés / ventes"
                value={`${stats.salesRateDirect}%`}
                color="text-green-700"
                subtitle={`${stats.salesFromDirect} vente${stats.salesFromDirect > 1 ? "s" : ""} / ${stats.directPickupsCount} décroché${stats.directPickupsCount > 1 ? "s" : ""}`}
              />
            </div>
          </div>

          {/* Graph 7 jours */}
          <div className="px-5">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-nunito font-bold text-sm mb-3">Rappels effectués sur 7 jours</h3>
              <div className="flex items-end justify-between h-32 gap-2">
                {stats.byDay.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-500 font-semibold">{d.count > 0 ? d.count : ""}</span>
                    <div
                      className={`w-full rounded-t ${d.isToday ? "bg-orange" : "bg-bleu"}`}
                      style={{ height: `${Math.max((d.count / maxCount) * 100, 5)}%` }}
                    />
                    <span className={`text-[10px] ${d.isToday ? "text-orange font-bold" : "text-gray-500"}`}>{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}

function KPI({
  label,
  value,
  color,
  subtitle,
}: {
  label: string;
  value: string;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">{label}</p>
      <p className={`text-2xl font-nunito font-extrabold mt-1 ${color}`}>{value}</p>
      {subtitle && <p className="text-[10px] text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function FunnelStep({
  iconBg,
  iconText,
  number,
  outOf,
  outOfLabel,
  label,
  pctBadge,
  barColor,
  barPct,
  meta,
  conversion,
  extraRow,
}: {
  iconBg: string;
  iconText: "total" | "direct" | "rappel" | "miss";
  number: number;
  outOf?: number;
  outOfLabel?: string;
  label: string;
  pctBadge?: { pct: number; color: "green" | "orange" | "red" };
  barColor?: string;
  barPct?: number;
  meta?: string;
  conversion?: { label: string; value: string; pct: number; pctColor: "green" | "orange" | "red" };
  extraRow?: { label: string; value: string };
}) {
  const badgeColors: Record<"green" | "orange" | "red", string> = {
    green: "bg-green-100 text-green-800",
    orange: "bg-orange-100 text-orange-800",
    red: "bg-red-100 text-red-800",
  };
  const icons: Record<"total" | "direct" | "rappel" | "miss", string> = {
    total: "☎",
    direct: "✓",
    rappel: "⟲",
    miss: "✗",
  };
  return (
    <div className="py-3 border-b border-dashed border-gray-200 last:border-b-0 last:pb-0 first:pt-0">
      <div className="flex items-center gap-3">
        <div className={`${iconBg} w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0`}>
          {icons[iconText]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xl font-nunito font-extrabold text-gray-900">
            {number}
            {outOf !== undefined && (
              <span className="text-xs text-gray-400 font-bold ml-1.5">/ {outOf}{outOfLabel ? ` ${outOfLabel}` : ""}</span>
            )}
          </p>
          <p className="text-[13px] font-bold text-gray-700 flex items-center gap-2 flex-wrap">
            {label}
            {pctBadge && (
              <span className={`${badgeColors[pctBadge.color]} px-2 py-0.5 rounded-full text-[11px] font-bold`}>
                {pctBadge.pct}%
              </span>
            )}
          </p>
        </div>
      </div>
      {barPct !== undefined && barColor && (
        <div className="ml-10 mt-2">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${barColor} rounded-full`} style={{ width: `${Math.min(100, Math.max(0, barPct))}%` }} />
          </div>
        </div>
      )}
      {meta && <p className="text-[11px] text-gray-500 ml-10 mt-1.5">{meta}</p>}
      {conversion && (
        <div className="ml-10 mt-2 flex items-center justify-between text-xs">
          <span className="text-gray-500">{conversion.label}</span>
          <span className="font-bold text-gray-900">
            {conversion.value}
            <span className={`${badgeColors[conversion.pctColor]} ml-1.5 px-2 py-0.5 rounded-full text-[11px]`}>
              {conversion.pct}%
            </span>
          </span>
        </div>
      )}
      {extraRow && (
        <div className="ml-10 mt-1 flex items-center justify-between text-xs">
          <span className="text-gray-500">{extraRow.label}</span>
          <span className="font-bold text-gray-900">{extraRow.value}</span>
        </div>
      )}
    </div>
  );
}
