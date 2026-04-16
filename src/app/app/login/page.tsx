"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { currentUser } from "../_lib/mockData";

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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState("demo");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // MVP : aucun vrai check, redirige vers dashboard
    router.push("/app/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 pb-20 bg-fond">
      <div className="w-20 h-20 bg-bleu rounded-2xl flex items-center justify-center mb-6 shadow-lg">
        <PhoneIcon />
      </div>
      <h1 className="text-2xl font-nunito font-extrabold text-bleu">Bienvenue</h1>
      <p className="text-gray-500 text-sm mb-8 text-center">Connectez-vous pour gérer vos rappels</p>

      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm"
            autoComplete="email"
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
          />
        </div>
        <button
          type="submit"
          className="w-full bg-orange hover:bg-orange-dark text-white font-bold py-3.5 rounded-xl mt-4 shadow-md transition"
        >
          Se connecter
        </button>
        <p className="text-center text-xs text-gray-500 mt-4">
          Pas encore de compte ?{" "}
          <Link href="#" className="text-orange font-semibold">
            Créer un compte
          </Link>
        </p>
        <p className="text-center text-[11px] text-gray-400 mt-8">
          Démo : utilisez n&apos;importe quel email / mot de passe.
        </p>
      </form>
    </div>
  );
}
