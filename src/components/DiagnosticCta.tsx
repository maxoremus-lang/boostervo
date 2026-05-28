"use client";

import { useState } from "react";
import DiagnosticModal from "./DiagnosticModal";

type Props = {
  source: string;
  className?: string;
};

// Bouton "Découvrir le diagnostic" + sous-texte, qui ouvre la modale de
// demande (prénom + email). Utilisé sur les pages VSL (fond bleu foncé).
export default function DiagnosticCta({ source, className }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-block w-full sm:w-auto bg-orange hover:bg-orange-dark text-white font-bold text-base sm:text-lg px-8 py-4 rounded-lg transition-colors shadow-lg min-h-[48px]"
      >
        Découvrir le diagnostic
      </button>
      <p className="text-white/60 text-xs mt-2">
        Présentation gratuite et sans engagement en 20 minutes
      </p>
      <DiagnosticModal open={open} onClose={() => setOpen(false)} source={source} />
    </div>
  );
}
