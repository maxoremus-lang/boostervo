export default function Solution() {
  const etapes = [
    {
      num: "1",
      titre: "On installe un tracking invisible sur vos annonces",
      desc: "Un numéro de suivi dédié capte chaque appel entrant, sans changer vos habitudes.",
    },
    {
      num: "2",
      titre: "On mesure tout pendant 15 jours",
      desc: "Volume d'appels, appels manqués, heures creuses, annonces les plus performantes.",
    },
    {
      num: "3",
      titre: "On vous livre un diagnostic chiffré",
      desc: "Vous savez exactement où vous perdez de l'argent — et comment le récupérer.",
    },
  ];

  return (
    <section className="bg-fond py-14 sm:py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl md:text-4xl text-center text-bleu mb-2">
          Avec l&apos;Audit BVO, r&eacute;v&eacute;lez la marge<br />invisible que vous perdez chaque mois
        </h2>
        <p className="text-center text-gray-500 text-sm sm:text-base mb-12">
          Pendant 15 jours, vous voyez ce qui se passe vraiment sur vos appels.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {etapes.map((e) => (
            <div key={e.num} className="text-center">
              <div className="w-14 h-14 rounded-full bg-orange text-white font-nunito font-extrabold text-2xl flex items-center justify-center mx-auto mb-4">
                {e.num}
              </div>
              <h3 className="font-nunito font-bold text-lg text-gray-900 mb-2">
                {e.titre}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">{e.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
