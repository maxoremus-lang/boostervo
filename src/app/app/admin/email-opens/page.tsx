"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Campaign = {
  campaign: string;
  opens: number;
  uniqueRecipients: number;
  firstAt: string;
  lastAt: string;
};
type Stats = { totalOpens: number; campaigns: Campaign[] };

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Normalise un libellé de campagne pour l'URL (sans espaces ni accents).
function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const ORIGIN = "https://boostervo.fr";

export default function AdminEmailOpensPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [campaignName, setCampaignName] = useState("");
  const [mergeTag, setMergeTag] = useState("$[EMAIL]$");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/email-opens");
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
        setStats(await res.json());
        setLoading(false);
      } catch {
        setLoadError("Erreur réseau");
        setLoading(false);
      }
    })();
  }, []);

  const slug = slugify(campaignName);
  const snippet = useMemo(() => {
    const c = slug || "ma-campagne";
    // Le tag de fusion doit rester LITTÉRAL (non encodé) pour que l'outil
    // d'envoi (Zoho…) le remplace par l'email réel du destinataire à l'envoi.
    const r = mergeTag.trim() ? `&r=${mergeTag.trim()}` : "";
    return `<img src="${ORIGIN}/api/email-open?c=${c}${r}" width="1" height="1" alt="" style="display:none" />`;
  }, [slug, mergeTag]);

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard indisponible : l'utilisateur peut copier à la main */
    }
  }

  return (
    <div className="pb-16">
      <div className="bg-bleu px-5 pt-6 pb-6 text-white">
        <Link
          href="/app/profil"
          className="text-xs opacity-80 inline-flex items-center gap-1 mb-2"
        >
          ← Retour profil
        </Link>
        <h1 className="text-xl font-nunito font-extrabold">Ouvertures d&apos;emails</h1>
        <p className="text-xs opacity-80 mt-1">
          Suivi des ouvertures via pixel de tracking, par campagne.
        </p>
      </div>

      <div className="px-5 mt-4 space-y-4">
        {/* Générateur de pixel */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
            Générer le pixel à insérer dans l&apos;email
          </p>
          <div>
            <label className="text-xs font-semibold text-gray-600">Nom de la campagne</label>
            <input
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="ex : relance mars 2026"
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">
              Tag « email du destinataire » de ton outil (laisse vide si aucun)
            </label>
            <input
              value={mergeTag}
              onChange={(e) => setMergeTag(e.target.value)}
              placeholder="$[EMAIL]$"
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Zoho : <code>$[EMAIL]$</code>. Sinon, utilise le tag de fusion email de ton outil
              d&apos;envoi (ou laisse vide).
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-[11px] font-mono break-all text-gray-700">
            {snippet}
          </div>
          <button
            type="button"
            onClick={copySnippet}
            className="bg-orange text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:opacity-90"
          >
            {copied ? "Copié ✓" : "Copier le pixel"}
          </button>
          <p className="text-[11px] text-gray-400">
            Colle ce code dans le HTML de ton email (vue « code source »). Pense à utiliser un nom
            de campagne <b>différent à chaque envoi</b> pour des stats séparées.
          </p>
        </div>

        {loading && <p className="text-center text-gray-400 text-sm py-6">Chargement…</p>}
        {loadError && <p className="text-center text-red-600 text-sm py-6">{loadError}</p>}

        {!loading && !loadError && stats && (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                Ouvertures totales
              </p>
              <p className="text-2xl font-nunito font-extrabold text-orange mt-1">
                {stats.totalOpens}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
              {stats.campaigns.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">
                  Aucune ouverture enregistrée pour le moment.
                </p>
              ) : (
                stats.campaigns.map((c) => (
                  <div key={c.campaign} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-bleu truncate">{c.campaign}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          dernière : {formatDate(c.lastAt)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-nunito font-extrabold text-bleu leading-none">
                          {c.uniqueRecipients}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">
                          ouvreurs
                        </p>
                        <p className="text-[11px] text-gray-500 mt-1">{c.opens} ouvertures</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <p className="text-[11px] text-gray-400 px-1">
              ⚠️ Fiabilité limitée : Apple Mail précharge les images (gonfle les ouvertures), et
              certains clients bloquent les images (sous-estime). Les clics restent plus fiables.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
