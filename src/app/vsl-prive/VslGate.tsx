"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const STORAGE_KEY = "bvo_vsl_unlocked";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function VslGate() {
  const [unlocked, setUnlocked] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstNameRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Un visiteur qui a déjà donné son email ne le redemande pas.
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
    } catch {
      /* localStorage indisponible : on garde le gate */
    }
  }, []);

  // Après déverrouillage : on remonte vers la vidéo et on tente la lecture.
  useEffect(() => {
    if (unlocked && videoRef.current) {
      videoRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      videoRef.current.play().catch(() => {
        /* autoplay bloqué : les contrôles restent disponibles */
      });
    }
  }, [unlocked]);

  function focusForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => firstNameRef.current?.focus(), 350);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
    setSubmitting(true);
    try {
      const res = await fetch("/api/vsl-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: fn, email: em }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Une erreur est survenue, réessayez.");
      }
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      setUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue, réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bleu text-white flex flex-col">
      <header className="w-full px-6 py-6 flex justify-center">
        <Image src="/logo-white.svg" alt="BoosterVO" width={180} height={36} priority />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl text-center">
          <p className="font-nunito text-sm font-bold uppercase tracking-widest text-orange mb-3">
            À regarder avant votre audit
          </p>
          <h1 className="font-nunito text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
            Le profit caché derrière
            <br />
            <span className="text-orange">vos appels manqués</span>
          </h1>
          <p className="text-white/80 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
            En 3 minutes, découvrez ce que 90&nbsp;% des négociants VO ne voient
            pas — et comment récupérer entre 1&nbsp;500&nbsp;€ et 3&nbsp;000&nbsp;€
            de marge par mois.
          </p>

          {/* Cadre vidéo — toujours visible. Verrouillé (overlay) tant que
              l'email n'est pas saisi, puis remplacé par le vrai lecteur. */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black border border-white/10">
            {unlocked ? (
              <video
                ref={videoRef}
                src="/videos/vsl-page.mp4"
                controls
                autoPlay
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover"
              >
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
            ) : (
              <button
                type="button"
                onClick={focusForm}
                aria-label="Débloquer la vidéo"
                className="group absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-bleu-dark to-black cursor-pointer"
              >
                <span className="flex items-center justify-center w-20 h-20 rounded-full bg-orange shadow-lg group-hover:scale-105 transition-transform">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 ml-1 fill-white" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span className="font-nunito font-bold text-base sm:text-lg">
                  Vidéo verrouillée
                </span>
                <span className="text-white/70 text-sm max-w-xs px-4">
                  Indiquez votre prénom et votre email ci-dessous pour la débloquer.
                </span>
              </button>
            )}
          </div>

          {/* Formulaire sous la vidéo — masqué une fois débloqué. */}
          {!unlocked && (
            <div
              ref={formRef}
              className="mt-6 bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
                <p className="font-nunito font-extrabold text-xl mb-1">
                  Débloquez la vidéo
                </p>
                <p className="text-white/70 text-sm mb-5">
                  Indiquez votre prénom et votre email pour la regarder.
                </p>
                <input
                  ref={firstNameRef}
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Votre prénom"
                  autoComplete="given-name"
                  className="w-full mb-3 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre email"
                  autoComplete="email"
                  className="w-full mb-3 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange"
                />
                {error && (
                  <p className="text-orange-200 text-sm mb-3" role="alert">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-orange hover:bg-orange-dark disabled:opacity-60 text-white font-bold text-base px-6 py-3 rounded-lg transition-colors min-h-[48px]"
                >
                  {submitting ? "Un instant…" : "Débloquer la vidéo"}
                </button>
                <p className="text-white/40 text-xs mt-4 text-center">
                  Pas de spam. Vous pouvez vous désinscrire à tout moment.
                </p>
              </form>
            </div>
          )}

          <a
            href="/#audit"
            className="mt-10 inline-block w-full sm:w-auto bg-orange hover:bg-orange-dark text-white font-bold text-base sm:text-lg px-8 py-4 rounded-lg transition-colors shadow-lg min-h-[48px]"
          >
            Recevoir mon audit offert
          </a>
        </div>
      </main>
    </div>
  );
}
