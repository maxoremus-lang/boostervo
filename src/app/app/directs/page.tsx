"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "../_components/BottomNav";

type Period = "day" | "week" | "month" | "all";
const PERIOD_LABELS: Record<Period, string> = {
  day: "aujourd'hui",
  week: "7 derniers jours",
  month: "30 derniers jours",
  all: "tout l'historique",
};
const PERIOD_SHORT: Record<Period, string> = {
  day: "Aujourd'hui",
  week: "7 j",
  month: "30 j",
  all: "Tout",
};

type CallEventItem = {
  id: string;
  at: string;
  type: "missed" | "answered";
  direction: "inbound" | "outbound";
  durationSec: number | null;
  ringSec: number | null;
  prospect: {
    id: string;
    phone: string;
    name: string | null;
    vehicleInterest: string | null;
    vehiclePrice: number | null;
    status: string;
    isKnown: boolean;
  };
};

type ApiResponse = {
  events: CallEventItem[];
  count: number;
};

function parisDayKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);
}

function formatCallTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const time = d
    .toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit", hour12: false })
    .replace(":", "h");

  const dKey = parisDayKey(d);
  const todayKey = parisDayKey(now);
  if (dKey === todayKey) return `Aujourd'hui · ${time}`;

  const yesterdayKey = parisDayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  if (dKey === yesterdayKey) return `Hier · ${time}`;

  const dayMonth = d
    .toLocaleDateString("fr-FR", { timeZone: "Europe/Paris", day: "numeric", month: "short" })
    .replace(".", "");
  return `${dayMonth} · ${time}`;
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

function formatDuration(sec: number | null): string | null {
  if (sec === null || sec === undefined || sec <= 0) return null;
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m} min` : `${m} min ${s}s`;
}

/** Groupe les events par jour calendaire Paris : "Aujourd'hui", "Hier", "12 avril 2025" */
function groupByDay(events: CallEventItem[]): { label: string; items: CallEventItem[] }[] {
  const now = new Date();
  const todayKey = parisDayKey(now);
  const yesterdayKey = parisDayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));

  const groups = new Map<string, CallEventItem[]>();
  for (const e of events) {
    const key = parisDayKey(new Date(e.at));
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }

  return Array.from(groups.entries()).map(([key, items]) => {
    let label: string;
    if (key === todayKey) label = "Aujourd'hui";
    else if (key === yesterdayKey) label = "Hier";
    else {
      label = new Date(items[0].at)
        .toLocaleDateString("fr-FR", {
          timeZone: "Europe/Paris",
          weekday: "long", day: "numeric", month: "long",
        });
      label = label.charAt(0).toUpperCase() + label.slice(1);
    }
    return { label, items };
  });
}

function CallEventCard({ event }: { event: CallEventItem }) {
  const p = event.prospect;
  const phoneFormatted = formatPhone(p.phone);
  const duration = formatDuration(event.durationSec);
  const time = new Date(event.at)
    .toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit", hour12: false })
    .replace(":", "h");

  return (
    <Link
      href={`/app/rappels/${p.id}?from=directs`}
      className="block bg-white rounded-2xl shadow-sm p-3.5 transition active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        {/* Pastille verte pleine = "appel entrant décroché" (cohérent avec la fiche prospect) */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 010 1.414L9 9a16 16 0 006 6l1.879-1.707a1 1 0 011.414 0l2.414 2.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-nunito font-bold text-gray-900 truncate">
              {p.isKnown && p.name ? p.name : phoneFormatted}
            </p>
            <span className="text-xs font-semibold text-gray-500 tabular-nums flex-shrink-0">{time}</span>
          </div>

          {p.isKnown && p.name && (
            <p className="text-xs text-gray-500 truncate">
              {phoneFormatted}
              {p.vehicleInterest && ` · ${p.vehicleInterest}`}
              {p.vehiclePrice ? ` · ${p.vehiclePrice.toLocaleString("fr-FR")} €` : ""}
            </p>
          )}

          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
            Direct{duration ? ` · ${duration}` : ""}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function DirectsPage() {
  const [period, setPeriod] = useState<Period>("all");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const params = new URLSearchParams({
          direction: "inbound",
          type: "answered",
        });
        if (period !== "all") params.set("period", period);
        const res = await fetch(`/api/call-events?${params.toString()}`);
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
    return () => { cancelled = true; };
  }, [period]);

  const events = data?.events ?? [];
  const groups = groupByDay(events);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-bleu px-5 pt-6 pb-5 text-white">
        <h1 className="text-xl font-nunito font-extrabold">Appels directs</h1>
        <p className="text-xs opacity-80">
          {data?.count ?? 0} direct{(data?.count ?? 0) > 1 ? "s" : ""}
          {" · "}{PERIOD_LABELS[period]}
        </p>
      </div>

      {/* Sélecteur de période */}
      <div className="flex items-center px-5 py-2 bg-white border-b border-gray-100 gap-2 overflow-x-auto">
        <span className="text-[10px] uppercase font-bold text-gray-500 whitespace-nowrap mr-1">Période</span>
        {(["day", "week", "month", "all"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition ${
              period === p ? "bg-bleu text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {PERIOD_SHORT[p]}
          </button>
        ))}
      </div>

      {/* Liste groupée par jour */}
      <div className="px-5 py-4 space-y-5">
        {loading ? (
          <p className="text-center text-gray-400 text-sm py-8">Chargement…</p>
        ) : error ? (
          <p className="text-center text-red-600 text-sm py-8">{error}</p>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 010 1.414L9 9a16 16 0 006 6l1.879-1.707a1 1 0 011.414 0l2.414 2.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700">Aucun appel direct</p>
            <p className="text-xs text-gray-400 mt-1">Sur la période sélectionnée</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label}>
              <h2 className="text-[11px] uppercase font-bold text-gray-500 mb-2 px-1">
                {group.label} · {group.items.length}
              </h2>
              <div className="space-y-2.5">
                {group.items.map((e) => (
                  <CallEventCard key={e.id} event={e} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
