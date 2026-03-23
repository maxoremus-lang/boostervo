export default function Resultats() {
  const items = [
    "Combien d'appels vos annonces génèrent réellement",
    "Combien sont manqués chaque semaine",
    "Quelles annonces performent — et lesquelles sont invisibles",
    "Quel chiffre d'affaires vous laissez échapper",
    "Les actions concrètes pour récupérer cette marge",
  ];

  return (
    <section className="bg-fond py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl text-center text-bleu mb-12">
          Ce que vous saurez apr&egrave;s l&apos;audit
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {items.map((item, i) => (
            <div
              key={item}
              className={`flex items-start gap-4 bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${i === items.length - 1 ? "sm:col-span-2 sm:max-w-md sm:mx-auto" : ""}`}
            >
              <div className="w-8 h-8 rounded-full bg-orange/10 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span className="text-gray-700 text-base">{item}</span>
            </div>
          ))}
        </div>
        <div className="bg-bleu/5 border border-bleu/15 rounded-2xl p-6 text-center">
          <p className="text-bleu font-semibold text-sm sm:text-base">
            Pas une estimation. Des chiffres issus de votre activit&eacute;
            r&eacute;elle.
          </p>
        </div>
      </div>
    </section>
  );
}
