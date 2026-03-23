"use client";

import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { label: "Solutions", href: "#solution" },
    { label: "Tarifs", href: "#audit" },
    { label: "Témoignages", href: "#temoignages" },
    { label: "À propos", href: "#apropos" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="BoosterVO"
          width={160}
          height={40}
          className="h-9 w-auto"
        />

        {/* Liens desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-gray-600 hover:text-bleu font-medium text-sm transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Bouton CTA desktop */}
        <a
          href="#audit"
          className="hidden md:inline-flex items-center gap-1 bg-orange hover:bg-orange-dark text-white font-semibold text-sm px-6 py-2.5 rounded-full transition-all hover:shadow-md"
        >
          Audit gratuit &rarr;
        </a>

        {/* Hamburger mobile */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className={`block w-6 h-0.5 bg-bleu transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-bleu transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-bleu transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 space-y-3">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block text-gray-700 hover:text-bleu font-medium text-sm py-2"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#audit"
            className="block w-full text-center bg-orange hover:bg-orange-dark text-white font-semibold text-sm px-5 py-3 rounded-full transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Audit gratuit &rarr;
          </a>
        </div>
      )}
    </nav>
  );
}
