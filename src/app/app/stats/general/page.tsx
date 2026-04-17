"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "../../_components/BottomNav";
import SearchButton from "../../_components/SearchButton";
import SearchBar from "../../_components/SearchBar";

type Period = "day" | "week" | "month" | "all";

type StatsResponse = {
  period: Period;
  marginRecovered: number;
  salesCount: number;
  conversionRate: number;
  callbacksDone: number;
  callbackRate: number;
  avgDelayMin: number;
  appointmentsCount: number;
  byDay: { day: string; count: number; isToday?: boolean }[];
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

export default function StatsGeneralPage() {
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

  const maxCount = stats ? Math.max(...stats.byDay.map((d) => d.count), 1) : 1;
  const appointmentShare = stats && stats.callbacksDone > 0
    ? Math.round((stats.appointmentsCount / stats.callbacksDone) * 100)
    : 0;

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
        <h1 className="text-xl font-nunito font-extrabold">Stats générales</h1>
        <p className="text-xs opacity-80">{periodSubtitle[period]}</p>
      </div>

      <SearchBar />

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
          {/* Hero : Marge récupérée */}
          <div className="px-5 pt-5">
            <div className="bg-gradient-to-br from-orange to-orange-dark text-white rounded-2xl p-5 shadow-lg">
              <p className="text-xs uppercase font-bold opacity-90 tracking-wider">Marge récupérée</p>
              <p className="text-5xl font-nunito font-extrabold mt-1">
                {stats.marginRecovered.toLocaleString("fr-FR")} <span className="text-2xl">€</span>
              </p>
              <p className="text-xs opacity-90 mt-2">
                Estimation : {stats.salesCount} vente{stats.salesCount > 1 ? "s" : ""} × 2 500 € de marge moyenne
              </p>
            </div>
          </div>

          {/* 6 KPI */}
          <div className="p-5 grid grid-cols-2 gap-3">
            <KPI label="Ventes conclues" value={String(stats.salesCount)} color="text-green-600" />
            <KPI label="Taux transfo" value={`${stats.conversionRate}%`} color="text-bleu" />
            <KPI label="Rappels faits" value={String(stats.callbacksDone)} color="text-green-600" />
            <KPI label="Taux de rappel" value={`${stats.callbackRate}%`} color="text-bleu" />
            <KPI label="Délai moyen" value={`${stats.avgDelayMin} min`} color="text-orange" />
            <KPI
              label="RDV pris"
              value={String(stats.appointmentsCount)}
              color="text-bleu"
              subtitle={stats.callbacksDone > 0 ? `${appointmentShare}% des rappels` : ""}
            />
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
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
      <p className={`text-3xl font-nunito font-extrabold mt-1 ${color}`}>{value}</p>
      {subtitle && <p className="text-[11px] text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
