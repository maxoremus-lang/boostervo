export default function Solution() {
  const etapes = [
    {
      num: "1",
      titre: "On installe un tracking invisible sur vos annonces",
      desc: "Un numéro de suivi dédié capte chaque appel entrant, sans changer vos habitudes.",
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      ),
      color: "text-bleu",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      badgeColor: "bg-bleu",
    },
    {
      num: "2",
      titre: "On mesure tout pendant 15 jours",
      desc: "Volume d'appels, appels manqués, heures creuses, annonces les plus performantes.",
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      color: "text-orange",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100",
      badgeColor: "bg-orange",
    },
    {
      num: "3",
      titre: "On vous livre un diagnostic chiffré",
      desc: "Vous savez exactement où vous perdez de l'argent — et comment le récupérer.",
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
      ),
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-100",
      badgeColor: "bg-green-500",
    },
  ];

  return (
    <section id="solution" className="bg-fond py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl text-center text-bleu mb-4">
          Comment &ccedil;a fonctionne
        </h2>
        <p className="text-center text-gray-500 mb-14 max-w-xl mx-auto">
          Un processus simple en 3 &eacute;tapes pour identifier vos pertes
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {etapes.map((e) => (
            <div
              key={e.num}
              className={`relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow border ${e.borderColor} p-8 text-center group`}
            >
              {/* Icône */}
              <div className={`w-16 h-16 ${e.bgColor} ${e.color} rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform`}>
                {e.icon}
              </div>
              {/* Badge numéro */}
              <div className={`absolute top-4 right-4 w-8 h-8 rounded-full ${e.badgeColor} text-white font-nunito font-bold text-sm flex items-center justify-center`}>
                {e.num}
              </div>
              <h3 className="font-nunito font-bold text-lg text-gray-900 mb-3">
                {e.titre}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{e.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
