import type { Metadata } from "next";
import Image from "next/image";
import DiagnosticCta from "../../components/DiagnosticCta";

export const metadata: Metadata = {
  title: "BoosterVO — Le profit caché derrière vos appels",
  description:
    "Découvrez en vidéo comment BoosterVO récupère la marge perdue sur vos ventes VO grâce au call tracking et à l'exploitation des appels manqués.",
};

export default function VslPage() {
  return (
    <div className="min-h-screen bg-bleu text-white flex flex-col">
      {/* En-tête / logo */}
      <header className="w-full px-6 py-6 flex justify-center">
        <Image
          src="/logo-white.svg"
          alt="BoosterVO"
          width={180}
          height={36}
          priority
        />
      </header>

      {/* Contenu principal */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
        <div className="w-full max-w-3xl text-center">
          <p className="font-nunito text-sm font-bold uppercase tracking-widest text-orange mb-3">
            À regarder avant votre audit
          </p>
          <h1 className="font-nunito text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
            Le profit caché derrière
            <br />
            <span className="text-orange">vos appels manqués</span>
          </h1>
          <p className="text-white/80 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
            En 3 minutes, découvrez ce que 90&nbsp;% des négociants VO ne voient
            pas — et comment récupérer entre 1&nbsp;500&nbsp;€ et 3&nbsp;000&nbsp;€
            de marge par mois.
          </p>

          {/* Lecteur vidéo */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black/40 border border-white/10">
            <video
              src="/videos/vsl-page.mp4"
              controls
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
            >
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
          </div>

          {/* CTA — ouvre la modale de demande de diagnostic */}
          <DiagnosticCta source="vsl" className="mt-10" />
        </div>
      </main>
    </div>
  );
}
