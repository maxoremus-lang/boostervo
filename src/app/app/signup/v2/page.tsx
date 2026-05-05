"use client";

/**
 * Signup V2 — Hero plein écran immersif
 * Le bleu prend toute la largeur. Contenu centré max-w-4xl, plus aéré.
 * Bénéfices en 2 colonnes sur desktop. CTA côte-à-côte.
 */

import { useEffect, useState } from "react";
import CallbackRequestModal from "../_components/CallbackRequestModal";

export default function SignupV2Page() {
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
      <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-bleu via-bleu to-[#0a2f63] text-white flex flex-col">
        <div className="absolute -top-40 -right-40 w-[40rem] h-[40rem] bg-orange/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[40rem] h-[40rem] bg-orange/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-bleu/40 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <header className="relative z-10 px-6 sm:px-10 py-6 flex items-center justify-between max-w-6xl w-full mx-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-white.svg" alt="BoosterVO" className="h-8 sm:h-9 w-auto" />
          <SlotsBadge slots={slots} />
        </header>

        {/* Hero */}
        <main className="relative z-10 flex-1 flex items-center justify-center px-6 sm:px-10 py-8">
          <div className="max-w-4xl w-full text-center">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-nunito font-extrabold leading-tight">
              Faites partie des 50 Pros sélectionnés
              <br className="hidden sm:block" />
              <span className="sm:inline"> </span>
              pour tester gratis l&apos;app BoosterVO.
            </h1>

            <p className="text-orange font-extrabold text-lg sm:text-2xl mt-5">
              Ne laissez plus filer un seul prospect.
            </p>

            <p className="text-white/90 font-bold text-base sm:text-lg mt-6 max-w-2xl mx-auto">
              Prenez une longueur d&apos;avance avec l&apos;app qui booste vos ventes VO.
            </p>

            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm sm:text-base max-w-3xl mx-auto text-left">
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

            <p className="text-white/75 text-sm sm:text-base mt-8 leading-relaxed max-w-2xl mx-auto">
              BoosterVO analyse vos appels, vous notifie en temps réel et vous aide à{" "}
              <strong className="text-white font-bold">
                récupérer jusqu&apos;à 3 000 € de marge dès le 1er mois
              </strong>{" "}
              sur vos annonces Leboncoin.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-xl mx-auto">
              <a
                href="/manuel-app"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-orange hover:bg-orange-dark text-white font-bold text-sm sm:text-base px-6 py-4 rounded-xl shadow-xl transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Téléchargez le manuel
              </a>
              <button
                type="button"
                onClick={() => setCallbackOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-bleu hover:bg-white/90 font-bold text-sm sm:text-base px-6 py-4 rounded-xl shadow-xl transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.28a2 2 0 011.94 1.515l.7 2.81a2 2 0 01-.5 1.84l-1.27 1.27a11 11 0 005.42 5.42l1.27-1.27a2 2 0 011.84-.5l2.81.7A2 2 0 0121 16.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Demande de rappel
              </button>
            </div>
          </div>
        </main>

        <footer className="relative z-10 text-center text-white/40 text-xs py-6 px-4">
          BoosterVO &mdash; Mercure SAS
        </footer>
      </div>

      <CallbackRequestModal
        open={callbackOpen}
        onClose={() => setCallbackOpen(false)}
        source="signup-v2"
      />
    </>
  );
}

function CheckIcon() {
  return (
    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange flex items-center justify-center mt-0.5">
      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
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
    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide">
      <span className={`w-2 h-2 rounded-full ${isFull ? "bg-white" : "bg-orange animate-pulse"}`} />
      <span>{label}</span>
    </div>
  );
}
