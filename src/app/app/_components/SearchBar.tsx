"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Prospect } from "../_lib/types";
import { StatusBadge, UrgentBadge, NewBadge } from "./Badge";
import { useSearchPanel } from "./Providers";

/**
 * Barre de recherche inline à placer juste SOUS le bandeau bleu de chaque page.
 * S'affiche quand l'utilisateur clique sur la loupe (SearchButton).
 * Les résultats s'affichent directement en dessous de la barre.
 */
export default function SearchBar() {
  const { open, setOpen } = useSearchPanel();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Prospect[] | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus à l'ouverture, reset à la fermeture
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults(null);
    }
  }, [open]);

  // Fetch débounced
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (!q) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(`/api/prospects?search=${encodeURIComponent(q)}`);
        if (!res.ok) {
          setResults([]);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setResults(data.prospects || []);
        setLoading(false);
      } catch {
        setResults([]);
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(handler);
  }, [query, open]);

  if (!open) return null;

  const handleResultClick = () => {
    setOpen(false);
  };

  return (
    <div className="bg-white border-b border-gray-100">
      {/* Input */}
      <div className="flex items-center gap-2 px-5 py-3">
        <div className="flex-1 flex items-center bg-gray-100 rounded-lg px-3 py-2">
          <svg className="w-4 h-4 text-gray-400 mr-2 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom, numéro, véhicule…"
            className="bg-transparent text-sm flex-1 focus:outline-none"
            autoComplete="off"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Effacer"
              className="ml-2 w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center shrink-0"
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-sm font-semibold text-gray-600 px-2 active:opacity-60"
        >
          Annuler
        </button>
      </div>

      {/* Résultats */}
      {query.trim() && (
        <div className="max-h-[60vh] overflow-y-auto border-t border-gray-100">
          {loading ? (
            <p className="p-4 text-center text-gray-400 text-sm">Recherche…</p>
          ) : results && results.length === 0 ? (
            <p className="p-4 text-center text-gray-400 text-sm">Aucun résultat pour &ldquo;{query}&rdquo;</p>
          ) : results ? (
            <div className="divide-y divide-gray-100">
              {results.map((p) => (
                <Link
                  key={p.id}
                  href={`/app/rappels/${p.id}`}
                  onClick={handleResultClick}
                  className="flex items-start gap-3 px-5 py-3 active:bg-gray-50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      {p.isKnown ? null : <NewBadge />}
                      {p.isUrgent && p.status === "pending" && <UrgentBadge />}
                      {p.status !== "pending" && <StatusBadge status={p.status} />}
                    </div>
                    <p className="font-nunito font-bold text-gray-900 truncate text-sm">
                      {p.isKnown ? p.name : p.phone}
                    </p>
                    {p.isKnown && (
                      <p className="text-xs text-gray-500 truncate">
                        {p.phone}
                        {p.vehicleInterest && ` · ${p.vehicleInterest}`}
                      </p>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
