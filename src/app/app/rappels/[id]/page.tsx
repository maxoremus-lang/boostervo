"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "../../_components/BottomNav";
import SearchButton from "../../_components/SearchButton";
import SearchBar from "../../_components/SearchBar";
import { StatusBadge, UrgentBadge, NewBadge, KnownBadge } from "../../_components/Badge";
import type { Prospect } from "../../_lib/types";
import { formatRelativeTime, missedCallsCount } from "../../_lib/mockData";

function PhoneIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatEventDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const isSameDay = d.toDateString() === now.toDateString();
  if (isSameDay) return time;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Hier ${time}`;

  const diffDays = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays < 7) {
    const weekday = d.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "");
    // Capitalise première lettre
    return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}. ${time}`;
  }

  const dateShort = d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  return `${dateShort} ${time}`;
}

export default function ProspectDetailPage({ params }: { params: { id: string } }) {
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/prospects/${params.id}`);
        if (!res.ok) {
          if (!cancelled) {
            setError(res.status === 404 ? "Prospect introuvable" : "Erreur de chargement");
            setLoading(false);
          }
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setProspect(data);
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
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Chargement…
      </div>
    );
  }

  if (!prospect) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <p className="text-red-600 mb-4">{error ?? "Prospect introuvable"}</p>
        <Link href="/app/rappels" className="text-orange font-bold">
          Retour aux rappels
        </Link>
      </div>
    );
  }

  const telHref = `tel:${prospect.phone.replace(/\s/g, "")}`;
  const missed = missedCallsCount(prospect);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-bleu px-5 pt-6 pb-5 text-white">
        <div className="flex items-center justify-between mb-4 gap-2">
          <Link href="/app/rappels" className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center shrink-0" aria-label="Retour">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex gap-2 flex-1 justify-center flex-wrap">
            {prospect.isKnown ? <KnownBadge /> : <NewBadge />}
            {prospect.isUrgent && prospect.status === "pending" && <UrgentBadge />}
            {prospect.status !== "pending" && <StatusBadge status={prospect.status} />}
          </div>
          <SearchButton />
        </div>
        {prospect.isKnown ? (
          <>
            <h1 className="text-2xl font-nunito font-extrabold">{prospect.name}</h1>
            <p className="text-sm opacity-80">{prospect.phone}</p>
          </>
        ) : (
          <>
            <p className="text-xs uppercase opacity-70 font-semibold">Appelant</p>
            <h1 className="text-2xl font-nunito font-extrabold">{prospect.phone}</h1>
            <p className="text-sm opacity-80">Aucune fiche · 1er contact</p>
          </>
        )}
      </div>

      <SearchBar />

      {/* Boutons principaux */}
      <div className="px-5 -mt-3 space-y-2">
        <a
          href={telHref}
          className="w-full bg-orange hover:bg-orange-dark text-white font-nunito font-extrabold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-lg transition"
        >
          <PhoneIcon /> Rappeler {prospect.isKnown ? "" : "maintenant"}
        </a>
        <Link
          href={`/app/rappels/${prospect.id}/fiche`}
          className="w-full bg-white border-2 border-bleu text-bleu font-nunito font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Saisir la fiche
        </Link>
      </div>

      {/* RDV à venir */}
      {prospect.appointmentAt && (
        <div className="px-5 mt-5">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-green-800 font-semibold uppercase">Prochain RDV</p>
                <p className="font-nunito font-extrabold text-green-900 capitalize">{formatDate(prospect.appointmentAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Véhicule (si connu) */}
      {prospect.isKnown && prospect.vehicleInterest && (
        <div className="px-5 mt-5">
          <h2 className="text-xs uppercase font-semibold text-gray-500 mb-2">Véhicule d&apos;intérêt</h2>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-bleu/10 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-bleu" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 11-4 0 2 2 0 014 0zM20 17a2 2 0 11-4 0 2 2 0 014 0zM4 9h16l-1.5-4.5A2 2 0 0016.6 3H7.4a2 2 0 00-1.9 1.5L4 9zm0 0v7a1 1 0 001 1h1m14-8v7a1 1 0 01-1 1h-1" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-nunito font-bold">{prospect.vehicleInterest}</p>
                {prospect.vehiclePrice && (
                  <p className="text-xs text-gray-500">{prospect.vehiclePrice.toLocaleString("fr-FR")} €</p>
                )}
                {prospect.budget && (
                  <p className="text-xs text-gray-500">Budget ~{prospect.budget.toLocaleString("fr-FR")} €</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {prospect.isKnown && prospect.notes && (
        <div className="px-5 mt-5">
          <h2 className="text-xs uppercase font-semibold text-gray-500 mb-2">Notes</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3">
            <p className="text-sm text-gray-800 italic">&ldquo;{prospect.notes}&rdquo;</p>
          </div>
        </div>
      )}

      {/* Historique */}
      <div className="px-5 mt-5">
        <h2 className="text-xs uppercase font-semibold text-gray-500 mb-2">
          Historique des appels ({missed} manqué{missed > 1 ? "s" : ""})
        </h2>
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          {prospect.callEvents.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Aucun appel enregistré</p>
          ) : (
            prospect.callEvents.map((ev) => (
              <div key={ev.id} className="flex gap-3">
                <div
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    ev.type === "answered" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{ev.type === "answered" ? "Rappel effectué" : "Appel manqué"}</p>
                  <p className="text-xs text-gray-500">
                    {formatEventDate(ev.at)} · {formatRelativeTime(ev.at)}
                    {ev.ringSec && ` · sonné ${ev.ringSec}s`}
                    {ev.durationSec && ` · durée ${Math.round(ev.durationSec / 60)}min ${ev.durationSec % 60}s`}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message pour prospects inconnus */}
      {!prospect.isKnown && (
        <div className="px-5 mt-5">
          <div className="bg-gray-100 rounded-2xl p-3 text-center">
            <p className="text-[11px] text-gray-600">
              Après l&apos;appel, tapez <strong>Saisir la fiche</strong> pour enregistrer nom, véhicule et résultat.
            </p>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
