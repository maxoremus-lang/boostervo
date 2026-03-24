export default function Resultats() {
  const items = [
    "Combien d'appels vos annonces génèrent réellement",
    "Combien sont manqués chaque semaine",
    "Quelles annonces performent — et lesquelles sont invisibles",
    "Quel chiffre d'affaires vous laissez échapper",
    "Les actions concrètes pour récupérer cette marge",
  ];

  return (
    <section className="bg-white py-14 sm:py-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl text-center text-bleu mb-10">
          Ce que vous saurez apr&egrave;s l&apos;audit
        </h2>
        <ul className="space-y-4 mb-10">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="text-orange text-xl mt-0.5">&#10003;</span>
              <span className="text-gray-800 text-base">{item}</span>
            </li>
          ))}
        </ul>
        <div className="bg-bleu/5 border border-bleu/20 rounded-xl p-5 text-center">
          <p className="text-bleu font-semibold text-sm sm:text-base">
            Pas une estimation. Des chiffres issus de votre activit&eacute;
            r&eacute;elle.
          </p>
        </div>
      </div>
    </section>
  );
}
