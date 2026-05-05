"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  source: string;
};

export default function CallbackRequestModal({ open, onClose, source }: Props) {
  const [firstName, setFirstName] = useState("");
  const [mobile, setMobile] = useState("");
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
      setMobile("");
      setStatus("idle");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("sending");
    try {
      const res = await fetch("/api/callback-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: firstName.trim(), mobile: mobile.trim(), source }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        setError(err.error ?? "Erreur lors de l'envoi");
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
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
            <h2 className="text-xl font-nunito font-extrabold text-bleu">Être rappelé</h2>
            <p className="text-sm text-gray-500 mt-1">On vous rappelle dans la journée.</p>
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
              Merci {firstName || "à vous"}, on vous rappelle très vite au {mobile || "numéro indiqué"}.
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
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Prénom</label>
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
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Mobile</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+33 6 12 34 56 78"
                className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange"
                autoComplete="tel"
                required
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-orange hover:bg-orange-dark disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md transition"
            >
              {status === "sending" ? "Envoi…" : "Envoyer"}
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
