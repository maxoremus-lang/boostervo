"use client";

import { usePathname } from "next/navigation";

/**
 * Wrapper conditionnel : l'app rappels est mobile-first (max-w-md centré),
 * sauf sous /app/desktop/* où on laisse le contenu occuper toute la largeur
 * pour le dashboard desktop (sidebar + panneaux multiples).
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isDesktop = pathname.startsWith("/app/desktop");

  if (isDesktop) {
    return <div className="min-h-screen bg-fond">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-fond">
      <div className="max-w-md mx-auto bg-fond min-h-screen relative">{children}</div>
    </div>
  );
}
