export default function Pourquoi() {
  const besoins = [
    "Un nouveau site internet",
    "Plus de budget publicitaire",
    "Un CRM complexe",
    "Un community manager",
  ];

  return (
    <section id="apropos" className="bg-white py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl text-center text-bleu mb-12">
          Vous n&apos;avez pas besoin de&hellip;
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 max-w-2xl mx-auto">
          {besoins.map((b) => (
            <div key={b} className="flex items-center gap-4 bg-red-50/50 rounded-xl px-5 py-4 border border-red-100/50">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="text-gray-400 line-through text-base">{b}</span>
            </div>
          ))}
        </div>
        <div className="bg-gradient-to-r from-bleu/5 to-bleu/10 border-l-4 border-bleu rounded-r-2xl p-8 shadow-sm">
          <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
            Vous avez besoin de{" "}
            <strong className="text-bleu">
              savoir ce qui se passe entre votre annonce et la vente
            </strong>
            . C&apos;est exactement ce que BoosterVO r&eacute;v&egrave;le.
          </p>
        </div>
      </div>
    </section>
  );
}
