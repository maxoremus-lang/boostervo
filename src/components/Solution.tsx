export default function Solution() {
  const etapes = [
    {
      num: "1",
      icon: "settings_input_antenna",
      titre: "On installe un tracking invisible sur vos annonces",
      desc: "Un numéro de suivi dédié capte chaque appel entrant, sans changer vos habitudes.",
    },
    {
      num: "2",
      icon: "query_stats",
      titre: "On mesure tout pendant 15 jours",
      desc: "Volume d\u2019appels, appels manqués, heures creuses, annonces les plus performantes.",
    },
    {
      num: "3",
      icon: "assignment_turned_in",
      titre: "On vous livre un diagnostic chiffré",
      desc: "Vous savez exactement où vous perdez de l\u2019argent et comment le récupérer.",
    },
  ];

  return (
    <section className="relative bg-fond py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
      {/* Accent structurel arrière-plan */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gray-100 -z-10 transform skew-x-[-12deg] translate-x-20 hidden md:block" />

      <div className="max-w-7xl mx-auto">
        {/* En-tête aligné à gauche */}
        <div className="max-w-3xl mb-20">
          <h2 className="font-nunito text-[36px] font-extrabold text-bleu leading-[1.1] tracking-tight mb-8">
            Avec l&apos;Audit BVO, mesurez la marge invisible que vous perdez chaque mois
          </h2>
          <p className="font-opensans text-lg sm:text-xl text-gray-500 leading-relaxed">
            Pendant 15 jours, vous voyez ce qui se passe vraiment sur vos appels.
          </p>
        </div>

        {/* Grille des 3 étapes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Ligne connectrice (desktop) */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-[1px] bg-gray-200 z-0" />

          {etapes.map((e) => (
            <div key={e.num} className="relative z-10 group">
              {/* Cercle icône */}
              <div className="mb-10 flex">
                <div className="w-24 h-24 rounded-full bg-orange flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:-translate-y-2">
                  <span
                    className="material-symbols-outlined text-white"
                    style={{ fontSize: "40px" }}
                  >
                    {e.icon}
                  </span>
                </div>
              </div>
              <h3 className="font-nunito text-xl sm:text-2xl font-bold text-bleu mb-4">
                {e.num}. {e.titre}
              </h3>
              <p className="font-opensans text-gray-500 leading-relaxed text-base sm:text-lg">
                {e.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bandeau CTA */}
        <div className="mt-20 p-1 rounded-xl bg-gradient-to-br from-bleu to-[#1a3c6e]">
          <div className="bg-bleu px-8 py-10 md:px-16 md:py-14 rounded-lg flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h4 className="text-white font-nunito text-2xl md:text-3xl font-bold mb-2">
                Pr&ecirc;t &agrave; arr&ecirc;ter l&apos;h&eacute;morragie ?
              </h4>
              <p className="text-white/60 text-base sm:text-lg">
                Lancez votre audit gratuit d&egrave;s aujourd&apos;hui.
              </p>
            </div>
            <a
              href="#audit"
              className="bg-orange hover:bg-orange-dark text-white px-10 py-5 rounded-lg font-bold text-lg transition-all duration-300 active:scale-95 whitespace-nowrap shadow-lg"
            >
              D&eacute;marrer l&apos;audit (15 jours)
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
