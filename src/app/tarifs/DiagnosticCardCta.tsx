"use client";

import { useState } from "react";
import DiagnosticModal from "../../components/DiagnosticModal";
import styles from "./styles.module.css";

type Props = {
  label: string;
  source: string;
};

// CTA de la carte « Pack Diagnostic » : reprend le style des autres boutons
// de la grille mais ouvre la modale de demande (prénom + email), comme le
// bouton « Découvrir le diagnostic » des pages go/VSL.
export default function DiagnosticCardCta({ label, source }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={styles.cta}
        style={{ border: "none", width: "100%", cursor: "pointer" }}
        onClick={() => setOpen(true)}
      >
        <span>{label}</span>
        <span className={styles.ctaIcon}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1B4F9B"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </span>
      </button>
      <DiagnosticModal open={open} onClose={() => setOpen(false)} source={source} />
    </>
  );
}
