"use client";

import { useEffect, useState } from "react";
import ProspectCard from "../../_components/ProspectCard";
import SearchBar from "../../_components/SearchBar";
import SearchButton from "../../_components/SearchButton";
import ProspectFiche from "../_components/ProspectFiche";
import type { Prospect, CallbackStatus } from "../../_lib/types";

type Filter = "urgent" | "todo" | "in_progress" | "done" | "all";
type Period = "day" | "week" | "month" | "all";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "urgent", label: "Urgents" },
  { key: "todo", label: "À faire" },
  { key: "in_progress", label: "En cours" },
  { key: "done", label: "Traités" },
  { key: "all", label: "Tous" },
];

const PERIOD_SHORT: Record<Period, string> = {
  day: "Aujourd'hui",
  week: "7 j",
  month: "30 j",
  all: "Tout",
};

const STATUS_LABELS: Record<CallbackStatus, string> = {
  pending: "À recontacter",
  postponed: "Reporté",
  unreachable: "Injoignable",
  appointment: "RDV pris",
  test_drive: "Essai",
  quote_sent: "Devis envoyé",
  not_interested: "Pas intéressé",
  sold: "Vente conclue",
};

const STATUS_TO_GROUP: Record<CallbackStatus, Filter> = {
  pending: "todo",
  postponed: "todo",
  unreachable: "todo",
  appointment: "in_progress",
  test_drive: "in_progress",
  quote_sent: "in_progress",
  sold: "done",
  not_interested: "done",
};

type ApiResponse = {
  prospects: Prospect[];
  counts: Record<Filter, number>;
  byStatus: Record<CallbackStatus, number>;
};

export default function DesktopRappelsPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("urgent");
  const [statusExact, setStatusExact] = useState<CallbackStatus | null>(null);
  const [period, setPeriod] = useState<Period>("all");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const params = new URLSearchParams();
        if (statusExact) params.set("status", statusExact);
        else params.set("filter", activeFilter);
        if (period !== "all") params.set("period", period);
        const res = await fetch(`/api/prospects?${params.toString()}`);
        if (!res.ok) {
          if (!cancelled) {
            setError("Erreur de chargement");
            setLoading(false);
          }
          return;
        }
        const json: ApiResponse = await res.json();
        if (cancelled) return;
        setData(json);
        setError(null);
        setLoading(false);
        // Sélection automatique du premier prospect si rien de sélectionné ou si l'actuel n'est plus dans la liste
        const ids = json.prospects.map((p) => p.id);
        if (!selectedId || !ids.includes(selectedId)) {
          setSelectedId(ids[0] ?? null);
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
    // selectedId volontairement exclu : on ne veut pas re-fetch quand on change la sélection
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, statusExact, period]);

  const prospects = data?.prospects ?? [];
  const counts = data?.counts ?? { urgent: 0, todo: 0, in_progress: 0, done: 0, all: 0 };

  return (
    <div className="flex flex-col h-screen">
      {/* En-tête de page */}
      <div className="bg-bleu px-6 pt-5 pb-4 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-nunito font-extrabold">
              Vos rappels
              {statusExact && <span className="font-semibold opacity-90"> — {STATUS_LABELS[statusExact]}</span>}
            </h1>
            <p className="text-xs opacity-80">
              {counts.all} rappels · {counts.todo} à faire · {counts.urgent} urgents
            </p>
          </div>
          <SearchButton />
        </div>
      </div>

      <SearchBar />

      {/* Filtres groupes + période — barre horizontale unique */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const isActive = !statusExact && activeFilter === f.key;
          const isUrgent = f.key === "urgent";
          const count = counts[f.key];
          const classes = isUrgent
            ? isActive
              ? "bg-red-600 text-white"
              : count > 0
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-gray-100 text-gray-400"
            : isActive
              ? "bg-orange text-white"
              : "bg-gray-100 text-gray-600";
          return (
            <button
              key={f.key}
              onClick={() => {
                setStatusExact(null);
                setActiveFilter(f.key);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${classes}`}
            >
              {isUrgent && count > 0 && (
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white" : "bg-red-600"} animate-pulse`} />
              )}
              {f.label} · {count}
            </button>
          );
        })}

        <span className="mx-2 h-5 w-px bg-gray-200" />
        <span className="text-[10px] uppercase font-bold text-gray-500">Période</span>
        {(["day", "week", "month", "all"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition ${
              period === p ? "bg-bleu text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {PERIOD_SHORT[p]}
          </button>
        ))}
      </div>

      {/* Bandeau statut actif (vient de stats) */}
      {statusExact && (
        <div className="flex items-center justify-between px-6 py-2 bg-violet-50 border-b border-violet-100">
          <button
            onClick={() => setStatusExact(null)}
            className="flex items-center gap-1 text-[11px] font-bold text-violet-700 active:opacity-60"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Effacer
          </button>
          <span className="text-xs font-semibold text-violet-900">
            <span className="font-extrabold">{STATUS_LABELS[statusExact]}</span>
          </span>
        </div>
      )}

      {/* Split panel */}
      <div className="flex flex-1 min-h-0">
        {/* Liste à gauche */}
        <div className="w-[420px] border-r border-gray-200 bg-fond overflow-y-auto">
          <div className="px-4 py-4 space-y-3">
            {loading ? (
              <p className="text-center text-gray-400 text-sm py-8">Chargement…</p>
            ) : error ? (
              <p className="text-center text-red-600 text-sm py-8">{error}</p>
            ) : prospects.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">Aucun rappel ne correspond</p>
            ) : (
              prospects.map((p, i) => (
                <div key={p.id} className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 pt-3 text-right text-xs font-bold text-gray-400 tabular-nums">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <ProspectCard
                      prospect={p}
                      onSelect={() => setSelectedId(p.id)}
                      selected={selectedId === p.id}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panneau droit : fiche */}
        <div className="flex-1 min-w-0 bg-fond">
          {selectedId ? (
            <ProspectFiche key={selectedId} prospectId={selectedId} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <svg className="w-16 h-16 mb-4 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm font-semibold">Sélectionnez un prospect</p>
              <p className="text-xs mt-1">Cliquez sur une carte à gauche pour ouvrir la fiche.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
