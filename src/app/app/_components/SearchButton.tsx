"use client";

import { useState } from "react";
import SearchOverlay from "./SearchOverlay";

/**
 * Bouton loupe à placer dans les headers bleus de l'app.
 * Au clic, ouvre un overlay de recherche globale des prospects.
 */
export default function SearchButton({
  className = "",
}: {
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Rechercher"
        className={`w-10 h-10 bg-white/15 hover:bg-white/25 active:bg-white/30 rounded-full flex items-center justify-center transition ${className}`}
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
      <SearchOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}
