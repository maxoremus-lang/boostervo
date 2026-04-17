"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Prospect } from "../_lib/types";
import { StatusBadge, UrgentBadge, NewBadge } from "./Badge";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SearchOverlay({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Prospect[] | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus à l'ouverture
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      // Réinitialiser à la fermeture
      setQuery("");
      setResults(null);
    }
  }, [open]);

  // ESC pour fermer
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Fetch résultats avec debounce
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

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-bleu px-3 pt-3 pb-3 text-white flex items-center gap-2 shrink-0">
        <div className="flex-1 flex items-center bg-white/15 rounded-xl px-3 py-2">
          <svg className="w-4 h-4 text-white/70 mr-2 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom, numéro, véhicule…"
            className="bg-transparent text-sm flex-1 focus:outline-none text-white placeholder-white/60"
            autoComplete="off"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Effacer"
              className="ml-2 w-5 h-5 rounded-full bg-white/25 flex items-center justify-center shrink-0"
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-sm font-semibold px-2 active:opacity-60"
        >
          Annuler
        </button>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto">
        {!query.trim() ? (
          <div className="p-6 text-center text-gray-400 text-sm">
            Tape le nom d&apos;un prospect, un numéro de téléphone ou un véhicule.
          </div>
        ) : loading ? (
          <div className="p-6 text-center text-gray-400 text-sm">Recherche…</div>
        ) : results && results.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">
            Aucun résultat pour &ldquo;{query}&rdquo;
          </div>
        ) : results ? (
          <div className="divide-y divide-gray-100">
            {results.map((p) => (
              <Link
                key={p.id}
                href={`/app/rappels/${p.id}`}
                onClick={onClose}
                className="flex items-start gap-3 px-5 py-3 active:bg-gray-50 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {p.isKnown ? null : <NewBadge />}
                    {p.isUrgent && p.status === "pending" && <UrgentBadge />}
                    {p.status !== "pending" && <StatusBadge status={p.status} />}
                  </div>
                  <p className="font-nunito font-bold text-gray-900 truncate">
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
    </div>
  );
}
