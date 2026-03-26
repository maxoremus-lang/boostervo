export default function ChiffreChoc() {
  return (
    <section className="bg-bleu py-14 sm:py-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto text-center">
        <p className="font-nunito font-extrabold text-xl sm:text-2xl md:text-3xl text-white uppercase leading-tight mb-1">
          <span className="text-orange">30-40%</span> des appels du secteur automobile
        </p>
        <p className="font-nunito font-extrabold text-xl sm:text-2xl md:text-3xl text-white uppercase leading-tight mb-3">
          sont perdus ou rappel&eacute;s trop tard
        </p>
        <p className="text-white/60 text-sm sm:text-base italic">
          (<a href="https://journalauto.com/services/leboncoin-des-nouveautes-pour-booster-les-annonces-automobiles/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/80 transition-colors">&Eacute;tude Leboncoin</a> &mdash; janvier 2025)
        </p>
      </div>

      {/* Bloc info tracking */}
      <div className="bg-white py-10 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-bleu-dark rounded-xl px-6 py-5 sm:px-8 sm:py-6 text-center shadow-lg relative">
            {/* Flèche vers le haut */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-bleu-dark rotate-45" />
            <p className="text-white/80 text-sm sm:text-base leading-relaxed relative z-10">
              Si vous publiez en automatique vos annonces sur Leboncoin, avec votre
              abonnement vous avez acc&egrave;s &agrave; vos statistiques de tracking o&ugrave; vous
              verrez{" "}
              <span className="text-orange font-semibold">qu&apos;une partie de vos appels ne vous rapporte rien.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
