import Sidebar from "./_components/Sidebar";

/**
 * Layout desktop-first pour l'app rappels — sidebar fixe à gauche (240px)
 * et contenu fluide à droite. Hérite des Providers du layout parent (/app/layout.tsx).
 */
export default function DesktopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-fond">
      <Sidebar />
      <main className="ml-52 min-h-screen">{children}</main>
    </div>
  );
}
