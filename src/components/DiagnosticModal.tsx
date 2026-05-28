"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  source: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function DiagnosticModal({ open, onClose, source }: Props) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setFirstName("");
      setEmail("");
      setStatus("idle");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const fn = firstName.trim();
    const em = email.trim();
    if (!fn) {
      setError("Merci d'indiquer votre prénom.");
      return;
    }
    if (!EMAIL_RE.test(em)) {
      setError("Merci d'indiquer un email valide.");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/diagnostic-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: fn, email: em, source }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}) as { error?: string });
        setError((err as { error?: string }).error ?? "Erreur lors de l'envoi");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion.");
      setStatus("error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm text-left"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 pb-2">
          <div>
            <h2 className="text-xl font-nunito font-extrabold text-bleu">
              Découvrir le diagnostic
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Présentation gratuite et sans engagement en 20 minutes.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1 -mr-1 -mt-1"
            aria-label="Fermer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {status === "success" ? (
          <div className="p-6 pt-4 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-bleu">Demande envoyée !</h3>
            <p className="text-sm text-gray-600 mt-2">
              Merci {firstName || "à vous"}, nous revenons vers vous très vite pour
              planifier votre présentation de 20 minutes.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full bg-orange hover:bg-orange-dark text-white font-bold py-3 rounded-xl transition"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="p-6 pt-4 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Prénom
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jean"
                className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange"
                autoComplete="given-name"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean@exemple.fr"
                className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange"
                autoComplete="email"
                required
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-orange hover:bg-orange-dark disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md transition"
            >
              {status === "sending" ? "Envoi…" : "Recevoir ma présentation"}
            </button>

            <p className="text-[11px] text-gray-400 text-center">
              En envoyant ce formulaire, vous acceptez d&apos;être recontacté par BoosterVO.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
