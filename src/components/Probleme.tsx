export default function Probleme() {
  const raisons = [
    "vous êtes déjà avec un client",
    "vous êtes en essai véhicule",
    "vous êtes sur une démarche administrative",
    "ou simplement indisponible",
  ];

  return (
    <section className="bg-white py-14 sm:py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl text-center text-bleu mb-10">
          Le probl&egrave;me n&apos;est pas vos annonces.
          <br />
          C&apos;est ce qui se passe apr&egrave;s.
        </h2>

        <p className="text-center text-gray-700 text-lg sm:text-xl mb-8">
          Vos annonces g&eacute;n&egrave;rent des appels. <strong>Beaucoup d&apos;appels.</strong>
          <br className="hidden sm:block" />
          {" "}Mais dans la r&eacute;alit&eacute; du terrain&nbsp;:
        </p>

        <div className="max-w-md mx-auto mb-10">
          <ul className="space-y-3">
            {raisons.map((item) => (
              <li key={item} className="flex items-start gap-3 text-gray-800 text-base sm:text-lg">
                <span className="mt-1 text-orange font-bold">&bull;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-fond border-l-4 border-orange rounded-r-xl p-6 sm:p-8 mb-8">
          <p className="text-gray-800 font-semibold text-lg sm:text-xl">
            R&eacute;sultat&nbsp;: &#128073; une partie de vos appels ne sont jamais trait&eacute;s ou rappel&eacute;s trop tard.
          </p>
        </div>

        <p className="text-center text-red-600 italic font-semibold text-lg sm:text-xl">
          Et chaque appel manqu&eacute; = une opportunit&eacute; qui part chez un concurrent.
        </p>
      </div>
    </section>
  );
}
