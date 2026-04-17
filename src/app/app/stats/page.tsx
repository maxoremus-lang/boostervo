"use client";

import Link from "next/link";
import BottomNav from "../_components/BottomNav";
import SearchButton from "../_components/SearchButton";
import SearchBar from "../_components/SearchBar";

export default function StatsHubPage() {
  return (
    <div className="pb-24 min-h-screen bg-fond">
      {/* Header */}
      <div className="bg-bleu px-5 pt-6 pb-5 text-white">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <h1 className="text-xl font-nunito font-extrabold">Mes statistiques</h1>
            <p className="text-xs opacity-80">Choisis une vue pour commencer</p>
          </div>
          <SearchButton />
        </div>
      </div>

      <SearchBar />

      {/* Cards de choix */}
      <div className="px-5 pt-5 space-y-3">
        <Link
          href="/app/stats/general"
          className="block bg-white rounded-2xl p-5 shadow-sm active:opacity-70 transition"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-orange" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="font-nunito font-extrabold text-lg text-bleu">Stats générales</h2>
              <p className="text-xs text-gray-500 mt-1">
                Marge récupérée, ventes conclues, taux de transfo, rappels faits, délai moyen, RDV pris,
                évolution sur 7 jours.
              </p>
            </div>
            <svg className="w-5 h-5 text-gray-300 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link
          href="/app/stats/par-statut"
          className="block bg-white rounded-2xl p-5 shadow-sm active:opacity-70 transition"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-violet-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10M7 12h10M7 17h10M3 7h.01M3 12h.01M3 17h.01" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="font-nunito font-extrabold text-lg text-bleu">Stats par statut</h2>
              <p className="text-xs text-gray-500 mt-1">
                Répartition des prospects : injoignables, à recontacter, RDV pris, devis envoyés, ventes
                conclues… avec filtres par période.
              </p>
            </div>
            <svg className="w-5 h-5 text-gray-300 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}
