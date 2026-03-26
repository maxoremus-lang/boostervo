export default function LeboncoinAppels() {
  return (
    <section className="bg-bleu py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Titre */}
        <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl md:text-4xl text-white text-center leading-tight mb-12">
          Leboncoin vous montre les appels.<br />
          <span className="text-white/60">Pas l&apos;argent que vous perdez.</span>
        </h2>

        {/* Timeline horizontale — cards blanches */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 mb-14 flex-wrap sm:flex-nowrap">
          <div className="bg-white rounded-xl shadow-lg p-5 flex flex-col items-center text-center min-w-[100px]">
            <span className="text-3xl sm:text-4xl mb-2">&#x1F4DE;</span>
            <span className="text-sm font-semibold text-bleu">Appel entrant</span>
          </div>
          <span className="text-white/40 text-2xl hidden sm:block">&rarr;</span>
          <div className="bg-white rounded-xl shadow-lg p-5 flex flex-col items-center text-center min-w-[100px]">
            <span className="text-3xl sm:text-4xl mb-2">&#x274C;</span>
            <span className="text-sm font-semibold text-red-500">Manqu&eacute;</span>
          </div>
          <span className="text-white/40 text-2xl hidden sm:block">&rarr;</span>
          <div className="bg-white rounded-xl shadow-lg p-5 flex flex-col items-center text-center min-w-[100px]">
            <span className="text-3xl sm:text-4xl mb-2">&#x23F1;&#xFE0F;</span>
            <span className="text-sm font-semibold text-orange">Rappel trop tard</span>
          </div>
          <span className="text-white/40 text-2xl hidden sm:block">&rarr;</span>
          <div className="bg-white rounded-xl shadow-lg p-5 flex flex-col items-center text-center min-w-[100px]">
            <span className="text-3xl sm:text-4xl mb-2">&#x1F697;</span>
            <span className="text-sm font-semibold text-gray-500">Vente&hellip; ailleurs</span>
          </div>
        </div>

        {/* Deux blocs glassmorphism */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center">
            <p className="text-white/50 text-sm font-semibold uppercase tracking-wide mb-2">Vous voyez</p>
            <p className="text-2xl sm:text-3xl mb-1">&#x1F4CA;</p>
            <p className="font-nunito font-bold text-lg sm:text-xl text-white">des appels</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border-2 border-orange rounded-xl p-6 text-center">
            <p className="text-orange text-sm font-semibold uppercase tracking-wide mb-2">Vous ne voyez pas</p>
            <p className="text-2xl sm:text-3xl mb-1">&#x1F4B8;</p>
            <p className="font-nunito font-bold text-lg sm:text-xl text-white">des ventes perdues</p>
          </div>
        </div>

        {/* Phrase d'accroche */}
        <p className="text-center font-nunito font-extrabold text-xl sm:text-2xl text-white">
          Votre t&eacute;l&eacute;phone sonne. <span className="text-orange">Votre marge dispara&icirc;t.</span>
        </p>
      </div>
    </section>
  );
}
