export default function CTAFinal() {
  return (
    <section id="cta" className="bg-bleu py-14 sm:py-20 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto text-center text-white">
        <h2 className="font-nunito font-extrabold text-2xl sm:text-4xl mb-4">
          Pr&ecirc;t &agrave; d&eacute;couvrir combien vous perdez ?
        </h2>
        <p className="text-white/80 text-base sm:text-lg mb-8 leading-relaxed">
          L&apos;audit est gratuit, sans engagement, et vous recevez vos
          r&eacute;sultats en 15 jours. Vous n&apos;avez rien &agrave; perdre
          &mdash; sauf peut-&ecirc;tre de continuer &agrave; perdre de
          l&apos;argent sans le savoir.
        </p>
        <a
          href="mailto:contact@boostervo.fr?subject=Demande%20d'audit%20gratuit"
          className="inline-block w-full sm:w-auto bg-orange hover:bg-orange-dark text-white font-bold text-lg px-10 py-4 rounded-lg transition-colors shadow-xl min-h-[48px]"
        >
          Demander mon audit gratuit &rarr;
        </a>
      </div>
    </section>
  );
}
