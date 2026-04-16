"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getProspect } from "../../../_lib/mockData";
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

export default function FichePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const prospect = getProspect(params.id);

  const [name, setName] = useState(prospect?.name ?? "");
  const [vehicle, setVehicle] = useState(prospect?.vehicleInterest ?? "");
  const [status, setStatus] = useState<CallbackStatus>(prospect?.status ?? "pending");
  const [appointmentAt, setAppointmentAt] = useState(prospect?.appointmentAt ?? "");
  const [notes, setNotes] = useState(prospect?.notes ?? "");

  if (!prospect) {
    return <div className="p-6">Prospect introuvable</div>;
  }

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    // MVP : stub. Backend : appeler l'API.
    alert(`Fiche enregistrée (mock) :\n${name}\n${vehicle}\n${status}`);
    router.push(`/app/rappels/${params.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-bleu px-5 pt-6 pb-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <Link href={`/app/rappels/${params.id}`} className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center" aria-label="Fermer">
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

      <form onSubmit={save} className="flex-1 flex flex-col">
        <div className="px-5 py-4 space-y-4 pb-28">
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

        <div className="fixed left-0 right-0 bottom-0 bg-white border-t border-gray-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="max-w-md mx-auto">
            <button
              type="submit"
              className="w-full bg-orange hover:bg-orange-dark text-white font-nunito font-extrabold py-3.5 rounded-2xl shadow-md transition"
            >
              Enregistrer la fiche
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
