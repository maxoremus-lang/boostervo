"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProspectCard from "../_components/ProspectCard";
import BottomNav from "../_components/BottomNav";
import type { Prospect } from "../_lib/types";

type Filter = "urgent" | "todo" | "in_progress" | "done" | "all";

const filters: { key: Filter; label: string }[] = [
  { key: "urgent", label: "Urgents" },
  { key: "todo", label: "À faire" },
  { key: "in_progress", label: "En cours" },
  { key: "done", label: "Terminés" },
  { key: "all", label: "Tous" },
];

type ApiResponse = {
  prospects: Prospect[];
  counts: Record<Filter, number>;
};

export default function RappelsListPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("todo");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backTo, setBackTo] = useState<string | null>(null);

  // Au montage, lire ?filter=... et ?from=... de l'URL (ex: depuis la page Stats)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get("filter");
    if (f && ["urgent", "todo", "in_progress", "done", "all"].includes(f)) {
      setActiveFilter(f as Filter);
    }
    const from = params.get("from");
    if (from === "stats") setBackTo("/app/stats/par-statut");
  }, []);

  // Fetch à chaque changement de filtre ou de recherche (débounced)
  useEffect(() => {
    let cancelled = false;
    const handler = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ filter: activeFilter });
        if (search.trim()) params.set("search", search.trim());
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
      } catch {
        if (!cancelled) {
          setError("Erreur réseau");
          setLoading(false);
        }
      }
    }, search ? 250 : 0); // debounce 250ms uniquement pour la recherche

    return () => {
      cancelled = true;
      clearTimeout(handler);
    };
  }, [activeFilter, search]);

  const prospects = data?.prospects ?? [];
  const counts = data?.counts ?? { urgent: 0, todo: 0, in_progress: 0, done: 0, all: 0 };
  const unknownCount = prospects.filter((p) => !p.isKnown).length;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-bleu px-5 pt-6 pb-5 text-white">
        {backTo && (
          <Link
            href={backTo}
            className="inline-flex items-center gap-1.5 text-xs font-semibold opacity-80 active:opacity-60 mb-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux stats par statut
          </Link>
        )}
        <h1 className="text-xl font-nunito font-extrabold">Mes rappels</h1>
        <p className="text-xs opacity-80">
          {counts.all} rappels · {counts.todo} à faire · {unknownCount} inconnus
        </p>
      </div>

      {/* Filtres */}
      <div className="flex px-5 py-3 bg-white border-b border-gray-100 overflow-x-auto gap-2">
        {filters.map((f) => {
          const isActive = activeFilter === f.key;
          const isUrgent = f.key === "urgent";
          const count = counts[f.key];
          // Style spécial pour Urgents : rouge, avec point pulsant si count > 0
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
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${classes}`}
            >
              {isUrgent && count > 0 && (
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white" : "bg-red-600"} animate-pulse`} />
              )}
              {f.label} · {count}
            </button>
          );
        })}
      </div>

      {/* Recherche */}
      <div className="px-5 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (nom ou numéro)..."
            className="bg-transparent text-sm flex-1 focus:outline-none"
          />
        </div>
      </div>

      {/* Liste */}
      <div className="px-5 py-4 space-y-3">
        {loading ? (
          <p className="text-center text-gray-400 text-sm py-8">Chargement…</p>
        ) : error ? (
          <p className="text-center text-red-600 text-sm py-8">{error}</p>
        ) : prospects.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">Aucun rappel ne correspond</p>
        ) : (
          prospects.map((p) => <ProspectCard key={p.id} prospect={p} />)
        )}
      </div>

      <BottomNav />
    </div>
  );
}
