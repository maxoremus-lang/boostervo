"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dealership, setDealership] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [website, setWebsite] = useState("");
  const [twilioNumber, setTwilioNumber] = useState("");
  const [forwardPhone, setForwardPhone] = useState("");
  const [averageMarginVo, setAverageMarginVo] = useState("");
  const [publicationMode, setPublicationMode] = useState<"" | "manual" | "auto">("");
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
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dealership: dealership.trim(),
          mobile: mobile.trim(),
          website: website.trim(),
          twilioNumber: twilioNumber.trim(),
          forwardPhone: forwardPhone.trim(),
          averageMarginVo: parseFloat(averageMarginVo),
          publicationMode,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        setError(err.error ?? "Erreur lors de l'inscription");
        setLoading(false);
        return;
      }

      const loginRes = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (loginRes?.ok) {
        window.location.href = "/app/dashboard";
        return;
      }
      router.push("/app/login");
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion.");
      setLoading(false);
    }
  };

  const inputClass =
    "w-full mt-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange";
  const labelClass = "text-xs font-semibold text-gray-600 uppercase tracking-wide";
  const sectionClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-1";

  return (
    <div className="min-h-screen bg-fond py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header : logo + titre */}
        <div className="flex flex-col items-center mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="BoosterVO" className="h-8 sm:h-10 w-auto mb-5" />
          <h1 className="text-2xl sm:text-3xl font-nunito font-extrabold text-bleu">Créer un compte</h1>
          <p className="text-gray-500 text-sm mt-1">Inscription négociant</p>
        </div>

        {/* Card */}
        <form
          onSubmit={onSubmit}
          className="bg-white rounded-2xl shadow-sm sm:shadow-md p-5 sm:p-8 space-y-5"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 text-center">
              {error}
            </div>
          )}

          {/* ======== SECTION IDENTITÉ ======== */}
          <div className="space-y-3">
            <p className={sectionClass}>Identité</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Prénom</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jean"
                  className={inputClass}
                  autoComplete="given-name"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Nom</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Martin"
                  className={inputClass}
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Concession</label>
                <input
                  type="text"
                  value={dealership}
                  onChange={(e) => setDealership(e.target.value)}
                  placeholder="Concession Lyon Est"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Mobile</label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                  className={inputClass}
                  autoComplete="tel"
                  required
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>
                Site web <span className="text-gray-400 normal-case font-normal">(optionnel)</span>
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://concession-lyon.fr"
                className={inputClass}
                autoComplete="url"
              />
            </div>
          </div>

          {/* ======== SECTION CONNEXION ======== */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <p className={sectionClass}>Connexion</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jean@concession-lyon.fr"
                  className={inputClass}
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 caractères minimum"
                  className={inputClass}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            </div>
          </div>

          {/* ======== SECTION TÉLÉPHONIE ======== */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <p className={sectionClass}>Téléphonie</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>
                  Numéro de tracking <span className="text-gray-400 normal-case font-normal">(optionnel)</span>
                </label>
                <input
                  type="tel"
                  value={twilioNumber}
                  onChange={(e) => setTwilioNumber(e.target.value)}
                  placeholder="+33 1 59 16 87 72"
                  className={inputClass}
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Le numéro affiché dans vos annonces.
                </p>
              </div>
              <div>
                <label className={labelClass}>
                  Numéro visible sur leboncoin <span className="text-gray-400 normal-case font-normal">(optionnel)</span>
                </label>
                <input
                  type="tel"
                  value={forwardPhone}
                  onChange={(e) => setForwardPhone(e.target.value)}
                  placeholder="+33 4 72 00 00 00"
                  className={inputClass}
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Le numéro réel qui reçoit les appels.
                </p>
              </div>
            </div>
          </div>

          {/* ======== SECTION ACTIVITÉ ======== */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <p className={sectionClass}>Activité</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Marge moyenne par VO (€)</label>
                <input
                  type="number"
                  value={averageMarginVo}
                  onChange={(e) => setAverageMarginVo(e.target.value)}
                  placeholder="Ex : 1 500"
                  className={inputClass}
                  min="1"
                  step="1"
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Utilisée pour estimer la marge générée dans les stats.
                </p>
              </div>
              <div>
                <label className={labelClass}>Publication leboncoin</label>
                <select
                  value={publicationMode}
                  onChange={(e) => setPublicationMode(e.target.value as "" | "manual" | "auto")}
                  className={inputClass}
                  required
                >
                  <option value="" disabled>Choisir…</option>
                  <option value="manual">Manuelle</option>
                  <option value="auto">Automatique</option>
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  Mode de publication de vos annonces VO.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange hover:bg-orange-dark disabled:opacity-50 text-white font-bold py-3.5 rounded-xl mt-2 shadow-md transition"
          >
            {loading ? "Création..." : "Créer mon compte"}
          </button>
          <p className="text-xs text-gray-500 text-center">
            Déjà un compte ?{" "}
            <Link href="/app/login" className="text-orange font-bold">Se connecter</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
