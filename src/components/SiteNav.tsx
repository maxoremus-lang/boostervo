"use client";

import { useEffect, useState } from "react";

// En-tête de navigation bleu identique à la page d'accueil (boostervo.fr).
// Logo à gauche, liens à droite (desktop) ou hamburger (mobile).
// Réutilisé sur les pages VSL (/vsl, /vsl-prive), /tarifs, etc.
export default function SiteNav() {
  const [open, setOpen] = useState(false);

  // Lock scroll quand le menu mobile est ouvert + Échap pour fermer
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const links = [
    { href: "/", label: "Accueil" },
    { href: "/#diagnostic", label: "Le diagnostic BoosterVO" },
    { href: "/#faq", label: "FAQ" },
    { href: "/tarifs", label: "Tarifs" },
    { href: "/programme-gold.html", label: "Programme Gold" },
  ];

  return (
    <>
      <div className="sticky top-0 z-50 bg-bleu shadow-[0_4px_20px_rgba(7,18,37,0.18)]">
        <header className="max-w-[1100px] mx-auto flex items-center justify-between px-4 sm:px-10 py-2 sm:py-4">
          <a href="/" aria-label="Accueil BoosterVO" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-white.svg"
              alt="BoosterVO"
              width={150}
              height={28}
              className="h-[22px] sm:h-7 w-auto block"
            />
          </a>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-11 font-semibold text-[15px]">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-white/85 hover:text-orange transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Bouton hamburger (mobile) */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="md:hidden inline-flex items-center justify-center w-[34px] h-[34px] rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors"
            aria-label="Ouvrir le menu"
            aria-expanded={open}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </header>
      </div>

      {/* Backdrop + panneau mobile */}
      {open && (
        <div
          className="fixed inset-0 z-[1050] bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <nav
        className={`fixed top-0 right-0 bottom-0 z-[1100] w-[280px] max-w-[85vw] bg-bleu-dark shadow-[-8px_0_30px_rgba(0,0,0,0.4)] transform transition-transform duration-200 ease-out md:hidden flex flex-col px-5 py-6 gap-1 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Menu mobile"
      >
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white hover:bg-white/10 transition-colors"
            aria-label="Fermer le menu"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className="text-white/90 hover:text-orange hover:bg-white/5 rounded-lg px-4 py-3.5 font-semibold text-base transition-colors"
          >
            {l.label}
          </a>
        ))}
      </nav>
    </>
  );
}
