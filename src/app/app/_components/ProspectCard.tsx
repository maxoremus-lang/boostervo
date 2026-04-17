"use client";

import Link from "next/link";
import type { Prospect } from "../_lib/types";
import { formatRelativeWithDate, missedCallsCount } from "../_lib/mockData";
import { StatusBadge, UrgentBadge, NewBadge, KnownBadge } from "./Badge";

function PhoneIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
  );
}

export default function ProspectCard({
  prospect,
  variant = "default",
}: {
  prospect: Prospect;
  variant?: "default" | "urgent";
}) {
  const missed = missedCallsCount(prospect);
  const isUrgentCard = variant === "urgent" || prospect.isUrgent;

  return (
    <Link
      href={`/app/rappels/${prospect.id}`}
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
              {(prospect.vehicleInterest || prospect.vehiclePrice) && (
                <p className="text-xs text-gray-500 truncate">
                  {prospect.vehicleInterest}
                  {prospect.vehiclePrice && ` · ${prospect.vehiclePrice.toLocaleString("fr-FR")} €`}
                </p>
              )}
              {missed > 1 ? (
                <p className="text-xs text-red-600 font-semibold">
                  {missed} appels manqués · {formatRelativeWithDate(prospect.lastActivityAt)}
                </p>
              ) : (
                <p className="text-xs text-gray-500">{formatRelativeWithDate(prospect.lastActivityAt)}</p>
              )}
            </>
          ) : (
            <>
              <p className="font-nunito font-bold text-gray-900">{prospect.phone}</p>
              {missed > 1 && (
                <p className="text-xs text-red-600 font-semibold">
                  {missed} appels manqués · {formatRelativeWithDate(prospect.lastActivityAt)}
                </p>
              )}
              {missed <= 1 && (
                <p className="text-xs text-gray-500">{formatRelativeWithDate(prospect.lastActivityAt)}</p>
              )}
            </>
          )}
        </div>
        {!isUrgentCard && <StatusBadge status={prospect.status} />}
      </div>

      {isUrgentCard && (
        <>
          <p className="text-xs text-gray-500 mb-3">
            {prospect.isKnown
              ? `${missed > 1 ? `${missed}e tentative · ` : "Rappelle · "}${formatRelativeWithDate(prospect.lastActivityAt)}`
              : `${missed} appels manqués · ${formatRelativeWithDate(prospect.lastActivityAt)}`}
          </p>
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <a
              href={`tel:${prospect.phone.replace(/\s/g, "")}`}
              className="flex-1 bg-orange hover:bg-orange-dark text-white text-sm font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition"
            >
              <PhoneIcon /> Rappeler
            </a>
            <button className="px-3 bg-gray-100 text-gray-700 text-sm font-bold py-2 rounded-lg">⋯</button>
          </div>
        </>
      )}
    </Link>
  );
}
