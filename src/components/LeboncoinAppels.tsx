export default function LeboncoinAppels() {
  return (
    <section className="bg-white py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Titre */}
        <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl md:text-4xl text-bleu text-center leading-tight mb-14">
          Leboncoin vous montre les appels.<br />
          <span className="text-gray-400">Pas l&apos;argent que vous perdez.</span>
        </h2>

        {/* Timeline verticale */}
        <div className="relative max-w-lg mx-auto mb-14 pl-12">
          {/* Ligne verticale dégradée */}
          <div className="absolute left-5 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-green-400 via-yellow-400 via-orange to-red-500" />

          {/* Étape 1 */}
          <div className="relative flex items-center mb-8">
            <div className="absolute left-[-28px] w-10 h-10 rounded-full bg-green-400 flex items-center justify-center text-xl shadow-md">&#x1F4DE;</div>
            <div className="ml-4">
              <p className="font-nunito font-bold text-lg text-bleu">Appel entrant</p>
              <p className="text-gray-400 text-sm">Un prospect vous contacte via votre annonce</p>
            </div>
          </div>

          {/* Étape 2 */}
          <div className="relative flex items-center mb-8">
            <div className="absolute left-[-28px] w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-xl shadow-md">&#x274C;</div>
            <div className="ml-4">
              <p className="font-nunito font-bold text-lg text-red-500">Manqu&eacute;</p>
              <p className="text-gray-400 text-sm">Vous &ecirc;tes occup&eacute;, en rendez-vous, en essai</p>
            </div>
          </div>

          {/* Étape 3 */}
          <div className="relative flex items-center mb-8">
            <div className="absolute left-[-28px] w-10 h-10 rounded-full bg-orange flex items-center justify-center text-xl shadow-md">&#x23F1;&#xFE0F;</div>
            <div className="ml-4">
              <p className="font-nunito font-bold text-lg text-orange">Rappel trop tard</p>
              <p className="text-gray-400 text-sm">Le prospect a d&eacute;j&agrave; trouv&eacute; ailleurs</p>
            </div>
          </div>

          {/* Étape 4 */}
          <div className="relative flex items-center">
            <div className="absolute left-[-28px] w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-xl shadow-md">&#x1F697;</div>
            <div className="ml-4">
              <p className="font-nunito font-bold text-lg text-gray-500">Vente&hellip; ailleurs</p>
              <p className="text-gray-400 text-sm">Votre concurrent r&eacute;cup&egrave;re la marge</p>
            </div>
          </div>
        </div>

        {/* Deux blocs côte à côte */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 max-w-3xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Vous voyez</p>
            <p className="text-4xl mb-2">&#x1F4CA;</p>
            <p className="font-nunito font-bold text-xl text-bleu">des appels</p>
          </div>
          <div className="bg-orange/5 border-2 border-orange rounded-2xl p-8 text-center">
            <p className="text-orange text-xs font-semibold uppercase tracking-widest mb-3">Vous ne voyez pas</p>
            <p className="text-4xl mb-2">&#x1F4B8;</p>
            <p className="font-nunito font-bold text-xl text-bleu">des ventes perdues</p>
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
