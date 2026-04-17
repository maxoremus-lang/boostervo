"use client";

import { useSearchPanel } from "./Providers";

/**
 * Bouton loupe à placer dans le header bleu de chaque page.
 * Toggle l'affichage de la SearchBar (à placer juste sous le bandeau bleu).
 */
export default function SearchButton({
  className = "",
}: {
  className?: string;
}) {
  const { open, toggle } = useSearchPanel();

  return (
    <button
      onClick={toggle}
      aria-label={open ? "Fermer la recherche" : "Rechercher"}
      aria-pressed={open}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
        open ? "bg-white text-bleu" : "bg-white/15 hover:bg-white/25 active:bg-white/30 text-white"
      } ${className}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button>
  );
}
