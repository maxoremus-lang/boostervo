"use client";

/**
 * Signup V1 — Carte centrée compacte
 * Reprend le panneau bleu existant en carte centrée (max-w-2xl).
 * Plus de formulaire de création de compte ; 2 CTA :
 *  - "Téléchargez le manuel" (existant, orange)
 *  - "Demande de rappel" (nouveau, outline blanc) → ouvre la popup
 */

import { useEffect, useState } from "react";
import CallbackRequestModal from "../_components/CallbackRequestModal";

export default function SignupV1Page() {
  const [slots, setSlots] = useState<{ taken: number; total: number } | null>(null);
  const [callbackOpen, setCallbackOpen] = useState(false);

  useEffect(() => {
    fetch("/api/signup/count")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setSlots({ taken: d.taken ?? 0, total: d.total ?? 50 }))
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-fond">
        <div className="min-h-full flex items-center justify-center py-8 px-4">
          <div className="w-full max-w-2xl">
          <div className="flex justify-center mb-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="BoosterVO" className="h-9 w-auto" />
          </div>

          <div className="bg-gradient-to-br from-bleu via-bleu to-[#0d3a7a] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-orange/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-orange/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <SlotsBadge slots={slots} />
              <h1 className="text-xl sm:text-2xl font-nunito font-extrabold leading-tight mt-4">
                Faites partie des 50 Pros sélectionnés pour tester gratis l&apos;app BoosterVO.
              </h1>
              <p className="text-orange font-extrabold text-base sm:text-lg mt-4">
                Ne laissez plus filer un seul prospect.
              </p>
              <p className="text-white font-bold text-sm sm:text-base mt-5 leading-snug">
                Prenez une longueur d&apos;avance avec l&apos;app qui booste vos ventes VO.
              </p>

              <ul className="mt-4 space-y-2.5 text-sm">
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span>Détecte automatiquement vos appels manqués critiques</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span>Vous alerte en temps réel pour rappeler plus vite</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span>Mesure vos délais de rappel, vos rendez-vous et vos ventes</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span>App offerte 30 jours, sans engagement</span>
                </li>
              </ul>

              <p className="text-white/80 text-sm mt-5 leading-relaxed">
                BoosterVO analyse vos appels, vous notifie en temps réel et vous aide à{" "}
                <strong className="text-white font-bold">
                  récupérer jusqu&apos;à 3 000 € de marge dès le 1er mois
                </strong>{" "}
                sur vos annonces Leboncoin.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="/manuel-app"
                  className="inline-flex items-center justify-center gap-2 bg-orange hover:bg-orange-dark text-white font-bold text-sm px-4 py-3.5 rounded-xl shadow-lg transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Téléchargez le manuel
                </a>
                <button
                  type="button"
                  onClick={() => setCallbackOpen(true)}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/40 text-white font-bold text-sm px-4 py-3.5 rounded-xl shadow-lg transition backdrop-blur-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.28a2 2 0 011.94 1.515l.7 2.81a2 2 0 01-.5 1.84l-1.27 1.27a11 11 0 005.42 5.42l1.27-1.27a2 2 0 011.84-.5l2.81.7A2 2 0 0121 16.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Demande de rappel
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <CallbackRequestModal
        open={callbackOpen}
        onClose={() => setCallbackOpen(false)}
        source="signup-v1"
      />
    </>
  );
}

function CheckIcon() {
  return (
    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange flex items-center justify-center mt-0.5">
      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
}

function SlotsBadge({ slots }: { slots: { taken: number; total: number } | null }) {
  if (!slots) {
    return <div className="h-7" aria-hidden="true" />;
  }
  const remaining = Math.max(slots.total - slots.taken, 0);
  const isFull = remaining === 0;
  const label = isFull ? "Liste d'attente ouverte" : `${slots.taken}/${slots.total} places`;
  return (
    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide">
      <span className={`w-2 h-2 rounded-full ${isFull ? "bg-white" : "bg-orange animate-pulse"}`} />
      <span>{label}</span>
    </div>
  );
}
