"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import BottomNav from "../_components/BottomNav";
import SearchButton from "../_components/SearchButton";
import SearchBar from "../_components/SearchBar";
import { useNotificationRinger } from "../_components/NotificationRinger";

type Me = {
  id: string;
  email: string;
  name: string;
  dealership: string;
  twilioNumber: string | null;
  forwardPhone: string | null;
  role: string;
};

const SOUND_OPTIONS: { key: "cloche" | "sonnette"; label: string; description: string }[] = [
  { key: "cloche", label: "Cloche", description: "Tintement clair" },
  { key: "sonnette", label: "Sonnette", description: "Sonnette d'entrée" },
];

export default function ProfilPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pushEnabled, setPushEnabled] = useState(true);

  const { prefs, updatePrefs, playPreview } = useNotificationRinger();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) {
          if (!cancelled) {
            setError("Erreur de chargement");
            setLoading(false);
          }
          return;
        }
        const data: Me = await res.json();
        if (!cancelled) {
          setMe(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("Erreur réseau");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const initials = me
    ? me.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "…";

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-bleu px-5 pt-6 pb-10 text-white text-center relative">
        <div className="absolute top-4 right-4">
          <SearchButton />
        </div>
        <div className="w-20 h-20 bg-white/15 rounded-full mx-auto flex items-center justify-center mb-3">
          <span className="text-3xl font-nunito font-extrabold">{initials}</span>
        </div>
        <h1 className="text-xl font-nunito font-extrabold">{me?.name ?? (loading ? "Chargement…" : "—")}</h1>
        <p className="text-xs opacity-80">{me?.dealership ?? ""}</p>
      </div>

      <SearchBar />

      <div className="px-5 mt-4 space-y-4">
        {/* Infos */}
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
          {loading ? (
            <p className="text-center text-gray-400 text-sm py-6">Chargement…</p>
          ) : error ? (
            <p className="text-center text-red-600 text-sm py-6">{error}</p>
          ) : me ? (
            <>
              <Row label="Email" value={me.email} />
              <Row label="Numéro BoosterVO" value={me.twilioNumber ?? "Non configuré"} />
              <Row label="Numéro de transfert" value={me.forwardPhone ?? "Non configuré"} />
              <Row label="Concession" value={me.dealership} />
              {me.role === "admin" && <Row label="Rôle" value="Administrateur" />}
            </>
          ) : null}
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-sm p-1">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-3 pt-3">Notifications</p>
          <Toggle label="Notifications push" value={pushEnabled} onChange={setPushEnabled} />
          <Toggle
            label="Son des alertes"
            value={prefs.soundEnabled}
            onChange={(v) => updatePrefs({ soundEnabled: v })}
          />

          {/* Sélecteur de sonnerie */}
          <div className={`px-3 pb-3 pt-1 ${prefs.soundEnabled ? "" : "opacity-40 pointer-events-none"}`}>
            <p className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold mb-2 px-1">
              Sonnerie
            </p>
            <div className="space-y-2">
              {SOUND_OPTIONS.map((opt) => {
                const selected = prefs.notificationSound === opt.key;
                return (
                  <div
                    key={opt.key}
                    className={`flex items-center gap-2 rounded-xl border p-2 ${
                      selected ? "border-orange bg-orange/5" : "border-gray-200 bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => updatePrefs({ notificationSound: opt.key })}
                      className="flex-1 flex items-center gap-3 text-left"
                      aria-pressed={selected}
                    >
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selected ? "border-orange" : "border-gray-300"
                        }`}
                      >
                        {selected && <span className="w-2.5 h-2.5 bg-orange rounded-full" />}
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold">{opt.label}</span>
                        <span className="block text-[11px] text-gray-500">{opt.description}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => playPreview(opt.key)}
                      className="w-9 h-9 rounded-full bg-bleu/10 text-bleu flex items-center justify-center active:opacity-70"
                      aria-label={`Écouter ${opt.label}`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 4l10 6-10 6V4z" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-500 mt-2 px-1">
              La sonnerie retentit 3 fois (toutes les 10 s) à chaque nouvel appel manqué. Elle s&apos;arrête quand vous ouvrez le rappel.
            </p>
          </div>

          <p className="text-[10px] text-gray-400 px-3 pb-3 mt-1 italic">
            Les notifications push seront activées dans une prochaine version.
          </p>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
          <button className="w-full text-left px-4 py-3.5 text-sm font-semibold text-gray-400 cursor-not-allowed">
            Changer le mot de passe
            <span className="float-right text-[10px] text-gray-300">Bientôt</span>
          </button>
          <button className="w-full text-left px-4 py-3.5 text-sm font-semibold text-gray-500">
            Installer sur l&apos;écran d&apos;accueil
          </button>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/app/login" })}
          className="w-full text-center bg-white rounded-2xl shadow-sm py-4 text-red-600 font-bold"
        >
          Se déconnecter
        </button>

        <p className="text-center text-[11px] text-gray-400 pb-8">BoosterVO Rappels · version 0.1 (démo)</p>
      </div>

      <BottomNav />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5">
      <span className="text-sm font-semibold">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition relative ${value ? "bg-orange" : "bg-gray-300"}`}
        aria-pressed={value}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition shadow ${
            value ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
