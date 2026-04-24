"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { CallbackStatus } from "../../../_lib/types";

const resultSections: { label: string; options: { status: CallbackStatus; label: string }[] }[] = [
  {
    label: "Pas abouti",
    options: [
      { status: "unreachable", label: "Injoignable" },
      { status: "pending", label: "À recontacter" },
    ],
  },
  {
    label: "Qualifié (en cours)",
    options: [
      { status: "appointment", label: "RDV pris" },
      { status: "test_drive", label: "Essai" },
      { status: "quote_sent", label: "Devis envoyé" },
    ],
  },
  {
    label: "Terminé",
    options: [
      { status: "not_interested", label: "Pas intéressé" },
      { status: "sold", label: "Vente conclue" },
    ],
  },
];

type Prospect = {
  id: string;
  phone: string;
  name: string | null;
  vehicleInterest: string | null;
  status: CallbackStatus;
  appointmentAt: string | null;
  notes: string | null;
};

export default function FichePage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [status, setStatus] = useState<CallbackStatus>("pending");
  const [appointmentAt, setAppointmentAt] = useState("");
  const [notes, setNotes] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [saleMargin, setSaleMargin] = useState("");
  const [saving, setSaving] = useState(false);

  // Charger le prospect depuis l'API
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/prospects/${params.id}`);
        if (!res.ok) {
          if (!cancelled) {
            setError(res.status === 404 ? "Prospect introuvable" : "Erreur de chargement");
            setLoading(false);
          }
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setProspect(data);
        setName(data.name ?? "");
        setVehicle(data.vehicleInterest ?? "");
        setStatus(data.status ?? "pending");
        setAppointmentAt(data.appointmentAt ?? "");
        setNotes(data.notes ?? "");
        setSalePrice(data.salePrice != null ? String(data.salePrice) : "");
        setSaleMargin(data.saleMargin != null ? String(data.saleMargin) : "");
        setLoading(false);
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
  }, [params.id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/prospects/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          vehicleInterest: vehicle,
          status,
          appointmentAt: status === "appointment" ? appointmentAt || null : null,
          notes,
          // Prix/marge : uniquement si statut "sold", sinon remet à null pour ne pas
          // garder une valeur obsolète si on repasse sur un autre statut.
          salePrice: status === "sold" ? (salePrice ? parseFloat(salePrice) : null) : null,
          saleMargin: status === "sold" ? (saleMargin ? parseFloat(saleMargin) : null) : null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        setError(err.error ?? "Erreur lors de l'enregistrement");
        setSaving(false);
        return;
      }
      router.push(`/app/rappels/${params.id}`);
      router.refresh();
    } catch {
      setError("Erreur réseau");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Chargement…
      </div>
    );
  }

  if (!prospect) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <p className="text-red-600 mb-4">{error ?? "Prospect introuvable"}</p>
        <Link href="/app/rappels" className="text-orange font-bold">
          Retour aux rappels
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-white">
      {/* Header fixe */}
      <div className="shrink-0 bg-bleu px-5 pt-6 pb-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <Link
            href={`/app/rappels/${params.id}`}
            className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
          <Link href={`/app/rappels/${params.id}`} className="text-xs font-bold opacity-70">
            Passer
          </Link>
        </div>
        <p className="text-xs uppercase opacity-70 font-semibold">Appel terminé ✓</p>
        <h1 className="text-xl font-nunito font-extrabold">Remplir la fiche</h1>
        <p className="text-xs opacity-80">{prospect.phone}</p>
      </div>

      {/* Form = zone scrollable + footer fixe */}
      <form onSubmit={save} className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Nom du prospect</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Sophie Leroy"
              className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Véhicule d&apos;intérêt</label>
            <input
              type="text"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="Marque, modèle, année, annonce VO…"
              className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Résultat de l&apos;appel</label>
            {resultSections.map((sec) => (
              <div key={sec.label}>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-3 mb-1.5">{sec.label}</p>
                <div className={`grid gap-2 ${sec.options.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                  {sec.options.map((opt) => {
                    const selected = status === opt.status;
                    return (
                      <button
                        key={opt.status + opt.label}
                        type="button"
                        onClick={() => setStatus(opt.status)}
                        className={`px-2 py-2.5 rounded-xl text-xs font-bold border-2 transition ${
                          selected
                            ? "bg-green-50 border-green-500 text-green-700"
                            : "bg-white border-gray-200 text-gray-600"
                        }`}
                      >
                        {selected ? "✓ " : ""}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {status === "appointment" && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <label className="text-xs font-bold text-green-800 uppercase tracking-wide">Date du RDV</label>
              <input
                type="datetime-local"
                value={appointmentAt ? appointmentAt.slice(0, 16) : ""}
                onChange={(e) => setAppointmentAt(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-white border border-green-300 rounded-lg text-sm"
              />
            </div>
          )}

          {status === "sold" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-3">
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Détails de la vente</p>
              <div>
                <label className="text-[11px] font-semibold text-emerald-700">Prix de vente VO (€)</label>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="Ex : 18 500"
                  min="0"
                  step="1"
                  className="w-full mt-1 px-3 py-2 bg-white border border-emerald-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-emerald-700">Marge VO (€)</label>
                <input
                  type="number"
                  value={saleMargin}
                  onChange={(e) => setSaleMargin(e.target.value)}
                  placeholder="Ex : 2 300"
                  min="0"
                  step="1"
                  className="w-full mt-1 px-3 py-2 bg-white border border-emerald-300 rounded-lg text-sm"
                />
                <p className="text-[10px] text-emerald-600/80 mt-1">
                  Laissez vide pour utiliser la marge moyenne par défaut de la concession.
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Budget, financement, véhicule à reprendre…"
              className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Footer toujours visible */}
        <div className="shrink-0 bg-white border-t border-gray-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="max-w-md mx-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-2 text-center">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-orange hover:bg-orange-dark disabled:opacity-50 text-white font-nunito font-extrabold py-3.5 rounded-2xl shadow-md transition"
            >
              {saving ? "Enregistrement…" : "Enregistrer la fiche"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
