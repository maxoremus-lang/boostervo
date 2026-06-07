import type { Metadata } from "next";
import DiagnosticCta from "../../components/DiagnosticCta";
import VslPlayer from "../../components/VslPlayer";
import SiteNav from "../../components/SiteNav";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "BoosterVO — Le profit caché derrière vos appels",
  description:
    "Découvrez en vidéo comment BoosterVO récupère la marge perdue sur vos ventes VO grâce au call tracking et à l'exploitation des appels manqués.",
};

export default function VslPage() {
  return (
    <div className="min-h-screen bg-bleu text-white flex flex-col">
      {/* En-tête / navigation boostervo.fr */}
      <SiteNav />

      {/* Contenu principal */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
        <div className="w-full max-w-3xl text-center">
          <h1 className="font-nunito text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-8 max-w-2xl mx-auto">
            <span className="text-orange">Combien de ventes</span> vos annonces VO vous font-elles{" "}
            <span className="text-orange">perdre</span> ?
          </h1>

          {/* Lecteur vidéo */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black/40 border border-white/10">
            <VslPlayer
              page="vsl"
              src="/videos/vsl-page.mp4"
              controls
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* CTA — ouvre la modale de demande de diagnostic */}
          <DiagnosticCta source="vsl" className="mt-10" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
