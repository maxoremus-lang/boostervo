"use client";

import Link from "next/link";
import { useEffect, useState, FormEvent } from "react";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  mobile: string | null;
  website: string | null;
  dealership: string | null;
  twilioNumber: string | null;
  forwardPhone: string | null;
  role: string;
  createdAt: string;
};

type Role = "negotiant" | "admin" | "invite" | "partenaire";

const ROLE_LABELS: Record<Role, string> = {
  negotiant: "Négociant",
  admin: "Administrateur",
  invite: "Invité",
  partenaire: "Partenaire",
};

type FormState = {
  email: string;
  password: string;
  name: string;
  dealership: string;
  twilioNumber: string;
  forwardPhone: string;
  role: Role;
};

const EMPTY_FORM: FormState = {
  email: "",
  password: "",
  name: "",
  dealership: "",
  twilioNumber: "",
  forwardPhone: "",
  role: "negotiant",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Activation d'une inscription en attente (assignation Twilio + forward)
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [activateForm, setActivateForm] = useState({ twilioNumber: "", forwardPhone: "" });
  const [activateError, setActivateError] = useState<string | null>(null);
  const [activateSubmitting, setActivateSubmitting] = useState(false);

  async function loadUsers() {
    try {
      const res = await fetch("/api/admin/users");
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
      const data: AdminUser[] = await res.json();
      setUsers(data);
      setLoadError(null);
    } catch {
      setLoadError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function startActivate(u: AdminUser) {
    setActivatingId(u.id);
    setActivateForm({ twilioNumber: "", forwardPhone: u.mobile ?? "" });
    setActivateError(null);
  }

  function cancelActivate() {
    setActivatingId(null);
    setActivateError(null);
  }

  async function handleActivate(e: FormEvent) {
    e.preventDefault();
    if (!activatingId) return;
    setActivateSubmitting(true);
    setActivateError(null);
    try {
      const res = await fetch(`/api/admin/users/${activatingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activateForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActivateError(data?.error || "Erreur d'activation");
        return;
      }
      setActivatingId(null);
      await loadUsers();
    } catch {
      setActivateError("Erreur réseau");
    } finally {
      setActivateSubmitting(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data?.error || "Erreur de création");
        return;
      }
      setFormSuccess(`Utilisateur ${data.email} créé`);
      setForm(EMPTY_FORM);
      await loadUsers();
    } catch {
      setFormError("Erreur réseau");
    } finally {
      setSubmitting(false);
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
        <h1 className="text-xl font-nunito font-extrabold">Gestion des utilisateurs</h1>
        <p className="text-xs opacity-80 mt-1">Créer et consulter les comptes négociants</p>
      </div>

      <div className="px-5 mt-4 space-y-4">
        {/* Inscriptions à traiter (négociants sans numéro Twilio) */}
        {users && users.filter((u) => u.role === "negotiant" && !u.twilioNumber).length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-orange">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-orange uppercase tracking-wide">
                Inscriptions à traiter
              </p>
              <span className="text-[10px] font-bold text-orange bg-orange/10 px-2 py-0.5 rounded-full">
                {users.filter((u) => u.role === "negotiant" && !u.twilioNumber).length}
              </span>
            </div>
            <ul className="divide-y divide-gray-100">
              {users
                .filter((u) => u.role === "negotiant" && !u.twilioNumber)
                .map((u) => {
                  const fullName = u.firstName || u.lastName
                    ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
                    : u.name;
                  return (
                    <li key={u.id} className="py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate">{fullName}</p>
                          {u.dealership && (
                            <p className="text-xs text-gray-600 truncate">{u.dealership}</p>
                          )}
                          <p className="text-xs text-gray-500 truncate">{u.email}</p>
                          {u.mobile && (
                            <p className="text-xs text-gray-500 truncate">📱 {u.mobile}</p>
                          )}
                          {u.website && (
                            <p className="text-[11px] text-gray-400 truncate mt-0.5">
                              <a href={u.website} target="_blank" rel="noopener noreferrer" className="hover:text-bleu underline">
                                {u.website}
                              </a>
                            </p>
                          )}
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Inscrit le {new Date(u.createdAt).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {activatingId !== u.id && (
                          <button
                            type="button"
                            onClick={() => startActivate(u)}
                            className="text-xs font-bold text-white bg-orange px-3 py-1.5 rounded-lg shrink-0 hover:opacity-90"
                          >
                            Activer
                          </button>
                        )}
                      </div>

                      {/* Formulaire d'activation inline */}
                      {activatingId === u.id && (
                        <form onSubmit={handleActivate} className="mt-3 bg-orange/5 rounded-lg p-3 space-y-2">
                          <Field
                            label="Numéro Twilio *"
                            value={activateForm.twilioNumber}
                            onChange={(v) => setActivateForm({ ...activateForm, twilioNumber: v })}
                            placeholder="+33159168772"
                            required
                          />
                          <Field
                            label="Numéro de transfert *"
                            value={activateForm.forwardPhone}
                            onChange={(v) => setActivateForm({ ...activateForm, forwardPhone: v })}
                            placeholder="+33600000000"
                            required
                          />
                          {activateError && <p className="text-xs text-red-600">{activateError}</p>}
                          <div className="flex gap-2 pt-1">
                            <button
                              type="submit"
                              disabled={activateSubmitting}
                              className="flex-1 bg-orange text-white text-xs font-bold py-2 rounded-lg disabled:opacity-50"
                            >
                              {activateSubmitting ? "Activation…" : "Confirmer l'activation"}
                            </button>
                            <button
                              type="button"
                              onClick={cancelActivate}
                              className="px-3 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg"
                            >
                              Annuler
                            </button>
                          </div>
                        </form>
                      )}
                    </li>
                  );
                })}
            </ul>
          </div>
        )}

        {/* Formulaire création */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            Nouvel utilisateur
          </p>

          <Field
            label="Email *"
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            placeholder="jean.martin@concession-lyon.fr"
            required
          />
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Mot de passe * (8 caractères min)
            </label>
            <div className="flex gap-2">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-bleu"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="px-3 text-xs font-semibold text-bleu"
              >
                {showPassword ? "Cacher" : "Voir"}
              </button>
            </div>
          </div>
          <Field
            label="Nom *"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            placeholder="Jean Martin"
            required
          />
          <Field
            label="Concession"
            value={form.dealership}
            onChange={(v) => setForm({ ...form, dealership: v })}
            placeholder="Concession Lyon Est"
          />
          <Field
            label="Numéro Twilio"
            value={form.twilioNumber}
            onChange={(v) => setForm({ ...form, twilioNumber: v })}
            placeholder="+33159168772"
          />
          <Field
            label="Numéro de transfert"
            value={form.forwardPhone}
            onChange={(v) => setForm({ ...form, forwardPhone: v })}
            placeholder="+33600000000"
          />
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Rôle</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-bleu bg-white"
            >
              <option value="negotiant">Négociant</option>
              <option value="admin">Administrateur</option>
              <option value="invite">Invité</option>
              <option value="partenaire">Partenaire</option>
            </select>
          </div>

          {formError && <p className="text-xs text-red-600">{formError}</p>}
          {formSuccess && <p className="text-xs text-green-600">{formSuccess}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange text-white font-bold py-3 rounded-xl disabled:opacity-50"
          >
            {submitting ? "Création…" : "Créer l'utilisateur"}
          </button>
        </form>

        {/* Liste des users */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            Utilisateurs {users ? `(${users.length})` : ""}
          </p>
          {loading ? (
            <p className="text-center text-gray-400 text-sm py-4">Chargement…</p>
          ) : loadError ? (
            <p className="text-center text-red-600 text-sm py-4">{loadError}</p>
          ) : users && users.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {users.map((u) => (
                <li key={u.id} className="py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{u.name}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      {u.dealership && (
                        <p className="text-xs text-gray-500 truncate">{u.dealership}</p>
                      )}
                      {(u.twilioNumber || u.forwardPhone) && (
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                          {u.twilioNumber ?? "—"} → {u.forwardPhone ?? "—"}
                        </p>
                      )}
                    </div>
                    {u.role !== "negotiant" && (
                      <span className="text-[10px] font-bold text-bleu bg-bleu/10 px-2 py-0.5 rounded-full shrink-0 uppercase">
                        {ROLE_LABELS[u.role as Role] ?? u.role}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-400 text-sm py-4">Aucun utilisateur</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-bleu"
      />
    </div>
  );
}
