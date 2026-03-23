export default function ChiffreChoc() {
  return (
    <section className="bg-white py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
          {/* Cercle SVG de progression */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              {/* Cercle de fond */}
              <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              {/* Arc de progression orange */}
              <circle cx="60" cy="60" r="52" fill="none" stroke="#FF6600" strokeWidth="8" strokeDasharray="117 326.73" strokeLinecap="round" />
              {/* Arc bleu */}
              <circle cx="60" cy="60" r="42" fill="none" stroke="#1B4F9B" strokeWidth="6" strokeDasharray="92 263.89" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-nunito font-extrabold text-3xl sm:text-4xl text-gray-900">30-40%</span>
            </div>
          </div>

          {/* Texte à droite */}
          <div className="text-center sm:text-left">
            <p className="text-sm uppercase tracking-widest text-gray-400 font-semibold mb-2">
              Le chiffre que personne ne vous montre
            </p>
            <p className="font-nunito font-extrabold text-4xl sm:text-5xl text-orange mb-3">
              30&ndash;40%
            </p>
            <p className="text-gray-600 text-lg sm:text-xl mb-6 max-w-md">
              des appels g&eacute;n&eacute;r&eacute;s par vos annonces ne sont jamais
              trait&eacute;s.
            </p>
            <div className="bg-gradient-to-r from-bleu/5 to-orange/5 border border-bleu/10 rounded-xl p-5 inline-block">
              <p className="text-orange font-nunito font-extrabold text-2xl sm:text-3xl mb-1">
                1&nbsp;500&nbsp;&euro; &agrave; 3&nbsp;000&nbsp;&euro;
              </p>
              <p className="text-gray-500 text-sm sm:text-base">
                de marge perdue chaque mois, en moyenne.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
