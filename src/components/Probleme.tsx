export default function Probleme() {
  const suivez = [
    "Nombre d'annonces en ligne",
    "Nombre de vues",
    "Position dans les résultats",
    "Nombre de favoris",
  ];
  const compte = [
    "Combien d'appels arrivent réellement",
    "Combien sont traités vs manqués",
    "Quelles annonces déclenchent un appel",
    "Quel est le taux de transformation réel",
  ];

  return (
    <section className="bg-white py-14 sm:py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl text-center text-bleu mb-10">
          Le vrai probl&egrave;me n&apos;est pas vos annonces.
          <br />
          C&apos;est ce que vous ne mesurez pas.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-10">
          <div className="bg-fond rounded-xl p-6">
            <h3 className="font-nunito font-bold text-lg text-gray-500 mb-4">
              Ce que vous suivez
            </h3>
            <ul className="space-y-3">
              {suivez.map((item) => (
                <li key={item} className="flex items-start gap-2 text-gray-500">
                  <span className="mt-1 text-gray-400">&#9679;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-bleu/5 border-2 border-bleu rounded-xl p-6">
            <h3 className="font-nunito font-bold text-lg text-bleu mb-4">
              Ce qui compte vraiment
            </h3>
            <ul className="space-y-3">
              {compte.map((item) => (
                <li key={item} className="flex items-start gap-2 text-gray-800">
                  <span className="mt-1 text-orange">&#10003;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-center text-red-600 italic font-semibold text-lg">
          R&eacute;sultat : des acheteurs int&eacute;ress&eacute;s appellent&hellip; et
          personne ne d&eacute;croche.
          <br />
          Ils ach&egrave;tent ailleurs.
        </p>
      </div>
    </section>
  );
}
