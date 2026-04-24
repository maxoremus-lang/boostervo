"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

function PhoneIcon() {
  return (
    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [dealership, setDealership] = useState("");
  const [averageMarginVo, setAverageMarginVo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          name: name.trim(),
          dealership: dealership.trim(),
          averageMarginVo: parseFloat(averageMarginVo),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        setError(err.error ?? "Erreur lors de l'inscription");
        setLoading(false);
        return;
      }

      // Auto-login après création
      const loginRes = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (loginRes?.ok) {
        window.location.href = "/app/dashboard";
        return;
      }
      // Fallback : rediriger vers login
      router.push("/app/login");
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 py-12 bg-fond">
      <div className="w-20 h-20 bg-bleu rounded-2xl flex items-center justify-center mb-6 shadow-lg">
        <PhoneIcon />
      </div>
      <h1 className="text-2xl font-nunito font-extrabold text-bleu">Créer un compte</h1>
      <p className="text-gray-500 text-sm mb-6 text-center">Inscription négociant</p>

      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 text-center">
            {error}
          </div>
        )}
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nom complet</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jean Martin"
            className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm"
            autoComplete="name"
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Concession</label>
          <input
            type="text"
            value={dealership}
            onChange={(e) => setDealership(e.target.value)}
            placeholder="Concession Lyon Est"
            className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm"
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jean@concession-lyon.fr"
            className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8 caractères minimum"
            className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Marge moyenne par VO (€)</label>
          <input
            type="number"
            value={averageMarginVo}
            onChange={(e) => setAverageMarginVo(e.target.value)}
            placeholder="Ex : 1 500"
            className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm"
            min="1"
            step="1"
            required
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Utilisée pour estimer la marge générée dans les stats quand la marge réelle n&apos;est pas renseignée.
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange hover:bg-orange-dark disabled:opacity-50 text-white font-bold py-3.5 rounded-xl mt-4 shadow-md transition"
        >
          {loading ? "Création..." : "Créer mon compte"}
        </button>
        <p className="text-xs text-gray-500 text-center mt-3">
          Déjà un compte ?{" "}
          <Link href="/app/login" className="text-orange font-bold">Se connecter</Link>
        </p>
      </form>
    </div>
  );
}
