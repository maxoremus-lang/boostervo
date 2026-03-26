export default function LeboncoinAppels() {
  return (
    <section className="bg-white py-16 sm:py-20 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Titre centré */}
        <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl md:text-4xl text-bleu text-center leading-tight mb-14">
          Leboncoin vous montre les appels.<br />
          <span className="text-gray-400">Pas l&apos;argent que vous perdez.</span>
        </h2>

        {/* Split bicolore */}
        <div className="grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden shadow-xl mb-12">
          {/* Côté gauche — Statistiques leboncoin */}
          <div className="bg-gray-50 p-8 sm:p-10 border-l-4 border-gray-300">
            <p className="font-nunito font-bold text-lg sm:text-xl text-gray-500 mb-6">Statistiques d&apos;appels leboncoin</p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">&#x1F4DE;</span>
                <span className="text-base text-gray-600">Nombre total d&apos;appels</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">&#x2705;</span>
                <span className="text-base text-gray-600">Appels d&eacute;croch&eacute;s</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">&#x274C;</span>
                <span className="text-base text-gray-600">Appels manqu&eacute;s</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">&#x23F1;&#xFE0F;</span>
                <span className="text-base text-gray-600">Dur&eacute;e des appels</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">&#x1F4C5;</span>
                <span className="text-base text-gray-600">R&eacute;partition par jour / cr&eacute;neau horaire</span>
              </div>
            </div>
          </div>

          {/* Côté droit — Indicateurs BoosterVO */}
          <div className="bg-bleu p-8 sm:p-10">
            <p className="font-nunito font-bold text-lg sm:text-xl text-orange mb-4">Indicateurs de performance BoosterVO</p>
            <p className="text-white/80 text-sm italic mb-5">Les donn&eacute;es Leboncoin&hellip; enrichies et exploit&eacute;es +</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-orange mt-1">-</span>
                <span className="text-base text-white">Le nb d&apos;appels manqu&eacute;s rappel&eacute;s</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange mt-1">-</span>
                <span className="text-base text-white">Le d&eacute;lai moyen de rappel</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange mt-1">-</span>
                <span className="text-base text-white">Le r&eacute;sultat r&eacute;el des appels (docs, RDV, ventes)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange mt-1">-</span>
                <span className="text-base text-white">Le taux de transformation des appels</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange mt-1">-</span>
                <span className="text-base text-white">La marge perdue que vous pouvez r&eacute;cup&eacute;rer</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Phrase d'accroche */}
        <p className="text-center font-nunito font-extrabold text-lg sm:text-xl md:text-2xl">
          <span className="text-bleu">Avec des appels manqu&eacute;s ou rappel&eacute;s trop tard</span>{" "}
          <span className="text-orange font-extrabold italic">votre marge dispara&icirc;t sans faire de bruit&hellip;</span>
        </p>
      </div>
    </section>
  );
}
