export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-[#e8f0fe] via-[#f0f5ff] to-white pt-28 pb-32 sm:pt-36 sm:pb-40 px-6 sm:px-10 lg:px-16 overflow-hidden">
      {/* Décorations de fond */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-bleu/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

      <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:gap-16">
        {/* Colonne gauche — Texte */}
        <div className="flex flex-col justify-center lg:w-1/2 text-center lg:text-left">
          <p className="animate-fade-up text-sm uppercase tracking-widest text-orange font-semibold mb-4">
            BoosterVO &mdash; Performance VO
          </p>
          <h1 className="animate-fade-up delay-100 font-nunito font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6 text-gray-900">
            Combien d&apos;argent perdez-vous chaque mois&hellip; sans le savoir ?
          </h1>
          <p className="animate-fade-up delay-200 text-gray-600 text-base sm:text-lg leading-relaxed mb-8">
            Vos annonces Leboncoin g&eacute;n&egrave;rent d&eacute;j&agrave; des appels. Mais une
            partie de ces opportunit&eacute;s dispara&icirc;t avant m&ecirc;me
            d&apos;&ecirc;tre trait&eacute;e.
          </p>
          <div className="animate-fade-up delay-300 border-l-4 border-orange bg-orange/5 rounded-r-lg p-5 text-left mb-8">
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              <strong className="text-orange">BoosterVO</strong> vous permet
              d&apos;identifier pr&eacute;cis&eacute;ment ces pertes et de
              r&eacute;cup&eacute;rer entre{" "}
              <strong className="text-gray-900">1&nbsp;500&nbsp;&euro; et 3&nbsp;000&nbsp;&euro; de marge par mois</strong>{" "}
              &mdash; sans augmenter votre budget.
            </p>
          </div>
          <div>
            <a
              href="#audit"
              className="animate-fade-up delay-400 inline-block w-full sm:w-auto bg-orange hover:bg-orange-dark text-white font-bold text-base sm:text-lg px-10 py-4 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 min-h-[48px]"
            >
              Je veux mon audit gratuit &rarr;
            </a>
          </div>
        </div>

        {/* Colonne droite — Mockup Dashboard */}
        <div className="animate-fade-up delay-500 lg:w-1/2 mt-12 lg:mt-0 flex items-center justify-center">
          <div className="relative w-full max-w-lg">
            {/* Carte dashboard */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Barre de titre */}
              <div className="bg-bleu px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-white/80 text-xs font-semibold">BoosterVO — Audit report</span>
                <div className="w-16" />
              </div>
              {/* Contenu dashboard */}
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {/* Carte stat 1 */}
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-3 border border-blue-100">
                    <p className="text-[10px] text-gray-500 mb-1">Appels reçus</p>
                    <p className="font-nunito font-extrabold text-xl text-bleu">127</p>
                    <div className="mt-2 h-1 bg-bleu/20 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-bleu rounded-full" />
                    </div>
                  </div>
                  {/* Carte stat 2 */}
                  <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-3 border border-orange-100">
                    <p className="text-[10px] text-gray-500 mb-1">Appels manqu&eacute;s</p>
                    <p className="font-nunito font-extrabold text-xl text-orange">38</p>
                    <div className="mt-2 h-1 bg-orange/20 rounded-full overflow-hidden">
                      <div className="h-full w-[30%] bg-orange rounded-full" />
                    </div>
                  </div>
                  {/* Carte stat 3 - Score */}
                  <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-3 border border-green-100 flex flex-col items-center justify-center">
                    <p className="text-[10px] text-gray-500 mb-1">Score</p>
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="72, 100" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-green-600">72%</span>
                    </div>
                  </div>
                </div>
                {/* Mini graphique */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-gray-700">Revenue identifi&eacute;e</span>
                    <span className="text-xs text-orange font-bold">+2 340 &euro;</span>
                  </div>
                  <svg className="w-full h-16" viewBox="0 0 300 60" fill="none">
                    <polyline points="0,50 30,45 60,42 90,38 120,35 150,28 180,22 210,25 240,18 270,12 300,8" stroke="#1B4F9B" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1B4F9B" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#1B4F9B" stopOpacity="0" />
                    </linearGradient>
                    <polygon points="0,50 30,45 60,42 90,38 120,35 150,28 180,22 210,25 240,18 270,12 300,8 300,60 0,60" fill="url(#grad)" />
                  </svg>
                </div>
              </div>
            </div>
            {/* Badge flottant */}
            <div className="absolute -bottom-4 -right-4 bg-orange text-white rounded-xl px-4 py-2 shadow-lg text-sm font-bold">
              +2 340 &euro;/mois
            </div>
          </div>
        </div>
      </div>

      {/* Wave SVG en bas */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg className="relative block w-full h-16 sm:h-24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,40 C360,100 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
        </svg>
      </div>
    </section>
  );
}
