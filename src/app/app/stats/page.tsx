"use client";

import { useState } from "react";
import { stats as mockStats } from "../_lib/mockData";
import BottomNav from "../_components/BottomNav";

type Period = "day" | "week" | "month";

export default function StatsPage() {
  const [period, setPeriod] = useState<Period>("week");
  const stats = mockStats;

  const maxCount = Math.max(...stats.byDay.map((d) => d.count), 1);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-bleu px-5 pt-6 pb-5 text-white">
        <h1 className="text-xl font-nunito font-extrabold">Mes statistiques</h1>
        <p className="text-xs opacity-80 capitalize">Cette {period === "day" ? "journée" : period === "week" ? "semaine" : "mois"}</p>
      </div>

      {/* Période */}
      <div className="flex gap-2 px-5 py-3 bg-white border-b border-gray-100">
        {(["day", "week", "month"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition ${
              period === p ? "bg-orange text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {p === "day" ? "Jour" : p === "week" ? "Semaine" : "Mois"}
          </button>
        ))}
      </div>

      {/* Hero KPI : Marge récupérée */}
      <div className="px-5 pt-5">
        <div className="bg-gradient-to-br from-orange to-orange-dark text-white rounded-2xl p-5 shadow-lg">
          <p className="text-xs uppercase font-bold opacity-90 tracking-wider">Marge récupérée</p>
          <p className="text-5xl font-nunito font-extrabold mt-1">
            {stats.marginRecovered.toLocaleString("fr-FR")} <span className="text-2xl">€</span>
          </p>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs opacity-90">Sur les rappels transformés en vente</p>
            <p className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded-full">
              ▲ +{stats.trends.marginRecovered}%
            </p>
          </div>
        </div>
      </div>

      {/* 6 KPI */}
      <div className="p-5 grid grid-cols-2 gap-3">
        <KPI label="Ventes conclues" value={String(stats.salesCount)} color="text-green-600" trend={`▲ +${stats.trends.salesCount}`} trendColor="text-green-600" />
        <KPI label="Taux transfo" value={`${stats.conversionRate}%`} color="text-bleu" trend={`▲ +${stats.trends.conversionRate} pts`} trendColor="text-green-600" />
        <KPI label="Rappels faits" value={String(stats.callbacksDone)} color="text-green-600" trend={`▲ +${stats.trends.callbacksDone}%`} trendColor="text-green-600" />
        <KPI label="Taux de rappel" value={`${stats.callbackRate}%`} color="text-bleu" trend={`▲ +${stats.trends.callbackRate} pts`} trendColor="text-green-600" />
        <KPI label="Délai moyen" value={`${stats.avgDelayMin}min`} color="text-orange" trend={`▼ ${stats.trends.avgDelayMin} min`} trendColor="text-green-600" />
        <KPI label="RDV pris" value={String(stats.appointmentsCount)} color="text-bleu" trend={`${Math.round((stats.appointmentsCount / stats.callbacksDone) * 100)}% des rappels`} trendColor="text-gray-500" />
      </div>

      {/* Graph */}
      <div className="px-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-nunito font-bold text-sm mb-3">Rappels par jour</h3>
          <div className="flex items-end justify-between h-32 gap-2">
            {stats.byDay.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
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

      {/* Classement équipe */}
      {stats.teamRanking && (
        <div className="px-5 mt-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-nunito font-bold text-sm text-gray-700">Classement équipe</h3>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Activable par admin</span>
          </div>
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
            {stats.teamRanking.map((m, i) => {
              const medalColor =
                i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-orange/20 text-orange" : "bg-gray-100 text-gray-600";
              return (
                <div key={i} className={`flex items-center gap-3 p-3 ${m.isCurrentUser ? "bg-orange/5" : ""}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${medalColor}`}>
                    {i + 1}
                  </span>
                  <p className="flex-1 text-sm font-semibold">
                    {m.name} {m.isCurrentUser && <span className="text-xs text-orange">(vous)</span>}
                  </p>
                  <p className="text-sm font-bold text-bleu">{m.count}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

function KPI({ label, value, color, trend, trendColor }: { label: string; value: string; color: string; trend: string; trendColor: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
      <p className={`text-3xl font-nunito font-extrabold mt-1 ${color}`}>{value}</p>
      <p className={`text-[11px] mt-1 ${trendColor}`}>{trend}</p>
    </div>
  );
}
