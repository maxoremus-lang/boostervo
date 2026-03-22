export default function PreuveSociale() {
  return (
    <section className="bg-fond py-14 sm:py-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl text-center text-bleu mb-10">
          Ils l&apos;ont test&eacute;
        </h2>

        {/* Testimonial */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex items-start gap-4">
            <span className="text-orange text-5xl font-serif leading-none shrink-0">
              &ldquo;
            </span>
            <div>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed italic mb-4">
                On pensait que nos annonces tournaient bien. Apr&egrave;s 15
                jours de tracking, on a r&eacute;alis&eacute; qu&apos;on ratait
                en moyenne 4 appels par semaine &mdash; soit potentiellement 2
                ventes par mois qu&apos;on ne voyait m&ecirc;me pas.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-bleu text-white font-nunito font-bold text-sm flex items-center justify-center">
                  NV
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    N&eacute;gociant VO ind&eacute;pendant
                  </p>
                  <p className="text-xs text-gray-500">
                    R&eacute;gion Pays de la Loire &middot; 15 v&eacute;hicules
                    en stock
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Micro-preuve */}
        <div className="border border-orange/30 bg-orange/5 rounded-xl p-5 text-center">
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            Un n&eacute;gociant VO g&eacute;n&egrave;re en moyenne entre{" "}
            <strong className="text-orange">80 et 150 appels par mois</strong>{" "}
            via ses annonces. Avec 30&nbsp;% d&apos;appels non trait&eacute;s,
            cela repr&eacute;sente plusieurs ventes perdues &mdash; chaque mois.
          </p>
        </div>
      </div>
    </section>
  );
}
