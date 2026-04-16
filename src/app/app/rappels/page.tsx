"use client";

import { useState, useMemo } from "react";
import { prospects } from "../_lib/mockData";
import ProspectCard from "../_components/ProspectCard";
import BottomNav from "../_components/BottomNav";
import type { CallbackStatus } from "../_lib/types";

type Filter = "todo" | "in_progress" | "done" | "all";

const filters: { key: Filter; label: string; match: (s: CallbackStatus) => boolean }[] = [
  { key: "todo", label: "À faire", match: (s) => s === "pending" || s === "postponed" || s === "unreachable" },
  { key: "in_progress", label: "En cours", match: (s) => s === "appointment" || s === "test_drive" || s === "quote_sent" },
  { key: "done", label: "Terminés", match: (s) => s === "sold" || s === "not_interested" },
  { key: "all", label: "Tous", match: () => true },
];

export default function RappelsListPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("todo");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { todo: 0, in_progress: 0, done: 0, all: prospects.length };
    for (const p of prospects) {
      if (p.status === "pending" || p.status === "postponed" || p.status === "unreachable") c.todo++;
      else if (p.status === "appointment" || p.status === "test_drive" || p.status === "quote_sent") c.in_progress++;
      else if (p.status === "sold" || p.status === "not_interested") c.done++;
    }
    return c;
  }, []);

  const filtered = useMemo(() => {
    const filter = filters.find((f) => f.key === activeFilter)!;
    const s = search.trim().toLowerCase();
    return prospects
      .filter((p) => filter.match(p.status))
      .filter((p) => {
        if (!s) return true;
        return (
          p.phone.toLowerCase().includes(s) ||
          (p.name && p.name.toLowerCase().includes(s)) ||
          (p.vehicleInterest && p.vehicleInterest.toLowerCase().includes(s))
        );
      })
      .sort((a, b) => (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0));
  }, [activeFilter, search]);

  const unknownCount = prospects.filter((p) => !p.isKnown).length;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-bleu px-5 pt-6 pb-5 text-white">
        <h1 className="text-xl font-nunito font-extrabold">Mes rappels</h1>
        <p className="text-xs opacity-80">
          {prospects.length} rappels · {counts.todo} à faire · {unknownCount} inconnus
        </p>
      </div>

      {/* Filtres */}
      <div className="flex px-5 py-3 bg-white border-b border-gray-100 overflow-x-auto gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              activeFilter === f.key ? "bg-orange text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {f.label} · {counts[f.key]}
          </button>
        ))}
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
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">Aucun rappel ne correspond</p>
        ) : (
          filtered.map((p) => <ProspectCard key={p.id} prospect={p} />)
        )}
      </div>

      <BottomNav />
    </div>
  );
}
