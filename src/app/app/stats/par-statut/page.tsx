"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "../../_components/BottomNav";
import SearchButton from "../../_components/SearchButton";
import SearchBar from "../../_components/SearchBar";
import type { CallbackStatus } from "../../_lib/types";

type Period = "day" | "week" | "month" | "custom";

type StatsResponse = {
  period: Period;
  byStatus: Record<CallbackStatus, number> & { urgent?: number };
  byStatusTotal: number;
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

const statusMeta: {
  key: CallbackStatus;
  label: string;
  bg: string;
  text: string;
  dot: string;
  group: "todo" | "in_progress" | "done";
}[] = [
  { key: "pending",        label: "À recontacter", bg: "bg-orange-50",  text: "text-orange-700",  dot: "bg-orange-500",  group: "todo" },
  { key: "postponed",      label: "Reporté",       bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500",    group: "todo" },
  { key: "unreachable",    label: "Injoignable",   bg: "bg-amber-50",   text: "text-amber-800",   dot: "bg-amber-500",   group: "todo" },
  { key: "appointment",    label: "RDV pris",      bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-500",  group: "in_progress" },
  { key: "test_drive",     label: "Essai",         bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-500",  group: "in_progress" },
  { key: "quote_sent",     label: "Devis envoyé",  bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-500",  group: "in_progress" },
  { key: "not_interested", label: "Pas intéressé", bg: "bg-gray-50",    text: "text-gray-600",    dot: "bg-gray-400",    group: "done" },
  { key: "sold",           label: "Vente conclue", bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-500", group: "done" },
];

// Résumés par groupe pour la vue haute
const groupSummary = [
  { key: "todo" as const,        label: "À faire",   statuses: ["pending", "postponed", "unreachable"],          color: "text-orange" },
  { key: "in_progress" as const, label: "En cours",  statuses: ["appointment", "test_drive", "quote_sent"],       color: "text-violet-700" },
  { key: "done" as const,        label: "Terminés",  statuses: ["sold", "not_interested"],                        color: "text-emerald-700" },
];

export default function StatsParStatutPage() {
  const [period, setPeriod] = useState<Period>("week");
  const [customFrom, setCustomFrom] = useState<string>(""); // YYYY-MM-DD
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
        <h1 className="text-xl font-nunito font-extrabold">Stats par statut</h1>
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
          {/* Bandeau "Urgents" (hors groupes — apparaissent dans leur propre onglet de l'app) */}
          {(stats.byStatus.urgent ?? 0) > 0 && (
            <div className="px-5 pt-5">
              <Link
                href={(() => {
                  const p = new URLSearchParams();
                  p.set("filter", "urgent");
                  if (period === "custom") {
                    if (customFrom) p.set("customFrom", customFrom);
                    if (customTo) p.set("customTo", customTo);
                  } else {
                    p.set("period", period);
                  }
                  p.set("from", "stats");
                  return `/app/rappels?${p.toString()}`;
                })()}
                className="flex items-center justify-between bg-red-50 border border-red-200 rounded-2xl p-3 active:opacity-70 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                  <span className="text-xs uppercase font-bold text-red-700">Urgents</span>
                </div>
                <span className="text-2xl font-nunito font-extrabold text-red-700">{stats.byStatus.urgent ?? 0}</span>
              </Link>
            </div>
          )}

          {/* Vue haute : résumé par groupe */}
          <div className="px-5 pt-5">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs uppercase font-semibold text-gray-500 mb-3">Vue d&apos;ensemble</p>
              <div className="grid grid-cols-3 gap-3">
                {groupSummary.map((g) => {
                  const total = g.statuses.reduce((sum, s) => sum + (stats.byStatus[s as CallbackStatus] ?? 0), 0);
                  const pct = stats.byStatusTotal > 0 ? Math.round((total / stats.byStatusTotal) * 100) : 0;
                  const linkParams = new URLSearchParams();
                  linkParams.set("filter", g.key);
                  if (period === "custom") {
                    if (customFrom) linkParams.set("customFrom", customFrom);
                    if (customTo) linkParams.set("customTo", customTo);
                  } else {
                    linkParams.set("period", period);
                  }
                  linkParams.set("from", "stats");
                  return (
                    <Link
                      key={g.key}
                      href={`/app/rappels?${linkParams.toString()}`}
                      className="flex flex-col items-center gap-0.5 active:opacity-70 transition"
                    >
                      <span className={`text-3xl font-nunito font-extrabold ${g.color}`}>{total}</span>
                      <span className="text-[11px] font-bold text-gray-600">{g.label}</span>
                      <span className="text-[10px] text-gray-400">{pct}%</span>
                    </Link>
                  );
                })}
              </div>
              <p className="text-[11px] text-gray-400 text-center mt-3">
                {stats.byStatusTotal} prospect{stats.byStatusTotal > 1 ? "s" : ""} au total
              </p>
            </div>
          </div>

          {/* Détail par statut (8 cases) */}
          <div className="px-5 mt-5">
            <p className="text-xs uppercase font-semibold text-gray-500 mb-2">Détail par statut</p>
            <div className="grid grid-cols-2 gap-2">
              {statusMeta.map((s) => {
                const count = stats.byStatus[s.key] ?? 0;
                const pct = stats.byStatusTotal > 0 ? Math.round((count / stats.byStatusTotal) * 100) : 0;
                const linkParams = new URLSearchParams();
                linkParams.set("status", s.key);
                if (period === "custom") {
                  if (customFrom) linkParams.set("customFrom", customFrom);
                  if (customTo) linkParams.set("customTo", customTo);
                } else {
                  linkParams.set("period", period);
                }
                linkParams.set("from", "stats");
                return (
                  <Link
                    key={s.key}
                    href={`/app/rappels?${linkParams.toString()}`}
                    className={`${s.bg} rounded-2xl p-3 flex flex-col gap-1 active:opacity-70 transition`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <span className={`text-[11px] font-bold uppercase tracking-wide ${s.text}`}>{s.label}</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className={`text-2xl font-nunito font-extrabold ${s.text}`}>{count}</span>
                      <span className={`text-[11px] font-semibold ${s.text} opacity-70`}>
                        {stats.byStatusTotal > 0 ? `${pct}%` : "—"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
            {stats.byStatusTotal === 0 && (
              <p className="text-xs text-gray-400 text-center mt-3">Aucun prospect sur cette période</p>
            )}
          </div>

          {/* Aide */}
          <div className="px-5 mt-5">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-[11px] text-blue-900">
                💡 Touche une case pour voir la liste des prospects du groupe correspondant.
              </p>
            </div>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
