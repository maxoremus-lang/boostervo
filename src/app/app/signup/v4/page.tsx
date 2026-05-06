"use client";

/**
 * Signup V4 — Clone de V3, base pour itérations.
 * On garde le panneau bleu à gauche, mais à droite on remplace le formulaire
 * par un mockup d'iPhone contenant une capture de l'app (dashboard).
 * Sur mobile : empilement classique (bleu + mockup en dessous).
 */

import { useEffect, useState } from "react";
import CallbackRequestModal from "../_components/CallbackRequestModal";

export default function SignupV4Page() {
  const [slots, setSlots] = useState<{ taken: number; total: number } | null>(null);
  const [callbackOpen, setCallbackOpen] = useState(false);

  useEffect(() => {
    fetch("/api/signup/count")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setSlots({ taken: d.taken ?? 0, total: d.total ?? 50 }))
      .catch(() => {});
  }, []);

  const buttons = (
    <div className="mt-6 flex flex-col gap-3">
      <a
        href="/manuel-app"
        className="inline-flex items-center justify-center gap-2 bg-orange hover:bg-orange-dark text-white font-bold text-sm px-5 py-3.5 rounded-xl shadow-lg transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Téléchargez le manuel de l&apos;app Mobile
      </a>
      <button
        type="button"
        onClick={() => setCallbackOpen(true)}
        className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/40 text-white font-bold text-sm px-5 py-3.5 rounded-xl shadow-lg transition backdrop-blur-sm"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.28a2 2 0 011.94 1.515l.7 2.81a2 2 0 01-.5 1.84l-1.27 1.27a11 11 0 005.42 5.42l1.27-1.27a2 2 0 011.84-.5l2.81.7A2 2 0 0121 16.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        Demande de rappel
      </button>
    </div>
  );

  const heroContent = (
    <>
      <h1 className="text-xl xl:text-2xl font-nunito font-extrabold leading-tight">
        Faites partie des 50 Pros sélectionnés pour tester gratuitement BoosterVO
      </h1>
      <p className="text-white text-base mt-5 leading-relaxed">
        Vous payez déjà sur Leboncoin pour générer des appels.
      </p>
      <p className="text-white text-base mt-4 leading-relaxed">
        Mais vous ne savez pas quels appels vous rapportent de l&apos;argent, lesquels sont perdus… ni si votre investissement est rentable ?
      </p>
      <p className="text-white font-bold text-base mt-6 leading-snug">
        Pendant 10 jours, BoosterVO vous montre :
      </p>
      <ul className="mt-4 space-y-3 text-sm">
        <li className="flex items-start gap-3">
          <CheckIcon />
          <span>Les appels réellement perdus</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckIcon />
          <span>Ceux que vous pouvez récupérer</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckIcon />
          <span>Et l&apos;impact sur votre chiffre d&apos;affaires</span>
        </li>
      </ul>
      <p className="text-white text-base mt-6 leading-relaxed">
        Vous ne testez pas une app. Vous allez mesurer votre réel retour sur investissement (<strong className="text-white font-bold">ROI</strong>) leboncoin.
      </p>
      {buttons}
    </>
  );

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden min-h-screen bg-fond py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center mb-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="BoosterVO" className="h-8 w-auto" />
          </div>

          <div className="bg-gradient-to-br from-bleu via-bleu to-[#0d3a7a] rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-orange/15 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex justify-end mb-3">
                <SlotsBadge slots={slots} />
              </div>
              {heroContent}
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <PhoneMockup />
          </div>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden lg:flex fixed inset-0 z-50 bg-gray-50 items-center justify-center p-6 xl:p-10">
        <div
          className="w-full max-w-6xl flex bg-white rounded-3xl shadow-xl overflow-hidden"
          style={{ height: "min(880px, calc(100vh - 80px))" }}
        >
          {/* Panneau gauche : branding + CTAs */}
          <div className="w-1/2 bg-gradient-to-br from-bleu via-bleu to-[#0d3a7a] text-white relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-orange/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative h-full overflow-y-auto flex flex-col gap-8 p-10 xl:p-12">
              <div className="relative z-10 flex items-center justify-between gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-white.svg" alt="BoosterVO" className="h-9 w-auto" />
                <SlotsBadge slots={slots} />
              </div>
              <div className="relative z-10 max-w-md">{heroContent}</div>
            </div>
          </div>

          {/* Panneau droit : mockup app */}
          <div className="w-1/2 bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 flex items-center justify-center p-10 xl:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-orange/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-bleu/10 rounded-full blur-3xl pointer-events-none" />
            <div className="-rotate-[8deg]">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </div>

      <CallbackRequestModal
        open={callbackOpen}
        onClose={() => setCallbackOpen(false)}
        source="signup-v4"
      />
    </>
  );
}

function PhoneMockup() {
  return (
    <div className="relative">
      {/* Cadre iPhone */}
      <div className="relative bg-gray-900 rounded-[2.5rem] p-2.5 shadow-2xl" style={{ width: 280 }}>
        <div className="bg-gray-900 rounded-[2rem] overflow-hidden relative" style={{ aspectRatio: "9 / 19.5" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/signup/accueil-qualifies.png"
            alt="Aperçu de l'app BoosterVO — leads qualifiés"
            className="w-full h-full object-cover object-top"
          />
        </div>
      </div>
      {/* Reflet */}
      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
    </div>
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
