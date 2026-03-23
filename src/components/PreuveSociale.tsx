export default function PreuveSociale() {
  return (
    <section id="temoignages" className="bg-white py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl text-center text-bleu mb-12">
          Ils l&apos;ont test&eacute;
        </h2>

        {/* Testimonial */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10 mb-8">
          <div className="flex items-start gap-4">
            <span className="text-orange text-6xl font-serif leading-none shrink-0 -mt-2">
              &ldquo;
            </span>
            <div>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed italic mb-6">
                On pensait que nos annonces tournaient bien. Apr&egrave;s 15
                jours de tracking, on a r&eacute;alis&eacute; qu&apos;on ratait
                en moyenne 4 appels par semaine &mdash; soit potentiellement 2
                ventes par mois qu&apos;on ne voyait m&ecirc;me pas.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-bleu to-bleu-dark text-white font-nunito font-bold text-sm flex items-center justify-center">
                  NV
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
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
        <div className="bg-gradient-to-r from-orange/5 to-orange/10 border border-orange/20 rounded-2xl p-6 text-center">
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
