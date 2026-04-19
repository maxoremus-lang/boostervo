"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ProspectCard from "../_components/ProspectCard";
import BottomNav from "../_components/BottomNav";
import SearchButton from "../_components/SearchButton";
import SearchBar from "../_components/SearchBar";
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
  done: "Traités",
  all: "",
};

type Period = "day" | "week" | "month" | "all";
const PERIOD_LABELS: Record<Period, string> = {
  day: "aujourd'hui",
  week: "7 derniers jours",
  month: "30 derniers jours",
  all: "",
};

const filters: { key: Filter; label: string }[] = [
  { key: "urgent", label: "Urgents" },
  { key: "todo", label: "À faire" },
  { key: "in_progress", label: "En cours" },
  { key: "done", label: "Traités" },
  { key: "all", label: "Tous" },
];

type ApiResponse = {
  prospects: Prospect[];
  counts: Record<Filter, number>;
  byStatus: Record<CallbackStatus, number>;
};

// Mapping statut précis → groupe parent (pour savoir quelle barre de sous-filtres afficher)
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

/** Chip de sous-filtre avec état actif/inactif */
function SubFilterChip({
  label, count, active, onClick, colorClasses, activeClasses,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  colorClasses: string;
  activeClasses: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{ WebkitTapHighlightColor: "transparent" }}
      className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
        active
          ? `${activeClasses} shadow-md`
          : `${colorClasses} hover:opacity-80`
      }`}
    >
      <span className={active ? "text-white" : ""}>{label} · {count}</span>
    </button>
  );
}

export default function RappelsListPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("urgent");
  const [statusExact, setStatusExact] = useState<CallbackStatus | null>(null);
  const [period, setPeriod] = useState<Period | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backTo, setBackTo] = useState<string | null>(null);
  const filtersBarRef = useRef<HTMLDivElement>(null);

  // Au montage, lire ?filter=..., ?status=..., ?from=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Filtre par statut précis (prioritaire)
    const s = params.get("status") as CallbackStatus | null;
    if (s && STATUS_LABELS[s]) {
      setStatusExact(s);
      // On définit aussi le groupe parent pour afficher la bonne barre de sous-filtres
      const group = STATUS_TO_GROUP[s];
      if (group) setActiveFilter(group);
    } else {
      // Sinon filtre par groupe
      const f = params.get("filter");
      if (f && ["urgent", "todo", "in_progress", "done", "all"].includes(f)) {
        setActiveFilter(f as Filter);
      }
    }

    // Période (propagée depuis la page Stats pour cohérence des compteurs)
    const p = params.get("period") as Period | null;
    if (p && ["day", "week", "month", "all"].includes(p) && p !== "all") {
      setPeriod(p);
    }

    const from = params.get("from");
    if (from === "stats") setBackTo("/app/stats/par-statut");
  }, []);

  // Centrer le bouton de filtre actif dans la barre scrollable
  useEffect(() => {
    if (statusExact) return; // en mode statut précis, aucun bouton n'est actif
    const bar = filtersBarRef.current;
    if (!bar) return;
    const btn = bar.querySelector<HTMLButtonElement>(`[data-filter-key="${activeFilter}"]`);
    if (btn) {
      btn.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }
  }, [activeFilter, statusExact]);

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
        if (period) params.set("period", period);
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
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(handler);
    };
  }, [activeFilter, statusExact, period]);

  const prospects = data?.prospects ?? [];
  const counts = data?.counts ?? { urgent: 0, todo: 0, in_progress: 0, done: 0, all: 0 };
  const unknownCount = prospects.filter((p) => !p.isKnown).length;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-bleu px-5 pt-6 pb-5 text-white">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
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
                : `${counts.all} rappels · ${counts.todo} à faire · ${unknownCount} non qualifiés`}
            </p>
          </div>
          <SearchButton />
        </div>
      </div>

      <SearchBar />

      {/* Bandeau statut actif (quand on vient d'une stat par statut précis) */}
      {statusExact && (
        <div className="flex items-center justify-between px-5 py-2 bg-violet-50 border-b border-violet-100 gap-3">
          {backTo ? (
            <Link
              href={backTo}
              className="flex items-center gap-1.5 text-[11px] font-bold text-violet-700 active:opacity-60 flex-shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Retour aux stats
            </Link>
          ) : (
            <button
              onClick={() => { setStatusExact(null); setPeriod(null); }}
              className="flex items-center gap-1 text-[11px] font-bold text-violet-700 active:opacity-60 flex-shrink-0"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Effacer
            </button>
          )}
          <span className="text-xs font-semibold text-violet-900 truncate text-right">
            <span className="font-extrabold">{STATUS_LABELS[statusExact]}</span>
            {period && <span className="opacity-70"> · {PERIOD_LABELS[period]}</span>}
          </span>
        </div>
      )}

      {/* Filtres par groupe */}
      <div ref={filtersBarRef} className="flex px-5 py-3 bg-white border-b border-gray-100 overflow-x-auto gap-2 scroll-smooth">
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
              data-filter-key={f.key}
              onClick={() => {
                setStatusExact(null); // cliquer un groupe efface le filtre statut précis
                setPeriod(null); // et efface la période héritée des stats
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

      {/* Sous-filtres pour "À faire" : Tous / À recontacter / Reporté / Injoignable */}
      {activeFilter === "todo" && data?.byStatus && (
        <div className="flex px-5 py-2 bg-gray-50 border-b border-gray-100 gap-2 overflow-x-auto">
          <SubFilterChip
            label="Tous"
            count={counts.todo}
            active={!statusExact}
            onClick={() => { setStatusExact(null); setPeriod(null); }}
            colorClasses="bg-white text-gray-700 border border-gray-300"
            activeClasses="bg-gray-800 text-white border-gray-800"
          />
          <SubFilterChip
            label="🔔 À recontacter"
            count={data.byStatus.pending}
            active={statusExact === "pending"}
            onClick={() => { setStatusExact(statusExact === "pending" ? null : "pending"); setPeriod(null); }}
            colorClasses="bg-orange-50 text-orange-700 border border-orange-200"
            activeClasses="bg-orange-600 text-white border-orange-600"
          />
          <SubFilterChip
            label="⏱ Reporté"
            count={data.byStatus.postponed}
            active={statusExact === "postponed"}
            onClick={() => { setStatusExact(statusExact === "postponed" ? null : "postponed"); setPeriod(null); }}
            colorClasses="bg-blue-50 text-blue-700 border border-blue-200"
            activeClasses="bg-blue-600 text-white border-blue-600"
          />
          <SubFilterChip
            label="📵 Injoignable"
            count={data.byStatus.unreachable}
            active={statusExact === "unreachable"}
            onClick={() => { setStatusExact(statusExact === "unreachable" ? null : "unreachable"); setPeriod(null); }}
            colorClasses="bg-amber-50 text-amber-800 border border-amber-200"
            activeClasses="bg-amber-600 text-white border-amber-600"
          />
        </div>
      )}

      {/* Sous-filtres pour "En cours" : Tous / RDV pris / Essai / Devis envoyé */}
      {activeFilter === "in_progress" && data?.byStatus && (
        <div className="flex px-5 py-2 bg-gray-50 border-b border-gray-100 gap-2 overflow-x-auto">
          <SubFilterChip
            label="Tous"
            count={counts.in_progress}
            active={!statusExact}
            onClick={() => { setStatusExact(null); setPeriod(null); }}
            colorClasses="bg-white text-gray-700 border border-gray-300"
            activeClasses="bg-gray-800 text-white border-gray-800"
          />
          <SubFilterChip
            label="📅 RDV pris"
            count={data.byStatus.appointment}
            active={statusExact === "appointment"}
            onClick={() => { setStatusExact(statusExact === "appointment" ? null : "appointment"); setPeriod(null); }}
            colorClasses="bg-violet-50 text-violet-700 border border-violet-200"
            activeClasses="bg-violet-600 text-white border-violet-600"
          />
          <SubFilterChip
            label="🚗 Essai"
            count={data.byStatus.test_drive}
            active={statusExact === "test_drive"}
            onClick={() => { setStatusExact(statusExact === "test_drive" ? null : "test_drive"); setPeriod(null); }}
            colorClasses="bg-violet-50 text-violet-700 border border-violet-200"
            activeClasses="bg-violet-600 text-white border-violet-600"
          />
          <SubFilterChip
            label="📄 Devis envoyé"
            count={data.byStatus.quote_sent}
            active={statusExact === "quote_sent"}
            onClick={() => { setStatusExact(statusExact === "quote_sent" ? null : "quote_sent"); setPeriod(null); }}
            colorClasses="bg-violet-50 text-violet-700 border border-violet-200"
            activeClasses="bg-violet-600 text-white border-violet-600"
          />
        </div>
      )}

      {/* Sous-filtres pour "Traités" : Tous / Vendus / Pas intéressés */}
      {activeFilter === "done" && data?.byStatus && (
        <div className="flex px-5 py-2 bg-gray-50 border-b border-gray-100 gap-2 overflow-x-auto">
          <SubFilterChip
            label="Tous"
            count={counts.done}
            active={!statusExact}
            onClick={() => { setStatusExact(null); setPeriod(null); }}
            colorClasses="bg-white text-gray-700 border border-gray-300"
            activeClasses="bg-gray-800 text-white border-gray-800"
          />
          <SubFilterChip
            label="✅ Vendus"
            count={data.byStatus.sold}
            active={statusExact === "sold"}
            onClick={() => { setStatusExact(statusExact === "sold" ? null : "sold"); setPeriod(null); }}
            colorClasses="bg-emerald-50 text-emerald-800 border border-emerald-200"
            activeClasses="bg-emerald-600 text-white border-emerald-600"
          />
          <SubFilterChip
            label="❌ Pas intéressés"
            count={data.byStatus.not_interested}
            active={statusExact === "not_interested"}
            onClick={() => { setStatusExact(statusExact === "not_interested" ? null : "not_interested"); setPeriod(null); }}
            colorClasses="bg-gray-100 text-gray-600 border border-gray-200"
            activeClasses="bg-gray-800 text-white border-gray-800"
          />
        </div>
      )}

      {/* Liste */}
      <div className="px-5 py-4 space-y-3">
        {loading ? (
          <p className="text-center text-gray-400 text-sm py-8">Chargement…</p>
        ) : error ? (
          <p className="text-center text-red-600 text-sm py-8">{error}</p>
        ) : prospects.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">Aucun rappel ne correspond</p>
        ) : (
          prospects.map((p, i) => {
            // Construit le contexte de navigation depuis la liste
            const parts: string[] = [];
            if (statusExact) parts.push(`status=${statusExact}`);
            else parts.push(`filter=${activeFilter}`);
            if (period) parts.push(`period=${period}`);
            const ctx = parts.join("&");

            return (
              <div key={p.id} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 pt-3 text-right text-xs font-bold text-gray-400 tabular-nums">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <ProspectCard prospect={p} contextParams={ctx} />
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}
