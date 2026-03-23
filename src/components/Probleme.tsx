export default function Probleme() {
  const raisons = [
    { icon: "👤", text: "vous êtes déjà avec un client" },
    { icon: "🚗", text: "vous êtes en essai véhicule" },
    { icon: "📋", text: "vous êtes sur une démarche administrative" },
    { icon: "⏰", text: "ou simplement indisponible" },
  ];

  return (
    <section className="bg-white py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl text-center text-bleu mb-10">
          Le probl&egrave;me n&apos;est pas vos annonces.
          <br />
          C&apos;est ce qui se passe apr&egrave;s.
        </h2>

        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12">
          {/* Colonne gauche — Texte */}
          <div className="lg:w-1/2 mb-8 lg:mb-0">
            <p className="text-gray-700 text-lg sm:text-xl mb-8">
              Vos annonces g&eacute;n&egrave;rent des appels. <strong>Beaucoup d&apos;appels.</strong>
              <br className="hidden sm:block" />
              {" "}Mais dans la r&eacute;alit&eacute; du terrain&nbsp;:
            </p>

            <div className="space-y-4 mb-8">
              {raisons.map((item) => (
                <div key={item.text} className="flex items-center gap-4 bg-gray-50 rounded-xl px-5 py-3 border border-gray-100">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-gray-800 text-base sm:text-lg">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Colonne droite — Résultat */}
          <div className="lg:w-1/2">
            <div className="bg-gradient-to-br from-orange/5 to-red-50 border border-orange/20 rounded-2xl p-8 mb-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-3xl">&#128073;</span>
                <p className="text-gray-800 font-semibold text-lg sm:text-xl">
                  R&eacute;sultat&nbsp;: une partie de vos appels ne sont jamais trait&eacute;s ou rappel&eacute;s trop tard.
                </p>
              </div>
              <div className="h-px bg-gray-200 my-5" />
              <p className="text-red-600 italic font-semibold text-lg sm:text-xl text-center">
                Et chaque appel manqu&eacute; = une opportunit&eacute; qui part chez un concurrent.
              </p>
            </div>

            {/* Mini stat visuelle */}
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">Appels re&ccedil;us</p>
              </div>
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
                  <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3.75L18 6m0 0l2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m1.5 13.5c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 014.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.055.902-.417 1.173l-1.293.97a1.062 1.062 0 00-.38 1.21 12.035 12.035 0 007.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 011.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 01-2.25 2.25h-2.25z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">Appels perdus</p>
              </div>
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-orange/10 flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">💸</span>
                </div>
                <p className="text-xs text-gray-500">Marge perdue</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
