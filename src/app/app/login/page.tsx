"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";

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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/app/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou mot de passe incorrect");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 text-center">
          {error}
        </div>
      )}
      <div>
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="max@boostervo.fr"
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
          className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm"
          autoComplete="current-password"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange hover:bg-orange-dark disabled:opacity-50 text-white font-bold py-3.5 rounded-xl mt-4 shadow-md transition"
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 pb-20 bg-fond">
      <div className="w-20 h-20 bg-bleu rounded-2xl flex items-center justify-center mb-6 shadow-lg">
        <PhoneIcon />
      </div>
      <h1 className="text-2xl font-nunito font-extrabold text-bleu">Bienvenue</h1>
      <p className="text-gray-500 text-sm mb-8 text-center">Connectez-vous pour gérer vos rappels</p>

      <Suspense fallback={<div className="text-gray-400 text-sm">Chargement...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
