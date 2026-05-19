"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badgeKey?: "urgent" | null;
};

const NAV: NavItem[] = [
  {
    href: "/app/desktop/rappels",
    label: "Rappels",
    badgeKey: "urgent",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: "/app/desktop/directs",
    label: "Directs",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4-4m0 0h-4m4 0v4M3 5a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 010 1.414L9 9a16 16 0 006 6l1.879-1.707a1 1 0 011.414 0l2.414 2.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
  {
    href: "/app/desktop/stats",
    label: "Statistiques",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: "/app/desktop/profil",
    label: "Profil",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

type QuickView = { label: string; color: string; href: string; count?: number };

const QUICK_VIEWS: QuickView[] = [
  { label: "Urgents", color: "bg-red-500", href: "/app/desktop/rappels?filter=urgent" },
  { label: "RDV cette semaine", color: "bg-violet-500", href: "/app/desktop/rappels?status=appointment&period=week" },
  { label: "Devis envoyés", color: "bg-blue-500", href: "/app/desktop/rappels?status=quote_sent" },
  { label: "Injoignables", color: "bg-amber-400", href: "/app/desktop/rappels?status=unreachable" },
];

export default function Sidebar() {
  const pathname = usePathname() ?? "";
  const { data: session } = useSession();
  const user = session?.user as
    | { name?: string | null; email?: string | null; dealership?: string | null }
    | undefined;

  // Compteurs (urgent + counts par statut) — fetch léger pour décorer la nav
  const [counts, setCounts] = useState<{
    urgent: number;
    appointment: number;
    quote_sent: number;
    unreachable: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/prospects?filter=all");
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        setCounts({
          urgent: json.counts?.urgent ?? 0,
          appointment: json.byStatus?.appointment ?? 0,
          quote_sent: json.byStatus?.quote_sent ?? 0,
          unreachable: json.byStatus?.unreachable ?? 0,
        });
      } catch {
        /* silencieux */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const userName = user?.name ?? user?.email ?? "Utilisateur";
  const initials = userName
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="w-52 bg-[#0f172a] text-gray-300 flex flex-col fixed inset-y-0 left-0 z-30">
      {/* Workspace switcher */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-orange flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            B
          </div>
          <div className="min-w-0">
            <p className="text-white font-nunito font-extrabold leading-none truncate">BoosterVO</p>
            <p className="text-[10px] text-gray-500 leading-none mt-1 truncate">
              {user?.dealership ?? "Concession"}
            </p>
          </div>
        </div>
      </div>

      {/* Nav principale */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 text-sm overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          const badgeCount = item.badgeKey === "urgent" ? counts?.urgent ?? 0 : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition ${
                active
                  ? "bg-white/10 text-white font-semibold"
                  : "text-gray-400 hover:bg-white/5"
              }`}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badgeKey === "urgent" && badgeCount > 0 && (
                <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}

        {/* Vues rapides */}
        <div className="px-3 pt-5 pb-1 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
          Vues rapides
        </div>
        {QUICK_VIEWS.map((qv) => {
          let cnt: number | undefined;
          if (counts) {
            if (qv.label === "Urgents") cnt = counts.urgent;
            else if (qv.label === "RDV cette semaine") cnt = counts.appointment;
            else if (qv.label === "Devis envoyés") cnt = counts.quote_sent;
            else if (qv.label === "Injoignables") cnt = counts.unreachable;
          }
          return (
            <Link
              key={qv.label}
              href={qv.href}
              className="flex items-center justify-between px-3 py-1.5 rounded-md text-gray-400 hover:bg-white/5 text-[13px]"
            >
              <span className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 ${qv.color} rounded-full`} />
                {qv.label}
              </span>
              {cnt !== undefined && (
                <span className="text-[10px] text-gray-500 tabular-nums">{cnt}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bas : vue mobile + user */}
      <div className="px-2 py-2 border-t border-white/5 space-y-1">
        <Link
          href="/app/dashboard"
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-gray-400 hover:bg-white/5 text-[12px]"
          title="Basculer vers la vue mobile (PWA)"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Vue mobile
        </Link>
      </div>

      {/* User card */}
      <div className="px-3 py-3 border-t border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange to-orange-dark flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{userName}</p>
            <p className="text-[10px] text-gray-500 truncate">Négociant</p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/app/login" })}
            className="text-gray-500 hover:text-white transition"
            title="Déconnexion"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
