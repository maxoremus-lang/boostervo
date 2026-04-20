"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ProspectCard from "../_components/ProspectCard";
import BottomNav from "../_components/BottomNav";
import SearchButton from "../_components/SearchButton";
import SearchBar from "../_components/SearchBar";
import type { Prospect } from "../_lib/types";

type ApiResponse = {
  prospects: Prospect[];
  counts: { urgent: number; todo: number; in_progress: number; done: number; all: number };
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // On récupère TOUS les prospects pour pouvoir trier urgents / todos côté client
        const res = await fetch("/api/prospects?filter=all");
        if (!res.ok) {
          if (!cancelled) {
            setError("Erreur de chargement");
            setLoading(false);
          }
          return;
        }
        const json: ApiResponse = await res.json();
        if (!cancelled) {
          setData(json);
          setError(null);
          setLoading(false);
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
  }, []);

  const userName = (session?.user?.name as string | undefined) ?? "…";
  const firstName = userName.split(" ")[0];
  const prospects = data?.prospects ?? [];

  // Listes affichées dans le corps du dashboard (pending uniquement, les actifs à rappeler)
  const urgents = prospects.filter((p) => p.isUrgent && p.status === "pending");
  const todos = prospects.filter((p) => !p.isUrgent && p.status === "pending");

  // Chiffres des 3 cases — utilisent les counts serveur pour être cohérents
  // avec les boutons de filtre de la page "Mes rappels"
  const toCallCount = data?.counts.todo ?? 0; // pending + postponed + unreachable
  const urgentCount = data?.counts.urgent ?? 0; // isUrgent=true && status=pending
  const doneCount = data?.counts.done ?? 0; // sold + not_interested

  // Phrase d'orientation dynamique sous le titre d'écran
  let orientationPhrase = "Chargement…";
  if (!loading && !error) {
    if (urgentCount > 0) {
      orientationPhrase = `${urgentCount} ${urgentCount > 1 ? "rappels urgents" : "rappel urgent"} à traiter en priorité`;
    } else if (toCallCount > 0) {
      orientationPhrase = `${toCallCount} ${toCallCount > 1 ? "rappels à faire" : "rappel à faire"} aujourd'hui`;
    } else {
      orientationPhrase = "Tout est à jour, beau travail !";
    }
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-bleu px-5 pt-6 pb-8 text-white">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs opacity-80">Bonjour {firstName} 👋</p>
            <h1 className="text-2xl font-nunito font-extrabold mt-0.5">Vos rappels du jour</h1>
            <p className="text-sm opacity-90 mt-1">{orientationPhrase}</p>
          </div>
          <SearchButton />
        </div>
      </div>

      <SearchBar />

      {/* Stats rapides — cliquables */}
      <div className="px-5 -mt-5">
        <div className="bg-white rounded-2xl shadow-md grid grid-cols-3 overflow-hidden">
          <Link
            href="/app/rappels?filter=urgent"
            className="text-center p-4 border-r border-gray-100 active:bg-gray-50 transition"
          >
            <div className="text-2xl font-nunito font-extrabold text-red-600">{urgentCount}</div>
            <div className="text-[10px] text-gray-500 uppercase font-semibold">Urgents</div>
          </Link>
          <Link
            href="/app/rappels?filter=todo"
            className="text-center p-4 border-r border-gray-100 active:bg-gray-50 transition"
          >
            <div className="text-2xl font-nunito font-extrabold text-orange">{toCallCount}</div>
            <div className="text-[10px] text-gray-500 uppercase font-semibold">À rappeler</div>
          </Link>
          <Link
            href="/app/rappels?filter=done"
            className="text-center p-4 active:bg-gray-50 transition"
          >
            <div className="text-2xl font-nunito font-extrabold text-green-600">{doneCount}</div>
            <div className="text-[10px] text-gray-500 uppercase font-semibold">Traités</div>
          </Link>
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <p className="text-center text-gray-400 text-sm py-12">Chargement…</p>
      ) : error ? (
        <p className="text-center text-red-600 text-sm py-12">{error}</p>
      ) : (
        <>
          {/* Urgents */}
          {urgents.length > 0 && (
            <div className="px-5 mt-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-nunito font-extrabold text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                  Urgents
                </h2>
                <span className="text-xs text-gray-400">{urgents.length} rappels</span>
              </div>
              <div className="space-y-3">
                {urgents.map((p, i) => (
                  <div key={p.id} className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 pt-3 text-right text-xs font-bold text-gray-400 tabular-nums">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <ProspectCard prospect={p} variant="urgent" contextParams="filter=urgent" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* À rappeler */}
          {todos.length > 0 && (
            <div className="px-5 mt-6">
              <h2 className="font-nunito font-extrabold text-gray-800 mb-3">À rappeler aujourd&apos;hui</h2>
              <div className="space-y-3">
                {todos.slice(0, 10).map((p, i) => (
                  <div key={p.id} className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 pt-3 text-right text-xs font-bold text-gray-400 tabular-nums">
                      {urgents.length + i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <ProspectCard prospect={p} contextParams="filter=todo" />
                    </div>
                  </div>
                ))}
                {todos.length > 10 && (
                  <a
                    href="/app/rappels"
                    className="block text-center text-sm font-bold text-bleu py-3 bg-white rounded-2xl ml-8"
                  >
                    Voir les {todos.length - 10} autres rappels →
                  </a>
                )}
              </div>
            </div>
          )}

          {urgents.length === 0 && todos.length === 0 && (
            <div className="px-5 mt-10 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <p className="font-nunito font-bold text-gray-700">Beau travail !</p>
              <p className="text-sm text-gray-500 mt-1">Aucun rappel à faire pour l&apos;instant.</p>
            </div>
          )}
        </>
      )}

      <BottomNav />
    </div>
  );
}
