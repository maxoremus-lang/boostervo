export default function Hero() {
  return (
    <section className="bg-bleu pt-24 pb-16 sm:pt-32 sm:pb-20 px-6 sm:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Bloc aligné : texte + vidéo même hauteur */}
        <div className="flex flex-col lg:flex-row lg:items-stretch lg:gap-12 mb-10">
          {/* Colonne gauche — Texte (même hauteur que la vidéo) */}
          <div className="flex flex-col justify-between lg:w-1/2 text-center lg:text-left text-white">
            <div>
              <p className="animate-fade-up text-sm uppercase tracking-widest text-orange font-semibold mb-4">
                BoosterVO &mdash; Performance VO
              </p>
              <h1 className="animate-fade-up delay-100 font-nunito font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6">
                Combien d&apos;argent perdez-vous chaque mois&hellip; sans le savoir ?
              </h1>
              <p className="animate-fade-up delay-200 text-white/80 text-base sm:text-lg leading-relaxed mb-8">
                Vos annonces Leboncoin g&eacute;n&egrave;rent d&eacute;j&agrave; des appels. Mais une
                partie de ces opportunit&eacute;s dispara&icirc;t avant m&ecirc;me
                d&apos;&ecirc;tre trait&eacute;e.
              </p>
            </div>
            <div className="animate-fade-up delay-300 border-l-4 border-orange bg-white/10 rounded-r-lg p-5 text-left">
              <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                <strong className="text-orange">BoosterVO</strong> vous permet
                d&apos;identifier pr&eacute;cis&eacute;ment ces pertes et de
                r&eacute;cup&eacute;rer entre{" "}
                <strong>1&nbsp;500&nbsp;&euro; et 3&nbsp;000&nbsp;&euro; de marge par mois</strong>{" "}
                &mdash; sans augmenter votre budget.
              </p>
            </div>
          </div>

          {/* Colonne droite — Vidéo (même hauteur que le texte) */}
          <div className="animate-fade-up delay-500 lg:w-1/2 mt-12 lg:mt-0 flex items-stretch">
            <div className="relative w-full rounded-xl overflow-hidden shadow-2xl bg-black/30 border border-white/10">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60 z-10 pointer-events-none">
                <svg className="w-16 h-16 mb-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <p className="text-sm font-semibold text-center leading-relaxed">
                  Ce que 90&nbsp;% des n&eacute;gociants<br />
                  ne voient jamais sur leurs appels
                </p>
              </div>
              <video
                src="https://boostervo.com/simulateur/Vsl_BoosterVo.mp4"
                controls
                playsInline
                preload="none"
                className="absolute inset-0 w-full h-full object-cover"
              >
                Votre navigateur ne supporte pas la lecture vid&eacute;o.
              </video>
            </div>
          </div>
        </div>

        {/* CTA en dessous du bloc aligné */}
        <div className="text-center lg:text-left">
          <a
            href="#audit"
            className="animate-fade-up delay-400 inline-block w-full sm:w-auto bg-orange hover:bg-orange-dark text-white font-bold text-base sm:text-lg px-8 py-4 rounded-lg transition-colors shadow-lg min-h-[48px]"
          >
            Je veux mon audit gratuit &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
