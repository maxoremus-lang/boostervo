import Image from "next/image";

const raisons = [
  {
    icon: "groups",
    titre: "Clients sur parc",
    desc: (
      <>
        Vous êtes occupé
        <br />
        avec un client.
      </>
    ),
  },
  {
    icon: "directions_car",
    titre: "Essais",
    desc: (
      <>
        Vous êtes en essai
        <br />
        routier.
      </>
    ),
  },
  {
    icon: "description",
    titre: "Administratif",
    desc: (
      <>
        Vous gérez papiers,
        <br />
        annonces, messages&hellip;
      </>
    ),
  },
  {
    icon: "location_on",
    titre: "Déplacements",
    desc: (
      <>
        Vous êtes sur la route
        <br />
        ou en rendez-vous.
      </>
    ),
  },
  {
    icon: "schedule",
    titre: "Multitâche",
    desc: (
      <>
        Trop de choses à gérer
        <br />
        en même temps.
      </>
    ),
  },
];

export default function PourquoiAppelsManques() {
  return (
    <section className="bg-creme py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(7,18,37,0.08)]">
        {/* Bloc haut — texte + image */}
        <div className="grid lg:grid-cols-[1.05fr_1fr] min-h-[520px] bg-gradient-to-r from-white from-45% to-creme">
          {/* Colonne texte */}
          <div className="px-7 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20 z-10">
            <p className="text-orange font-nunito font-extrabold text-sm tracking-[0.18em] mb-5">
              LE PROBLÈME
            </p>

            <h2 className="font-nunito font-black text-bleu text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight">
              Pourquoi la majorité
              <br />
              des négociants VO
              <br />
              ont des appels manqués
            </h2>

            <div className="w-14 h-1 bg-orange rounded-full my-7 lg:my-8" />

            <p className="font-opensans font-bold text-bleu text-lg sm:text-xl leading-snug mb-5">
              Ce n&apos;est pas un manque de sérieux.
              <br />
              C&apos;est la réalité du terrain.
            </p>

            <p className="font-opensans text-bleu text-base sm:text-lg lg:text-[19px] leading-relaxed">
              Entre les clients, les essais, l&apos;administratif et les
              déplacements,{" "}
              <span className="text-orange font-extrabold">
                décrocher 100&nbsp;% des appels est presque impossible.
              </span>
            </p>
          </div>

          {/* Colonne image */}
          <div className="relative min-h-[380px] lg:min-h-[520px] overflow-hidden">
            <Image
              src="/images/vendeur-vo-telephone.png"
              alt="Négociant VO au téléphone devant son parc de véhicules d'occasion"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority={false}
            />
            {/* Fondu blanc côté gauche pour transition douce avec le texte */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-transparent to-transparent" />

            {/* Carte "Appel manqué" */}
            <div className="absolute right-5 sm:right-8 lg:right-12 bottom-6 sm:bottom-10 lg:bottom-20 flex items-center gap-4 bg-white rounded-2xl px-5 py-4 sm:px-7 sm:py-5 shadow-[0_18px_45px_rgba(0,0,0,0.16)] min-w-[260px] sm:min-w-[300px]">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-orange-50 text-orange flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "26px" }}
                >
                  call
                </span>
              </div>
              <div>
                <strong className="block font-nunito font-extrabold text-bleu text-base sm:text-lg mb-1">
                  Appel manqué
                </strong>
                <p className="text-gray-500 text-sm">Numéro masqué</p>
                <p className="text-gray-500 text-sm">Aujourd&apos;hui à 11:42</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bloc bas — 5 raisons */}
        <div className="px-6 py-10 sm:px-10 sm:py-12 border-t border-creme-dark">
          <h3 className="text-center font-nunito font-black text-bleu text-xl sm:text-2xl lg:text-[28px] mb-10">
            Des appels qui arrivent&hellip; au pire moment
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-2 gap-y-8">
            {raisons.map((r, i) => (
              <div
                key={r.titre}
                className={`text-center px-4 ${
                  i < raisons.length - 1
                    ? "lg:border-r lg:border-creme-dark"
                    : ""
                }`}
              >
                <div className="text-orange mb-3 flex justify-center">
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "38px",
                      fontVariationSettings: "'wght' 500",
                    }}
                  >
                    {r.icon}
                  </span>
                </div>
                <h4 className="font-nunito font-black text-bleu text-base sm:text-lg mb-2">
                  {r.titre}
                </h4>
                <p className="font-opensans text-bleu text-sm sm:text-base leading-snug">
                  {r.desc}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center font-nunito font-extrabold text-bleu text-base sm:text-lg mt-10">
            Les appels arrivent à tout moment&hellip; et vous ne pouvez pas être
            partout à la fois.
          </p>
        </div>
      </div>
    </section>
  );
}
