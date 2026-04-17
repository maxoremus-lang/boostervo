"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ProspectCard from "../_components/ProspectCard";
import BottomNav from "../_components/BottomNav";
import type { Prospect, CallbackStatus } from "../_lib/types";

type Filter = "urgent" | "todo" | "in_progress" | "done" | "all";

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

const FILTER_LABELS: Record<Filter, string> = {
  urgent: "Urgents",
  todo: "À faire",
  in_progress: "En cours",
  done: "Terminés",
  all: "",
};

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
  const [statusExact, setStatusExact] = useState<CallbackStatus | null>(null);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backTo, setBackTo] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Au montage, lire ?filter=..., ?status=..., ?from=... et ?focus=search
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Filtre par statut précis (prioritaire)
    const s = params.get("status") as CallbackStatus | null;
    if (s && STATUS_LABELS[s]) {
      setStatusExact(s);
    } else {
      // Sinon filtre par groupe
      const f = params.get("filter");
      if (f && ["urgent", "todo", "in_progress", "done", "all"].includes(f)) {
        setActiveFilter(f as Filter);
      }
    }

    const from = params.get("from");
    if (from === "stats") setBackTo("/app/stats/par-statut");

    // Auto-focus sur la recherche (depuis l'icône loupe du dashboard)
    if (params.get("focus") === "search") {
      setTimeout(() => {
        searchRef.current?.focus();
        searchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, []);

  // Fetch à chaque changement de filtre ou de recherche (débounced)
  useEffect(() => {
    let cancelled = false;
    const handler = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (statusExact) {
          params.set("status", statusExact);
        } else {
          params.set("filter", activeFilter);
        }
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
  }, [activeFilter, statusExact, search]);

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
        <h1 className="text-xl font-nunito font-extrabold">
          Mes rappels
          {statusExact && (
            <span className="font-semibold opacity-90"> — {STATUS_LABELS[statusExact]}</span>
          )}
          {!statusExact && activeFilter !== "all" && (
            <span className="font-semibold opacity-90"> — {FILTER_LABELS[activeFilter]}</span>
          )}
        </h1>
        <p className="text-xs opacity-80">
          {statusExact
            ? `${prospects.length} prospect${prospects.length > 1 ? "s" : ""}`
            : `${counts.all} rappels · ${counts.todo} à faire · ${unknownCount} inconnus`}
        </p>
      </div>

      {/* Bandeau statut actif (quand on vient d'une stat par statut précis) */}
      {statusExact && (
        <div className="flex items-center justify-between px-5 py-2 bg-violet-50 border-b border-violet-100">
          <span className="text-xs font-semibold text-violet-900">
            Filtre actif : <span className="font-extrabold">{STATUS_LABELS[statusExact]}</span>
          </span>
          <button
            onClick={() => setStatusExact(null)}
            className="text-[11px] font-bold text-violet-700 active:opacity-60 flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Effacer
          </button>
        </div>
      )}

      {/* Filtres par groupe */}
      <div className="flex px-5 py-3 bg-white border-b border-gray-100 overflow-x-auto gap-2">
        {filters.map((f) => {
          const isActive = !statusExact && activeFilter === f.key;
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
              onClick={() => {
                setStatusExact(null); // cliquer un groupe efface le filtre statut précis
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
      </div>

      {/* Recherche */}
      <div className="px-5 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchRef}
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
