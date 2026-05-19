"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

type Item = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const items: Item[] = [
  {
    href: "/app/desktop/rappels",
    label: "Rappels",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: "/app/desktop/directs",
    label: "Directs",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4-4m0 0h-4m4 0v4M3 5a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 010 1.414L9 9a16 16 0 006 6l1.879-1.707a1 1 0 011.414 0l2.414 2.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
  {
    href: "/app/desktop/stats",
    label: "Statistiques",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: "/app/desktop/profil",
    label: "Profil",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname() ?? "";
  const { data: session } = useSession();
  const user = session?.user as { name?: string | null; email?: string | null; dealership?: string | null } | undefined;

  return (
    <aside className="w-60 bg-bleu text-white flex flex-col fixed inset-y-0 left-0 z-30">
      {/* Logo / titre */}
      <div className="px-5 py-5 border-b border-white/10">
        <p className="font-nunito font-extrabold text-lg leading-none">BoosterVO</p>
        <p className="text-[11px] opacity-70 mt-0.5">Tableau de bord</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition ${
                active ? "bg-orange text-white" : "text-white/80 hover:bg-white/10"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bas : bascule vue mobile + user + logout */}
      <div className="px-3 py-3 border-t border-white/10 space-y-2">
        <Link
          href="/app/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold text-white/70 hover:bg-white/10 transition"
          title="Basculer vers la vue mobile (PWA)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Vue mobile
        </Link>
        {user && (
          <div className="px-3 py-2 rounded-lg bg-white/5">
            <p className="text-sm font-bold truncate">{user.name ?? user.email}</p>
            {user.dealership && (
              <p className="text-[11px] opacity-70 truncate">{user.dealership}</p>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/app/login" })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold text-white/70 hover:bg-white/10 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
