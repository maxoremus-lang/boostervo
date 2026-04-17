"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "../../_components/BottomNav";
import type { CallbackStatus } from "../../_lib/types";

type Period = "day" | "week" | "month" | "all";

type StatsResponse = {
  period: Period;
  byStatus: Record<CallbackStatus, number>;
  byStatusTotal: number;
};

const periodLabels: Record<Period, string> = {
  day: "Jour",
  week: "7 j",
  month: "30 j",
  all: "Tous",
};

const periodSubtitle: Record<Period, string> = {
  day: "Aujourd'hui",
  week: "7 derniers jours",
  month: "30 derniers jours",
  all: "Depuis le début",
};

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
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/stats?period=${period}`);
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
  }, [period]);

  return (
    <div className="pb-24">
      {/* Header avec bouton retour */}
      <div className="bg-bleu px-5 pt-6 pb-5 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/app/stats" className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center" aria-label="Retour">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <p className="text-xs uppercase opacity-70 font-semibold">Statistiques</p>
        </div>
        <h1 className="text-xl font-nunito font-extrabold">Stats par statut</h1>
        <p className="text-xs opacity-80">{periodSubtitle[period]}</p>
      </div>

      {/* Sélecteur période */}
      <div className="flex gap-2 px-5 py-3 bg-white border-b border-gray-100 overflow-x-auto">
        {(Object.keys(periodLabels) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              period === p ? "bg-orange text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-400 text-sm py-12">Chargement…</p>
      ) : error || !stats ? (
        <p className="text-center text-red-600 text-sm py-12">{error ?? "Aucune donnée"}</p>
      ) : (
        <>
          {/* Vue haute : résumé par groupe */}
          <div className="px-5 pt-5">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs uppercase font-semibold text-gray-500 mb-3">Vue d&apos;ensemble</p>
              <div className="grid grid-cols-3 gap-3">
                {groupSummary.map((g) => {
                  const total = g.statuses.reduce((sum, s) => sum + (stats.byStatus[s as CallbackStatus] ?? 0), 0);
                  const pct = stats.byStatusTotal > 0 ? Math.round((total / stats.byStatusTotal) * 100) : 0;
                  return (
                    <Link
                      key={g.key}
                      href={`/app/rappels?filter=${g.key}`}
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
                return (
                  <Link
                    key={s.key}
                    href={`/app/rappels?filter=${s.group}`}
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
