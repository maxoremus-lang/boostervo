"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SimLead = {
  id: string;
  email: string;
  branch: string | null;
  appels: number;
  manques: number;
  decrochesImmediats: number;
  delayLabel: string;
  margeVo: number;
  convMoyenne: number;
  ventesTotalActuel: number;
  margeTotalActuel: number;
  gainVentesMois: number;
  gainMargeMois: number;
  gainMargeAn: number;
  slug: string | null;
  createdAt: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const fmtEUR = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n));
const fmtV = (n: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(n);
const pct = (n: number) => `${Math.round(n * 100)} %`;

function toCsv(rows: SimLead[]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const header = [
    "Email",
    "Branche",
    "Appels/mois",
    "Décrochés",
    "Manqués",
    "Délai rappel",
    "Marge/VO (€)",
    "Taux conv. moyen",
    "Ventes actuelles/mois",
    "Marge actuelle/mois (€)",
    "Gain ventes/mois",
    "Gain marge/mois (€)",
    "Gain marge/an (€)",
    "Lien source",
    "Date",
  ];
  const lines = rows.map((r) =>
    [
      r.email,
      r.branch ?? "",
      r.appels,
      r.decrochesImmediats,
      r.manques,
      r.delayLabel,
      r.margeVo,
      pct(r.convMoyenne),
      fmtV(r.ventesTotalActuel),
      r.margeTotalActuel,
      fmtV(r.gainVentesMois),
      r.gainMargeMois,
      r.gainMargeAn,
      r.slug ?? "",
      new Date(r.createdAt).toLocaleString("fr-FR"),
    ]
      .map((v) => escape(String(v)))
      .join(",")
  );
  return [header.map(escape).join(","), ...lines].join("\r\n");
}

export default function AdminSimulatorLeadsPage() {
  const [rows, setRows] = useState<SimLead[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/simulator-leads");
        if (res.status === 403) {
          setLoadError("Accès réservé aux administrateurs.");
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setLoadError("Erreur de chargement");
          setLoading(false);
          return;
        }
        setRows(await res.json());
        setLoading(false);
      } catch {
        setLoadError("Erreur réseau");
        setLoading(false);
      }
    })();
  }, []);

  function exportCsv() {
    if (!rows || rows.length === 0) return;
    // ﻿ (BOM) pour qu'Excel ouvre l'UTF-8 sans casser les accents.
    const csv = "﻿" + toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-simulateur-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const totalGainAn = rows ? rows.reduce((s, r) => s + r.gainMargeAn, 0) : 0;

  return (
    <div className="pb-16">
      <div className="bg-bleu px-5 pt-6 pb-6 text-white">
        <Link
          href="/app/profil"
          className="text-xs opacity-80 inline-flex items-center gap-1 mb-2"
        >
          ← Retour profil
        </Link>
        <h1 className="text-xl font-nunito font-extrabold">Leads simulateur</h1>
        <p className="text-xs opacity-80 mt-1">
          Visiteurs ayant complété le simulateur « Combien mes appels me coûtent / rapportent » (home).
        </p>
      </div>

      <div className="px-5 mt-4 space-y-4">
        {loading && (
          <p className="text-center text-gray-400 text-sm py-6">Chargement…</p>
        )}

        {loadError && (
          <p className="text-center text-red-600 text-sm py-6">{loadError}</p>
        )}

        {!loading && !loadError && rows && (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Leads captés
                </p>
                <p className="text-2xl font-nunito font-extrabold text-orange mt-1">
                  {rows.length}
                </p>
                {rows.length > 0 && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    {fmtEUR(totalGainAn)} € de gain annuel estimé cumulé
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={exportCsv}
                disabled={rows.length === 0}
                className="bg-orange text-white text-sm font-bold px-5 py-3 rounded-lg disabled:opacity-50 hover:opacity-90"
              >
                Exporter CSV
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
              {rows.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">
                  Aucun lead pour le moment.
                </p>
              ) : (
                rows.map((r) => (
                  <div key={r.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <a
                          href={`mailto:${r.email}`}
                          className="text-sm font-bold text-orange truncate block hover:underline"
                        >
                          {r.email}
                        </a>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {r.appels} appels · {r.manques} manqués · rappel {r.delayLabel} · marge {fmtEUR(r.margeVo)} €
                        </p>
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <p className="text-[11px] font-semibold text-gray-600">
                          {formatDate(r.createdAt)}
                        </p>
                        {r.slug && (
                          <span className="inline-block text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            /{r.slug}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Résultats du calcul */}
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="bg-gray-50 rounded-lg py-2">
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Conv. moyenne</p>
                        <p className="text-sm font-extrabold text-bleu">{pct(r.convMoyenne)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg py-2">
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Ventes / mois</p>
                        <p className="text-sm font-extrabold text-bleu">{fmtV(r.ventesTotalActuel)}</p>
                      </div>
                      <div className="bg-orange/10 rounded-lg py-2">
                        <p className="text-[9px] font-bold text-orange/70 uppercase">Gain / an</p>
                        <p className="text-sm font-extrabold text-orange">+ {fmtEUR(r.gainMargeAn)} €</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
