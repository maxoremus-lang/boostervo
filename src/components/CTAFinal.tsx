export default function CTAFinal() {
  return (
    <section id="cta" className="relative bg-gradient-to-br from-bleu to-bleu-dark py-16 sm:py-24 px-4 sm:px-6 overflow-hidden">
      {/* Décorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange/10 rounded-full blur-3xl" />

      <div className="relative max-w-2xl mx-auto text-center text-white">
        <h2 className="font-nunito font-extrabold text-2xl sm:text-4xl mb-6">
          Pr&ecirc;t &agrave; d&eacute;couvrir combien vous perdez ?
        </h2>
        <p className="text-white/80 text-base sm:text-lg mb-10 leading-relaxed">
          L&apos;audit est gratuit, sans engagement, et vous recevez vos
          r&eacute;sultats en 15 jours. Vous n&apos;avez rien &agrave; perdre
          &mdash; sauf peut-&ecirc;tre de continuer &agrave; perdre de
          l&apos;argent sans le savoir.
        </p>
        <a
          href="mailto:contact@boostervo.fr?subject=Demande%20d'audit%20gratuit"
          className="inline-block w-full sm:w-auto bg-orange hover:bg-orange-dark text-white font-bold text-lg px-12 py-5 rounded-full transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 min-h-[48px]"
        >
          Demander mon audit gratuit &rarr;
        </a>
      </div>
    </section>
  );
}
