export default function Offre() {
  const features = [
    "Installation d'un numéro de tracking sur vos annonces",
    "15 jours de suivi complet des appels entrants",
    "Rapport détaillé : volume, appels manqués, créneaux critiques",
    "Recommandations concrètes pour récupérer votre marge",
  ];

  return (
    <section id="audit" className="bg-fond py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-white">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-bleu to-bleu-dark px-8 py-6">
            <h2 className="font-nunito font-extrabold text-xl sm:text-2xl text-white text-center">
              Ce qui est inclus dans l&apos;audit
            </h2>
          </div>
          {/* Corps */}
          <div className="p-8 sm:p-10">
            <ul className="space-y-5 mb-10">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-orange/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-base leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
            {/* Bas — prix + CTA */}
            <div className="border-t border-gray-100 pt-8 text-center">
              <p className="text-gray-400 text-sm mb-1">Valeur de l&apos;audit</p>
              <p className="font-nunito font-extrabold text-4xl text-bleu mb-6">
                Gratuit
              </p>
              <a
                href="#cta"
                className="block w-full bg-orange hover:bg-orange-dark text-white font-bold text-base sm:text-lg px-6 py-4 rounded-full transition-all hover:shadow-lg min-h-[48px]"
              >
                Demander mon audit gratuit &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
