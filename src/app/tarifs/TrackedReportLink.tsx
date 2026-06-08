"use client";

// Wrapper client autour du lien "Cliquez ici pour télécharger un exemplaire
// de rapport" du Pack Diagnostic. À chaque clic, on envoie un beacon à
// /api/report-example-click avec source="tarifs" pour distinguer dans les
// stats les clics provenant de cette page (vs ceux de la home).
//
// La navigation vers le PDF se fait normalement (target=_blank) : le beacon
// part en best-effort, il ne bloque pas l'ouverture du fichier.

type Props = {
  href: string;
  className?: string;
  children: React.ReactNode;
};

export default function TrackedReportLink({ href, className, children }: Props) {
  function handleClick() {
    try {
      const payload = JSON.stringify({ source: "tarifs" });
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        if (navigator.sendBeacon("/api/report-example-click", blob)) return;
      }
      // Fallback fetch keepalive (Safari ancien / Firefox sans sendBeacon JSON)
      fetch("/api/report-example-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* best-effort : un clic non tracké ne doit jamais casser l'UX */
    }
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
