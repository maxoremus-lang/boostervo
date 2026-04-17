"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ProspectCard from "../_components/ProspectCard";
import BottomNav from "../_components/BottomNav";
import type { Prospect } from "../_lib/types";

type ApiResponse = {
  prospects: Prospect[];
  counts: { todo: number; in_progress: number; done: number; all: number };
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
  const prospects = data?.prospects ?? [];

  const urgents = prospects.filter((p) => p.isUrgent && p.status === "pending");
  const todos = prospects.filter((p) => !p.isUrgent && p.status === "pending");
  const toCallCount = prospects.filter((p) => p.status === "pending").length;
  const doneCount = data?.counts.done ?? 0;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-bleu px-5 pt-6 pb-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs opacity-80">Bonjour,</p>
            <h1 className="text-xl font-nunito font-extrabold">{userName}</h1>
          </div>
          <Link
            href="/app/rappels?focus=search"
            aria-label="Rechercher un prospect"
            className="w-10 h-10 bg-white/15 hover:bg-white/25 active:bg-white/30 rounded-full flex items-center justify-center transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="px-5 -mt-5">
        <div className="bg-white rounded-2xl shadow-md p-4 grid grid-cols-3 gap-2">
          <div className="text-center border-r border-gray-100">
            <div className="text-2xl font-nunito font-extrabold text-orange">{toCallCount}</div>
            <div className="text-[10px] text-gray-500 uppercase font-semibold">À rappeler</div>
          </div>
          <div className="text-center border-r border-gray-100">
            <div className="text-2xl font-nunito font-extrabold text-red-600">{urgents.length}</div>
            <div className="text-[10px] text-gray-500 uppercase font-semibold">Urgents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-nunito font-extrabold text-green-600">{doneCount}</div>
            <div className="text-[10px] text-gray-500 uppercase font-semibold">Faits</div>
          </div>
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
                {urgents.map((p) => (
                  <ProspectCard key={p.id} prospect={p} variant="urgent" />
                ))}
              </div>
            </div>
          )}

          {/* À rappeler */}
          {todos.length > 0 && (
            <div className="px-5 mt-6">
              <h2 className="font-nunito font-extrabold text-gray-800 mb-3">À rappeler aujourd&apos;hui</h2>
              <div className="space-y-3">
                {todos.slice(0, 10).map((p) => (
                  <ProspectCard key={p.id} prospect={p} />
                ))}
                {todos.length > 10 && (
                  <a
                    href="/app/rappels"
                    className="block text-center text-sm font-bold text-bleu py-3 bg-white rounded-2xl"
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
