"use client";

import Link from "next/link";
import { useEffect, useState, FormEvent } from "react";

type AdminUser = {
  id: string;
  email: string;
  name: string;
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
