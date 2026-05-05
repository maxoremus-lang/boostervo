"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type LinkStat = {
  id: string;
  slug: string;
  label: string | null;
  destination: string;
  active: boolean;
  totalClicks: number;
  uniqueVisitors: number;
  totalConversions: number;
  conversionRate: number;
  downloadedManuel: number;
  downloadedManuelRate: number;
  lastClickAt: string | null;
};

const MANUEL_SLUG = "manuel-app";

type RecentClick = {
  id: string;
  createdAt: string;
  device: string | null;
  browser: string | null;
  os: string | null;
  referer: string | null;
  ip: string | null;
  convertedAt: string | null;
  user: { email: string; dealership: string | null } | null;
};

const ORIGIN_FALLBACK = "https://boostervo.fr";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPercent(rate: number) {
  return `${(rate * 100).toFixed(1)}%`;
}

export default function AdminLinksPage() {
  const [links, setLinks] = useState<LinkStat[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Edition inline d'un lien
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ label: string; destination: string }>({
    label: "",
    destination: "",
  });
  const [savingId, setSavingId] = useState<string | null>(null);

  // Détail (clics récents) ouvert
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<RecentClick[] | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Origine pour afficher l'URL complète
  const [origin, setOrigin] = useState(ORIGIN_FALLBACK);
  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  async function loadLinks() {
    try {
      const res = await fetch("/api/admin/links");
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
      setLinks(await res.json());
      setLoading(false);
    } catch {
      setLoadError("Erreur réseau");
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLinks();
  }, []);

  function startEdit(link: LinkStat) {
    setEditingId(link.id);
    setEditForm({ label: link.label ?? "", destination: link.destination });
  }

  async function saveEdit(id: string) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/links/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: editForm.label,
          destination: editForm.destination,
        }),
      });
      if (!res.ok) {
        alert("Erreur lors de la sauvegarde");
        return;
      }
      setEditingId(null);
      await loadLinks();
    } finally {
      setSavingId(null);
    }
  }

  async function toggleActive(link: LinkStat) {
    setSavingId(link.id);
    try {
      await fetch(`/api/admin/links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !link.active }),
      });
      await loadLinks();
    } finally {
      setSavingId(null);
    }
  }

  async function openDetail(id: string) {
    if (detailId === id) {
      setDetailId(null);
      setDetail(null);
      return;
    }
    setDetailId(id);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/links/${id}`);
      const data = await res.json();
      setDetail(data.recentClicks || []);
    } catch {
      setDetail([]);
    } finally {
      setDetailLoading(false);
    }
  }

  async function copyUrl(slug: string) {
    const url = `${origin}/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copiez ce lien :", url);
    }
  }

  // Totaux globaux
  const totals = links
    ? links.reduce(
        (acc, l) => {
          acc.clicks += l.totalClicks;
          acc.conv += l.totalConversions;
          return acc;
        },
        { clicks: 0, conv: 0 }
      )
    : null;
  const globalRate = totals && totals.clicks > 0 ? totals.conv / totals.clicks : 0;

  return (
    <div className="pb-16">
      <div className="bg-bleu px-5 pt-6 pb-6 text-white">
        <Link
          href="/app/profil"
          className="text-xs opacity-80 inline-flex items-center gap-1 mb-2"
        >
          ← Retour profil
        </Link>
        <h1 className="text-xl font-nunito font-extrabold">Liens courts trackés</h1>
        <p className="text-xs opacity-80 mt-1">
          Suivez les clics et conversions de vos campagnes SMS / email / LinkedIn.
        </p>
      </div>

      <div className="px-5 mt-4 space-y-4">
        {loading && (
          <p className="text-center text-gray-400 text-sm py-6">Chargement…</p>
        )}

        {loadError && (
          <p className="text-center text-red-600 text-sm py-6">{loadError}</p>
        )}

        {/* Totaux globaux */}
        {!loading && !loadError && totals && (
          <div className="bg-white rounded-2xl shadow-sm p-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                Clics totaux
              </p>
              <p className="text-2xl font-nunito font-extrabold text-bleu mt-1">
                {totals.clicks}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                Inscriptions
              </p>
              <p className="text-2xl font-nunito font-extrabold text-orange mt-1">
                {totals.conv}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                Taux global
              </p>
              <p className="text-2xl font-nunito font-extrabold text-bleu mt-1">
                {formatPercent(globalRate)}
              </p>
            </div>
          </div>
        )}

        {/* Liste des liens */}
        {!loading && links && (
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
            {links.map((link) => {
              const fullUrl = `${origin}/${link.slug}`;
              const shortUrl = fullUrl.replace(/^https?:\/\//, "");
              const isEditing = editingId === link.id;
              const isDetail = detailId === link.id;

              return (
                <div key={link.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-bleu">
                          /{link.slug}
                        </span>
                        {!link.active && (
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full uppercase">
                            Désactivé
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {link.label ?? <em className="text-gray-300">Aucun libellé</em>}
                      </p>
                      <button
                        type="button"
                        onClick={() => copyUrl(link.slug)}
                        className="text-[11px] text-gray-400 mt-1 hover:text-bleu inline-flex items-center gap-1 truncate"
                        title="Copier le lien"
                      >
                        🔗 {shortUrl}
                      </button>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                      <p className="text-lg font-nunito font-extrabold text-bleu leading-none">
                        {link.totalClicks}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">
                        clics · {link.uniqueVisitors} visiteur{link.uniqueVisitors > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Stats détaillées : 4 colonnes pour les campagnes (avec
                      "manuel téléchargé"), 3 colonnes pour /manuel-app lui-même
                      (où le cross-tab n'a pas de sens). */}
                  <div
                    className={`mt-3 grid gap-2 bg-gray-50 rounded-lg px-3 py-2 text-center ${
                      link.slug === MANUEL_SLUG ? "grid-cols-3" : "grid-cols-4"
                    }`}
                  >
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase font-bold">Inscriptions</p>
                      <p className="text-sm font-bold text-orange">{link.totalConversions}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase font-bold">Taux</p>
                      <p className="text-sm font-bold text-bleu">
                        {formatPercent(link.conversionRate)}
                      </p>
                    </div>
                    {link.slug !== MANUEL_SLUG && (
                      <div title="Visiteurs de ce lien qui ont aussi cliqué sur le bouton 'Télécharger le manuel'">
                        <p className="text-[9px] text-gray-400 uppercase font-bold">Manuel ↓</p>
                        <p className="text-sm font-bold text-bleu">
                          {link.downloadedManuel}
                          <span className="text-[10px] text-gray-400 font-semibold ml-1">
                            ({formatPercent(link.downloadedManuelRate)})
                          </span>
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase font-bold">Dernier clic</p>
                      <p className="text-[11px] font-semibold text-gray-700">
                        {formatDate(link.lastClickAt)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    {!isEditing && (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(link)}
                          className="flex-1 text-xs font-semibold text-bleu border border-gray-200 rounded-lg py-2 hover:bg-gray-50"
                        >
                          Éditer
                        </button>
                        <button
                          type="button"
                          onClick={() => openDetail(link.id)}
                          className="flex-1 text-xs font-semibold text-bleu border border-gray-200 rounded-lg py-2 hover:bg-gray-50"
                        >
                          {isDetail ? "Masquer" : "Voir clics"}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleActive(link)}
                          disabled={savingId === link.id}
                          className={`flex-1 text-xs font-semibold rounded-lg py-2 ${
                            link.active
                              ? "text-gray-600 border border-gray-200 hover:bg-gray-50"
                              : "text-white bg-orange hover:opacity-90"
                          }`}
                        >
                          {link.active ? "Désactiver" : "Réactiver"}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Formulaire d'édition */}
                  {isEditing && (
                    <div className="mt-3 bg-orange/5 rounded-lg p-3 space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">
                          Libellé
                        </label>
                        <input
                          type="text"
                          value={editForm.label}
                          onChange={(e) =>
                            setEditForm({ ...editForm, label: e.target.value })
                          }
                          placeholder="Ex : SMS Garages Paris semaine 1"
                          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-bleu"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">
                          Destination
                        </label>
                        <input
                          type="text"
                          value={editForm.destination}
                          onChange={(e) =>
                            setEditForm({ ...editForm, destination: e.target.value })
                          }
                          placeholder="/app/signup"
                          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-bleu"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => saveEdit(link.id)}
                          disabled={savingId === link.id}
                          className="flex-1 bg-orange text-white text-xs font-bold py-2 rounded-lg disabled:opacity-50"
                        >
                          {savingId === link.id ? "Sauvegarde…" : "Enregistrer"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Détail clics récents */}
                  {isDetail && (
                    <div className="mt-3 bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">
                        50 derniers clics
                      </p>
                      {detailLoading ? (
                        <p className="text-xs text-gray-400 text-center py-3">Chargement…</p>
                      ) : detail && detail.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                          {detail.map((c) => (
                            <li key={c.id} className="py-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-[11px] text-gray-700 truncate">
                                  {formatDate(c.createdAt)} · {c.device || "?"} ·{" "}
                                  {c.browser || "?"} ({c.os || "?"})
                                </div>
                                {c.convertedAt && (
                                  <span className="text-[10px] font-bold text-white bg-orange px-2 py-0.5 rounded-full shrink-0">
                                    INSCRIT
                                  </span>
                                )}
                              </div>
                              {c.user && (
                                <p className="text-[10px] text-orange truncate mt-0.5">
                                  → {c.user.email}
                                  {c.user.dealership ? ` · ${c.user.dealership}` : ""}
                                </p>
                              )}
                              {c.referer && (
                                <p className="text-[10px] text-gray-400 truncate">
                                  via {c.referer}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-400 text-center py-3">
                          Aucun clic pour le moment.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
