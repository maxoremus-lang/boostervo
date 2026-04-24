"use client";

import Link from "next/link";
import type { Prospect } from "../_lib/types";
import { formatRelativeWithDate, missedCallsCount } from "../_lib/mockData";
import { StatusBadge, UrgentBadge, NewBadge, KnownBadge } from "./Badge";
import { useCall } from "./Providers";

function PhoneIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
  );
}

/** Retourne "YYYY-MM-DD" en heure de Paris — sert à comparer 2 Dates sur le même jour calendaire Paris. */
function parisDayKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);
}

/** Formatte un événement d'appel EN HEURE DE PARIS : "Aujourd'hui · 14h30", "Hier · 09h12", "12 avr. · 16h45" */
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

/** Formatte un n° de tel type +33612345678 → 06 12 34 56 78 */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  // Cas +33
  if (digits.startsWith("33") && digits.length === 11) {
    const local = "0" + digits.slice(2);
    return local.match(/.{1,2}/g)?.join(" ") ?? raw;
  }
  // Cas 0XXXXXXXXX (10 chiffres)
  if (digits.length === 10 && digits.startsWith("0")) {
    return digits.match(/.{1,2}/g)?.join(" ") ?? raw;
  }
  return raw;
}

export default function ProspectCard({
  prospect,
  variant = "default",
  contextParams,
}: {
  prospect: Prospect;
  variant?: "default" | "urgent";
  contextParams?: string; // ex: "filter=todo" ou "status=appointment&period=week"
}) {
  const missed = missedCallsCount(prospect);
  const isUrgentCard = variant === "urgent" || prospect.isUrgent;
  const phoneFormatted = formatPhone(prospect.phone);
  const { startCall } = useCall();
  // Dernier appel manqué entrant (pour afficher heure + durée sonnerie sur toutes les cartes)
  const lastMissed = [...prospect.callEvents]
    .filter((e) => e.type === "missed" && e.direction !== "outbound")
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())[0];
  const detailHref = contextParams
    ? `/app/rappels/${prospect.id}?${contextParams}`
    : `/app/rappels/${prospect.id}`;

  return (
    <Link
      href={detailHref}
      className={`block bg-white rounded-2xl shadow-sm transition active:scale-[0.99] ${
        isUrgentCard ? "border-l-4 border-red-500 p-4" : "p-3.5"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {prospect.isKnown ? <KnownBadge /> : <NewBadge />}
            {isUrgentCard && <UrgentBadge />}
          </div>
          {prospect.isKnown ? (
            <>
              <p className="font-nunito font-bold text-gray-900 truncate">{prospect.name}</p>
              <p className="text-xs text-gray-500 truncate">
                {phoneFormatted}
                {prospect.vehicleInterest && ` · ${prospect.vehicleInterest}`}
                {prospect.vehiclePrice && ` · ${prospect.vehiclePrice.toLocaleString("fr-FR")} €`}
              </p>
              {missed > 1 ? (
                <p className="text-xs text-red-600 font-semibold">
                  {missed} appels manqués · {formatRelativeWithDate(prospect.lastActivityAt)}
                </p>
              ) : (
                <p className="text-xs text-gray-500">{formatRelativeWithDate(prospect.lastActivityAt)}</p>
              )}
              {lastMissed && (
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {formatCallTime(lastMissed.at)}
                  {lastMissed.ringSec ? ` · sonné ${lastMissed.ringSec}s` : ""}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="font-nunito font-bold text-gray-900">{phoneFormatted}</p>
              {missed > 1 && (
                <p className="text-xs text-red-600 font-semibold">
                  {missed} appels manqués · {formatRelativeWithDate(prospect.lastActivityAt)}
                </p>
              )}
              {missed <= 1 && (
                <p className="text-xs text-gray-500">{formatRelativeWithDate(prospect.lastActivityAt)}</p>
              )}
              {lastMissed && (
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {formatCallTime(lastMissed.at)}
                  {lastMissed.ringSec ? ` · sonné ${lastMissed.ringSec}s` : ""}
                </p>
              )}
            </>
          )}
        </div>
        {!isUrgentCard && <StatusBadge status={prospect.status} />}
      </div>

      {isUrgentCard && (
        <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={(e) => {
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
            }}
            className="flex-1 bg-orange hover:bg-orange-dark text-white text-sm font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition"
          >
            <PhoneIcon /> Rappeler
          </button>
          <button className="px-3 bg-gray-100 text-gray-700 text-sm font-bold py-2 rounded-lg">⋯</button>
        </div>
      )}
    </Link>
  );
}
