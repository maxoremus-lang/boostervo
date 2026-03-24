"use client";

import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="BoosterVO"
          width={160}
          height={40}
          className="h-9 w-auto"
        />
        <a
          href="#audit"
          className="hidden sm:inline-flex items-center gap-1 bg-orange hover:bg-orange-dark text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
        >
          Audit gratuit &rarr;
        </a>
        <button
          className="sm:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className="block w-6 h-0.5 bg-bleu" />
          <span className="block w-6 h-0.5 bg-bleu" />
          <span className="block w-6 h-0.5 bg-bleu" />
        </button>
      </div>
      {menuOpen && (
        <div className="sm:hidden bg-white border-t px-4 py-4">
          <a
            href="#audit"
            className="block w-full text-center bg-orange hover:bg-orange-dark text-white font-semibold text-sm px-5 py-3 rounded-lg transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Audit gratuit &rarr;
          </a>
        </div>
      )}
    </nav>
  );
}
