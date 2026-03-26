export default function LeboncoinAppels() {
  return (
    <section className="bg-white py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Titre */}
        <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl md:text-4xl text-bleu text-center leading-tight mb-12">
          Leboncoin vous montre les appels.<br />
          <span className="text-gray-500">Pas l&apos;argent que vous perdez.</span>
        </h2>

        {/* Timeline horizontale */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-14 flex-wrap sm:flex-nowrap">
          {/* Étape 1 */}
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl sm:text-4xl mb-2">&#x1F4DE;</span>
            <span className="text-sm sm:text-base font-semibold text-bleu">Appel entrant</span>
          </div>
          <span className="text-gray-300 text-2xl hidden sm:block">&rarr;</span>
          {/* Étape 2 */}
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl sm:text-4xl mb-2">&#x274C;</span>
            <span className="text-sm sm:text-base font-semibold text-red-500">Manqu&eacute;</span>
          </div>
          <span className="text-gray-300 text-2xl hidden sm:block">&rarr;</span>
          {/* Étape 3 */}
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl sm:text-4xl mb-2">&#x23F1;&#xFE0F;</span>
            <span className="text-sm sm:text-base font-semibold text-orange">Rappel trop tard</span>
          </div>
          <span className="text-gray-300 text-2xl hidden sm:block">&rarr;</span>
          {/* Étape 4 */}
          <div className="flex flex-col items-center text-center">
            <span className="text-3xl sm:text-4xl mb-2">&#x1F697;</span>
            <span className="text-sm sm:text-base font-semibold text-gray-500">Vente&hellip; ailleurs</span>
          </div>
        </div>

        {/* Deux blocs côte à côte */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 max-w-3xl mx-auto">
          {/* Vous voyez */}
          <div className="border-2 border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-400 text-sm font-semibold uppercase tracking-wide mb-2">Vous voyez</p>
            <p className="text-2xl sm:text-3xl mb-1">&#x1F4CA;</p>
            <p className="font-nunito font-bold text-lg sm:text-xl text-bleu">des appels</p>
          </div>
          {/* Vous ne voyez pas */}
          <div className="border-2 border-orange rounded-xl p-6 text-center">
            <p className="text-orange text-sm font-semibold uppercase tracking-wide mb-2">Vous ne voyez pas</p>
            <p className="text-2xl sm:text-3xl mb-1">&#x1F4B8;</p>
            <p className="font-nunito font-bold text-lg sm:text-xl text-bleu">des ventes perdues</p>
          </div>
        </div>

        {/* Phrase d'accroche */}
        <p className="text-center font-nunito font-extrabold text-xl sm:text-2xl text-bleu">
          Votre t&eacute;l&eacute;phone sonne. <span className="text-orange">Votre marge dispara&icirc;t.</span>
        </p>
      </div>
    </section>
  );
}
