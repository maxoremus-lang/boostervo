export default function Pourquoi() {
  const besoins = [
    "Un nouveau site internet",
    "Plus de budget publicitaire",
    "Un CRM complexe",
    "Un community manager",
  ];

  return (
    <section className="bg-fond py-14 sm:py-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl text-center text-bleu mb-10">
          Vous n&apos;avez pas besoin de&hellip;
        </h2>
        <ul className="space-y-3 mb-10 max-w-md mx-auto">
          {besoins.map((b) => (
            <li key={b} className="flex items-center gap-3">
              <span className="text-red-400 text-lg">&#10007;</span>
              <span className="text-gray-500 line-through">{b}</span>
            </li>
          ))}
        </ul>
        <div className="border-l-4 border-bleu bg-white rounded-r-xl p-6 shadow-sm">
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
