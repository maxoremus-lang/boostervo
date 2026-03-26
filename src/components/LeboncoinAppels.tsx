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
          {/* Côté gauche — Ce que vous voyez */}
          <div className="bg-gray-50 p-8 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Ce que vous voyez</p>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <span className="text-2xl">&#x1F4DE;</span>
                <span className="text-base font-semibold text-bleu">Appel entrant</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl">&#x274C;</span>
                <span className="text-base font-semibold text-gray-500">Manqu&eacute;</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl">&#x23F1;&#xFE0F;</span>
                <span className="text-base font-semibold text-gray-500">Rappel trop tard</span>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-4xl mb-2">&#x1F4CA;</p>
              <p className="font-nunito font-bold text-xl text-gray-400">Des appels. C&apos;est tout.</p>
            </div>
          </div>

          {/* Côté droit — Ce que vous ne voyez pas */}
          <div className="bg-bleu p-8 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-widest text-orange mb-6">Ce que vous ne voyez pas</p>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <span className="text-2xl">&#x1F4B8;</span>
                <span className="text-base font-semibold text-white">Marge perdue</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl">&#x1F697;</span>
                <span className="text-base font-semibold text-white">Client parti chez un concurrent</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl">&#x1F4C9;</span>
                <span className="text-base font-semibold text-white">CA en baisse silencieuse</span>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-4xl mb-2">&#x1F4B0;</p>
              <p className="font-nunito font-bold text-xl text-orange">Des ventes perdues. Chaque semaine.</p>
            </div>
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
