export default function Probleme() {
  return (
    <section className="bg-gradient-to-b from-white via-gray-50 to-white py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Titre */}
        <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl md:text-4xl text-center text-bleu mb-3 leading-tight">
          Vous payez Leboncoin pour g&eacute;n&eacute;rer des appels&hellip;
        </h2>
        <p className="font-nunito font-bold text-lg sm:text-xl md:text-2xl text-center text-gray-700 mb-14 leading-tight">
          mais savez-vous vraiment combien chaque appel{" "}
          <br className="hidden sm:block" />
          vous rapporte&hellip; <span className="text-orange">ou vous co&ucirc;te&nbsp;?</span>
        </p>

        {/* Bloc 1 — La question dérangeante */}
        <div className="mb-4">
          <p className="text-center text-gray-600 mb-2 text-sm uppercase tracking-widest font-nunito font-bold">
            La question d&eacute;rangeante
          </p>
          <p className="text-center text-gray-900 text-lg sm:text-xl mb-8 font-nunito font-bold">
            Sur vos 50 derniers appels, savez-vous&hellip;
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border-2 border-orange/30 p-6 text-center shadow-sm">
              <div className="w-14 h-14 rounded-full bg-orange/10 mx-auto mb-3 flex items-center justify-center">
                <span className="text-orange font-nunito font-extrabold text-3xl">?</span>
              </div>
              <p className="font-nunito font-bold text-gray-900">
                Combien ont &eacute;t&eacute; <span className="text-orange">rappel&eacute;s</span>&nbsp;?
              </p>
            </div>
            <div className="bg-white rounded-2xl border-2 border-orange/30 p-6 text-center shadow-sm">
              <div className="w-14 h-14 rounded-full bg-orange/10 mx-auto mb-3 flex items-center justify-center">
                <span className="text-orange font-nunito font-extrabold text-3xl">?</span>
              </div>
              <p className="font-nunito font-bold text-gray-900">
                En combien <span className="text-orange">de temps</span>&nbsp;?
              </p>
            </div>
            <div className="bg-white rounded-2xl border-2 border-orange/30 p-6 text-center shadow-sm">
              <div className="w-14 h-14 rounded-full bg-orange/10 mx-auto mb-3 flex items-center justify-center">
                <span className="text-orange font-nunito font-extrabold text-3xl">?</span>
              </div>
              <p className="font-nunito font-bold text-gray-900">
                Combien ont g&eacute;n&eacute;r&eacute; <span className="text-orange">une vente</span>&nbsp;?
              </p>
            </div>
          </div>

          <p className="text-center text-gray-700 italic mb-12">
            Si vous n&apos;avez pas la r&eacute;ponse&hellip;{" "}
            <strong className="text-orange-700 not-italic">vous perdez de l&apos;argent.</strong>
          </p>
        </div>

        {/* Flèche de transition */}
        <div className="flex justify-center mb-12">
          <div className="w-12 h-12 rounded-full bg-bleu flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>
          </div>
        </div>

        {/* Bloc 2 — La révélation */}
        <div className="bg-bleu rounded-3xl p-8 sm:p-12 text-white mb-10 shadow-xl">
          <p className="text-center text-orange mb-2 text-sm uppercase tracking-widest font-nunito font-bold">
            La r&eacute;ponse BoosterVO
          </p>
          <h3 className="font-nunito font-extrabold text-2xl sm:text-3xl text-center mb-8">
            Avec l&apos;audit BoosterVO,
            <br />
            vous voyez exactement&nbsp;:
          </h3>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur rounded-xl p-5 text-center border border-white/20">
              <svg className="w-8 h-8 text-green-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
              <p className="font-nunito font-bold">
                Ce qui vous fait <span className="text-orange">gagner</span>
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-5 text-center border border-white/20">
              <svg className="w-8 h-8 text-red-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
              </svg>
              <p className="font-nunito font-bold">
                Ce qui vous fait <span className="text-orange">perdre</span>
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-5 text-center border border-white/20">
              <svg className="w-8 h-8 text-orange mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-nunito font-bold">
                O&ugrave; votre <span className="text-orange">marge fuit</span>
              </p>
            </div>
          </div>

          <div className="text-center text-blue-100 text-lg space-y-1">
            <p>Vous arr&ecirc;tez de courir apr&egrave;s tous les appels.</p>
            <p className="font-nunito font-extrabold text-white text-xl">
              Vous ciblez, vous relancez, vous encaissez.
            </p>
          </div>
        </div>

        {/* Punchline finale + CTA */}
        <div className="text-center">
          <p className="font-nunito font-extrabold text-2xl sm:text-4xl text-bleu mb-6 leading-tight">
            Votre t&eacute;l&eacute;phone devient
            <br />
            un <span className="text-orange">centre de profit.</span>
          </p>
          <a
            href="#offre"
            className="inline-block bg-orange text-white font-nunito font-bold px-10 py-4 rounded-xl hover:bg-orange-dark transition-colors text-lg shadow-lg"
          >
            Demander mon audit gratuit →
          </a>
        </div>
      </div>
    </section>
  );
}
