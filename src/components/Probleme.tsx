export default function Probleme() {
  const raisons = [
    {
      text: "vous êtes déjà avec un client",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
    },
    {
      text: "vous êtes en essai véhicule",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      ),
    },
    {
      text: "vous êtes sur une démarche administrative",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      text: "ou simplement indisponible",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl md:text-4xl text-center text-bleu mb-14">
          Le probl&egrave;me n&apos;est pas vos annonces,
          <br />
          c&apos;est ce qui se passe apr&egrave;s leur publication
        </h2>

        <div className="flex flex-col lg:flex-row lg:gap-16 lg:items-start mb-10">
          {/* Colonne gauche — Schéma entonnoir */}
          <div className="lg:w-5/12 mb-10 lg:mb-0">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-400 via-orange to-red-500" />

              <div className="ml-4">
                {/* Étape 1 */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Vos annonces</p>
                    <p className="text-green-600 text-sm font-semibold">Appels g&eacute;n&eacute;r&eacute;s ✓</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6 pl-4">
                  <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                  </svg>
                </div>

                {/* Étape 2 */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-orange/10 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Le t&eacute;l&eacute;phone sonne</p>
                    <p className="text-orange text-sm font-semibold">Mais vous &ecirc;tes occup&eacute;&hellip;</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6 pl-4">
                  <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                  </svg>
                </div>

                {/* Étape 3 */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Appel perdu</p>
                    <p className="text-red-500 text-sm font-semibold">Opportunit&eacute; chez un concurrent</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="lg:w-7/12">
            <p className="text-gray-700 text-lg sm:text-xl mb-8">
              Vos annonces g&eacute;n&egrave;rent des appels. Beaucoup d&apos;appels&hellip;
              <br className="hidden sm:block" />
              Mais dans la r&eacute;alit&eacute; du terrain&hellip;
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {raisons.map((item) => (
                <div key={item.text} className="flex items-center gap-3 bg-white rounded-xl px-5 py-4 border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-bleu/5 flex items-center justify-center shrink-0 text-bleu">
                    {item.icon}
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bandeau résultat */}
        <div className="bg-gray-100 rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-orange flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base sm:text-lg">
                R&eacute;sultat&nbsp;: 👉 une partie de vos appels ne sont jamais trait&eacute;s ou rappel&eacute;s trop tard.
              </p>
              <p className="text-gray-500 text-sm mt-1 italic">
                Et chaque appel manqu&eacute; = une opportunit&eacute; qui part chez un concurrent.
              </p>
            </div>
          </div>
          <a
            href="#offre"
            className="shrink-0 bg-bleu-dark text-white font-bold px-6 py-3 rounded-xl hover:bg-bleu transition-colors text-sm sm:text-base text-center"
          >
            Inverser la tendance
          </a>
        </div>
      </div>
    </section>
  );
}
