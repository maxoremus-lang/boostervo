"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCall } from "../../_components/Providers";
import type { Prospect, CallbackStatus } from "../../_lib/types";

type Period = "day" | "week" | "month" | "all";

type ApiResponse = {
  prospects: Prospect[];
  counts: { urgent: number; todo: number; in_progress: number; done: number; all: number };
  byStatus: Record<CallbackStatus, number>;
};

type ColumnKey = "todo" | "appointment" | "test_drive" | "quote_sent" | "sold";

const COLUMNS: { key: ColumnKey; label: string; dot: string; bg: string; statuses: CallbackStatus[] }[] = [
  {
    key: "todo",
    label: "À faire",
    dot: "bg-red-500",
    bg: "bg-gradient-to-b from-red-50 to-orange-50",
    statuses: ["pending", "postponed", "unreachable"],
  },
  {
    key: "appointment",
    label: "RDV pris",
    dot: "bg-violet-500",
    bg: "bg-gradient-to-b from-violet-50 to-purple-50",
    statuses: ["appointment"],
  },
  {
    key: "test_drive",
    label: "Essai",
    dot: "bg-purple-500",
    bg: "bg-gradient-to-b from-purple-50 to-fuchsia-50",
    statuses: ["test_drive"],
  },
  {
    key: "quote_sent",
    label: "Devis envoyé",
    dot: "bg-blue-500",
    bg: "bg-gradient-to-b from-blue-50 to-sky-50",
    statuses: ["quote_sent"],
  },
  {
    key: "sold",
    label: "Vendus",
    dot: "bg-emerald-500",
    bg: "bg-gradient-to-b from-emerald-50 to-green-50",
    statuses: ["sold"],
  },
];

function PhoneIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
  );
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("33") && digits.length === 11) {
    const local = "0" + digits.slice(2);
    return local.match(/.{1,2}/g)?.join(" ") ?? raw;
  }
  if (digits.length === 10 && digits.startsWith("0")) {
    return digits.match(/.{1,2}/g)?.join(" ") ?? raw;
  }
  return raw;
}

function parisDayKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);
}

function formatShort(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const time = d
    .toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit", hour12: false })
    .replace(":", "h");
  const dKey = parisDayKey(d);
  const todayKey = parisDayKey(now);
  if (dKey === todayKey) return `Auj. ${time}`;
  const yesterdayKey = parisDayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  if (dKey === yesterdayKey) return `Hier ${time}`;
  const dayMonth = d
    .toLocaleDateString("fr-FR", { timeZone: "Europe/Paris", day: "numeric", month: "short" })
    .replace(".", "");
  return `${dayMonth} ${time}`;
}

function formatAppointment(iso: string): string {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "short", day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekday = get("weekday").replace(".", "");
  const weekdayCap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${weekdayCap}. ${get("day")} ${get("month").replace(".", "")} · ${get("hour")}h${get("minute")}`;
}

function missedCount(p: Prospect): number {
  return p.callEvents.filter((e) => e.type === "missed" && e.direction !== "outbound").length;
}

function ProspectCardKanban({ prospect }: { prospect: Prospect }) {
  const { startCall } = useCall();
  const isUnknown = !prospect.isKnown;
  const missed = missedCount(prospect);
  const displayName = prospect.name ?? formatPhone(prospect.phone);

  const triggerCall = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startCall({
      prospectId: prospect.id,
      prospectPhone: prospect.phone,
      prospectName: prospect.name ?? null,
      prospectVehicle: prospect.vehicleInterest ?? null,
      prospectPrice: prospect.vehiclePrice ?? null,
      prospectNotes: prospect.notes ?? null,
    });
  };

  return (
    <Link
      href={`/app/rappels/${prospect.id}`}
      className={`block bg-white rounded-lg p-2.5 shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-px transition ${
        prospect.isUrgent ? "border-l-4 border-l-red-500" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          {prospect.isUrgent && (
            <span className="text-[9px] font-bold uppercase px-1 py-0.5 rounded bg-red-100 text-red-700 flex-shrink-0">
              Urgent
            </span>
          )}
          {isUnknown && (
            <span className="text-[9px] font-bold uppercase px-1 py-0.5 rounded bg-violet-100 text-violet-700 flex-shrink-0">
              NQ
            </span>
          )}
        </div>
        {missed > 0 && (
          <span
            className={`text-[10px] font-bold flex-shrink-0 ${
              missed > 1 ? "text-red-600" : "text-gray-500"
            }`}
            title={`${missed} appel${missed > 1 ? "s" : ""} manqué${missed > 1 ? "s" : ""}`}
          >
            {missed}×
          </span>
        )}
      </div>

      <p
        className={`font-semibold text-[13px] truncate ${
          isUnknown ? "font-mono tabular-nums text-gray-700" : "text-gray-900"
        }`}
      >
        {displayName}
      </p>
      {!isUnknown && (
        <p className="text-[11px] text-gray-500 font-mono tabular-nums truncate">
          {formatPhone(prospect.phone)}
        </p>
      )}
      {prospect.vehicleInterest && (
        <p className="text-[11px] text-gray-700 mt-1 truncate">{prospect.vehicleInterest}</p>
      )}
      {prospect.vehiclePrice && (
        <p className="text-[11px] font-semibold text-gray-900 tabular-nums">
          {prospect.vehiclePrice.toLocaleString("fr-FR")} €
        </p>
      )}
      {prospect.appointmentAt && (
        <p className="text-[10px] text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded mt-1.5 inline-block">
          📅 {formatAppointment(prospect.appointmentAt)}
        </p>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        <span className="text-[10px] text-gray-400">{formatShort(prospect.lastActivityAt)}</span>
        <button
          type="button"
          onClick={triggerCall}
          className="text-[10px] font-bold bg-orange hover:bg-orange-dark text-white px-2 py-0.5 rounded flex items-center gap-1 transition"
        >
          <PhoneIcon /> Rappeler
        </button>
      </div>
    </Link>
  );
}

export default function DesktopRappelsKanbanPage() {
  const [period, setPeriod] = useState<Period>("all");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const params = new URLSearchParams();
        params.set("filter", "all");
        if (period !== "all") params.set("period", period);
        const res = await fetch(`/api/prospects?${params.toString()}`);
        if (!res.ok) {
          if (!cancelled) {
            setError("Erreur de chargement");
            setLoading(false);
          }
          return;
        }
        const json: ApiResponse = await res.json();
        if (cancelled) return;
        setData(json);
        setError(null);
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
  }, [period]);

  const grouped = useMemo(() => {
    const out: Record<ColumnKey, Prospect[]> = {
      todo: [],
      appointment: [],
      test_drive: [],
      quote_sent: [],
      sold: [],
    };
    if (!data) return out;
    for (const p of data.prospects) {
      // "À faire" : urgent OU pending/postponed/unreachable
      if (p.isUrgent || ["pending", "postponed", "unreachable"].includes(p.status)) {
        out.todo.push(p);
        continue;
      }
      if (p.status === "appointment") out.appointment.push(p);
      else if (p.status === "test_drive") out.test_drive.push(p);
      else if (p.status === "quote_sent") out.quote_sent.push(p);
      else if (p.status === "sold") out.sold.push(p);
      // not_interested : non affiché dans le pipeline V1
    }
    // Tri : urgents en premier dans "todo", puis par date desc
    out.todo.sort((a, b) => {
      if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1;
      return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
    });
    return out;
  }, [data]);

  // Total devis envoyés (somme des prix)
  const devisTotal = useMemo(
    () => grouped.quote_sent.reduce((sum, p) => sum + (p.vehiclePrice ?? 0), 0),
    [grouped.quote_sent]
  );

  return (
    <div className="flex flex-col h-screen">
      {/* Topbar */}
      <div className="h-14 px-6 flex items-center gap-4 bg-white border-b border-gray-200 flex-shrink-0">
        <div>
          <h1 className="font-nunito font-extrabold text-lg leading-none">Pipeline des rappels</h1>
          <p className="text-[11px] text-gray-500 mt-1 leading-none">
            {data
              ? `${data.counts.urgent} urgents · ${data.counts.todo} à faire · ${data.counts.in_progress} en cours · ${data.counts.done} traités`
              : "Chargement…"}
          </p>
        </div>
        <div className="flex-1 max-w-md relative ml-6">
          <svg
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            className="w-full bg-gray-100 border-0 rounded-md pl-9 pr-3 py-2 text-sm placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-bleu/30 outline-none"
            placeholder="Rechercher un prospect…"
          />
        </div>
      </div>

      {/* Filtres */}
      <div className="h-11 px-6 flex items-center gap-2 bg-white border-b border-gray-200 flex-shrink-0">
        {(["day", "week", "month", "all"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition ${
              period === p ? "bg-bleu text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {p === "day" ? "Aujourd'hui" : p === "week" ? "7 jours" : p === "month" ? "30 jours" : "Tout"}
          </button>
        ))}
        <div className="flex-1" />
        {data && (
          <div className="flex items-center gap-3 text-[11px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              Pipeline en cours
            </span>
            <span className="font-bold text-base text-emerald-700 tabular-nums">
              {(devisTotal + grouped.appointment.reduce((s, p) => s + (p.vehiclePrice ?? 0), 0)).toLocaleString("fr-FR")} €
            </span>
          </div>
        )}
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 py-5 bg-gray-100">
        <div className="flex gap-4 h-full min-w-max">
          {COLUMNS.map((col) => {
            const items = grouped[col.key];
            return (
              <div
                key={col.key}
                className={`${col.bg} w-72 flex-shrink-0 rounded-xl p-3 flex flex-col min-h-0`}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <h3 className="font-bold text-sm text-gray-900">{col.label}</h3>
                    <span className="text-[11px] font-bold text-gray-500 bg-white px-1.5 py-0.5 rounded tabular-nums">
                      {items.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                  {loading ? (
                    <p className="text-center text-gray-400 text-xs py-4">Chargement…</p>
                  ) : error ? (
                    <p className="text-center text-red-600 text-xs py-4">{error}</p>
                  ) : items.length === 0 ? (
                    <p className="text-center text-gray-400 text-xs py-6 italic">Vide</p>
                  ) : (
                    items.map((p) => <ProspectCardKanban key={p.id} prospect={p} />)
                  )}
                </div>

                {/* Footer colonne : total devis */}
                {col.key === "quote_sent" && items.length > 0 && (
                  <div className="mt-2 px-2 py-1.5 bg-white/80 rounded text-[10px] text-blue-700 font-semibold flex items-center justify-between">
                    <span>Total devis</span>
                    <span className="tabular-nums">{devisTotal.toLocaleString("fr-FR")} €</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer raccourcis */}
      <div className="h-8 border-t border-gray-200 px-6 flex items-center gap-4 text-[11px] text-gray-500 bg-white flex-shrink-0">
        <span>{data?.counts.all ?? "—"} prospects · 5 colonnes</span>
        <span className="text-gray-300">·</span>
        <span>Cliquez une carte pour ouvrir la fiche</span>
        <div className="flex-1" />
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          Sonnerie active
        </span>
      </div>
    </div>
  );
}
