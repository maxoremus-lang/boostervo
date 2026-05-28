"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Lead = {
  id: string;
  firstName: string;
  email: string;
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

function toCsv(leads: Lead[]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const header = ["Prénom", "Email", "Lien source", "Date"];
  const rows = leads.map((l) =>
    [l.firstName, l.email, l.slug ?? "", new Date(l.createdAt).toLocaleString("fr-FR")]
      .map((v) => escape(String(v)))
      .join(",")
  );
  return [header.map(escape).join(","), ...rows].join("\r\n");
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/vsl-leads");
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
        setLeads(await res.json());
        setLoading(false);
      } catch {
        setLoadError("Erreur réseau");
        setLoading(false);
      }
    })();
  }, []);

  function exportCsv() {
    if (!leads || leads.length === 0) return;
    // ﻿ (BOM) pour que Excel ouvre l'UTF-8 sans casser les accents.
    const csv = "﻿" + toCsv(leads);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-vsl-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="pb-16">
      <div className="bg-bleu px-5 pt-6 pb-6 text-white">
        <Link
          href="/app/admin/links"
          className="text-xs opacity-80 inline-flex items-center gap-1 mb-2"
        >
          ← Liens courts
        </Link>
        <h1 className="text-xl font-nunito font-extrabold">Leads VSL</h1>
        <p className="text-xs opacity-80 mt-1">
          Emails captés sur la page vidéo à accès restreint (lien go9).
        </p>
      </div>

      <div className="px-5 mt-4 space-y-4">
        {loading && (
          <p className="text-center text-gray-400 text-sm py-6">Chargement…</p>
        )}

        {loadError && (
          <p className="text-center text-red-600 text-sm py-6">{loadError}</p>
        )}

        {!loading && !loadError && leads && (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Leads captés
                </p>
                <p className="text-2xl font-nunito font-extrabold text-orange mt-1">
                  {leads.length}
                </p>
              </div>
              <button
                type="button"
                onClick={exportCsv}
                disabled={leads.length === 0}
                className="bg-orange text-white text-sm font-bold px-5 py-3 rounded-lg disabled:opacity-50 hover:opacity-90"
              >
                Exporter CSV
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
              {leads.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">
                  Aucun lead pour le moment.
                </p>
              ) : (
                leads.map((l) => (
                  <div key={l.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-bleu truncate">
                          {l.firstName}
                        </p>
                        <a
                          href={`mailto:${l.email}`}
                          className="text-xs text-orange truncate block hover:underline"
                        >
                          {l.email}
                        </a>
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <p className="text-[11px] font-semibold text-gray-600">
                          {formatDate(l.createdAt)}
                        </p>
                        {l.slug && (
                          <span className="inline-block text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            /{l.slug}
                          </span>
                        )}
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
