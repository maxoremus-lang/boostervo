"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Funnel = {
  play: number;
  p25: number;
  p50: number;
  p75: number;
  p100: number;
};

type Stats = {
  overall: Funnel;
  bySlug: (Funnel & { slug: string })[];
  byPage: (Funnel & { page: string })[];
};

const STAGES: { key: keyof Funnel; label: string }[] = [
  { key: "play", label: "Démarrages" },
  { key: "p25", label: "25 %" },
  { key: "p50", label: "50 %" },
  { key: "p75", label: "75 %" },
  { key: "p100", label: "Fin (95 %)" },
];

function pct(n: number, base: number) {
  if (base <= 0) return "—";
  return Math.round((n / base) * 100) + " %";
}

function Funnel({ data }: { data: Funnel }) {
  const base = data.play || 0;
  return (
    <div className="space-y-2">
      {STAGES.map(({ key, label }) => {
        const value = data[key];
        const width = base > 0 ? Math.max(4, Math.round((value / base) * 100)) : 0;
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs font-semibold text-gray-500">
              {label}
            </span>
            <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
              <div
                className="h-full bg-orange rounded-full transition-all"
                style={{ width: `${width}%` }}
              />
            </div>
            <span className="w-24 shrink-0 text-right text-sm font-nunito font-bold text-bleu">
              {value}
              <span className="text-gray-400 font-normal text-xs ml-1">
                {key === "play" ? "" : pct(value, base)}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminVslStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/vsl-stats");
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

  return (
    <div className="pb-16">
      <div className="bg-bleu px-5 pt-6 pb-6 text-white">
        <Link
          href="/app/admin/links"
          className="text-xs opacity-80 inline-flex items-center gap-1 mb-2"
        >
          ← Liens courts
        </Link>
        <h1 className="text-xl font-nunito font-extrabold">Taux de lecture VSL</h1>
        <p className="text-xs opacity-80 mt-1">
          Visiteurs distincts ayant atteint chaque étape de la vidéo.
        </p>
      </div>

      <div className="px-5 mt-4 space-y-4">
        {loading && (
          <p className="text-center text-gray-400 text-sm py-6">Chargement…</p>
        )}

        {loadError && (
          <p className="text-center text-red-600 text-sm py-6">{loadError}</p>
        )}

        {!loading && !loadError && stats && (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                Tous canaux confondus
              </p>
              <div className="flex items-baseline gap-2 mb-4">
                <p className="text-2xl font-nunito font-extrabold text-orange">
                  {pct(stats.overall.p100, stats.overall.play)}
                </p>
                <p className="text-xs text-gray-500">vont jusqu&apos;au bout</p>
              </div>
              <Funnel data={stats.overall} />
            </div>

            {stats.bySlug.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-5 space-y-5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Par campagne (lien source)
                </p>
                {stats.bySlug.map((row) => (
                  <div key={row.slug}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-block text-[11px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                        {row.slug === "(direct)" ? "Accès direct" : `/${row.slug}`}
                      </span>
                      <span className="text-xs text-gray-500">
                        rétention {pct(row.p100, row.play)}
                      </span>
                    </div>
                    <Funnel data={row} />
                  </div>
                ))}
              </div>
            )}

            {stats.byPage.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-5 space-y-5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Par page
                </p>
                {stats.byPage.map((row) => (
                  <div key={row.page}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-block text-[11px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                        {row.page === "vsl-prive"
                          ? "/vsl-prive (gate email)"
                          : row.page === "home"
                          ? "Accueil (home)"
                          : "/vsl (public)"}
                      </span>
                      <span className="text-xs text-gray-500">
                        rétention {pct(row.p100, row.play)}
                      </span>
                    </div>
                    <Funnel data={row} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
