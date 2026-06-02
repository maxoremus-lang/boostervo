"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Stats = {
  totalVisits: number;
  uniqueVisitors: number;
  days: { date: string; visits: number; unique: number }[];
  topSources: { source: string; visits: number }[];
  byDevice: { device: string; visits: number }[];
};

function dayLabel(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export default function AdminPageViewsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/page-views");
        if (res.status === 403) {
          setLoadError("Accès réservé aux administrateurs.");
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setLoadError("Erreur de chargement");
          setLoading(false);
          return;
        }
        setStats(await res.json());
        setLoading(false);
      } catch {
        setLoadError("Erreur réseau");
        setLoading(false);
      }
    })();
  }, []);

  const maxDay = stats ? Math.max(1, ...stats.days.map((d) => d.visits)) : 1;
  const totalDevices = stats ? stats.byDevice.reduce((s, d) => s + d.visits, 0) : 0;

  return (
    <div className="pb-16">
      <div className="bg-bleu px-5 pt-6 pb-6 text-white">
        <Link
          href="/app/profil"
          className="text-xs opacity-80 inline-flex items-center gap-1 mb-2"
        >
          ← Retour profil
        </Link>
        <h1 className="text-xl font-nunito font-extrabold">Fréquentation du site</h1>
        <p className="text-xs opacity-80 mt-1">
          Visites des pages publiques de boostervo.fr (home, tarifs, VSL…).
        </p>
      </div>

      <div className="px-5 mt-4 space-y-4">
        {loading && <p className="text-center text-gray-400 text-sm py-6">Chargement…</p>}
        {loadError && <p className="text-center text-red-600 text-sm py-6">{loadError}</p>}

        {!loading && !loadError && stats && (
          <>
            {/* Totaux */}
            <div className="bg-white rounded-2xl shadow-sm p-4 grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Visites totales
                </p>
                <p className="text-2xl font-nunito font-extrabold text-bleu mt-1">
                  {stats.totalVisits}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Visiteurs uniques
                </p>
                <p className="text-2xl font-nunito font-extrabold text-orange mt-1">
                  {stats.uniqueVisitors}
                </p>
              </div>
            </div>

            {/* Évolution 14 jours */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">
                14 derniers jours
              </p>
              <div className="flex items-end justify-between gap-1 h-28">
                {stats.days.map((d) => (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-bleu/80 rounded-t"
                      style={{ height: `${Math.round((d.visits / maxDay) * 90)}px` }}
                      title={`${d.visits} visite${d.visits > 1 ? "s" : ""} · ${d.unique} unique${d.unique > 1 ? "s" : ""}`}
                    />
                    <span className="text-[8px] text-gray-400 -rotate-45 origin-center whitespace-nowrap mt-1">
                      {dayLabel(d.date)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sources */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">
                Sources de trafic
              </p>
              {stats.topSources.length === 0 ? (
                <p className="text-sm text-gray-400">Aucune donnée.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {stats.topSources.map((s) => (
                    <li key={s.source} className="flex items-center justify-between py-2">
                      <span className="text-sm text-bleu truncate">{s.source}</span>
                      <span className="text-sm font-bold text-gray-700">{s.visits}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Appareils */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">
                Appareils
              </p>
              {stats.byDevice.length === 0 ? (
                <p className="text-sm text-gray-400">Aucune donnée.</p>
              ) : (
                <ul className="space-y-2">
                  {stats.byDevice.map((d) => (
                    <li key={d.device}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize text-bleu">{d.device}</span>
                        <span className="font-bold text-gray-700">
                          {totalDevices > 0 ? Math.round((d.visits / totalDevices) * 100) : 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-orange rounded-full"
                          style={{ width: `${totalDevices > 0 ? (d.visits / totalDevices) * 100 : 0}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
