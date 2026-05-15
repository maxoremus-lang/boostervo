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
      <div className="max-w-[1280px] mx-auto bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(7,18,37,0.08)]">
        {/* Bloc haut — texte + image */}
        <div className="grid lg:grid-cols-[1.05fr_1fr] bg-gradient-to-r from-white from-45% to-creme">
          {/* Colonne texte */}
          <div className="px-7 py-8 sm:px-12 sm:py-10 lg:px-16 lg:py-12 z-10">
            <h2 className="font-nunito font-black text-bleu text-3xl sm:text-4xl lg:text-[42px] leading-[1.18] tracking-tight">
              Pourquoi les{" "}
              <span className="text-orange">
                appels
                <br />
                manqués
              </span>{" "}
              sont inévitables
              <br />
              dans le VO
            </h2>

            <div className="w-14 h-1 bg-orange rounded-full my-7 lg:my-8" />

            <p className="font-opensans font-bold text-bleu text-lg sm:text-xl leading-snug mb-5">
              Ce n&apos;est pas un manque de sérieux, c&apos;est une réalité
              structurelle liée à l&apos;activité VO
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
          <div className="relative min-h-[380px] lg:min-h-0 overflow-hidden">
            <Image
              src="/images/vendeur-vo-telephone.png"
              alt="Négociant VO au téléphone devant son parc de véhicules d'occasion"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-[50%_15%]"
              priority={false}
            />
            {/* Fondu blanc côté gauche pour transition douce avec le texte */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/45 to-transparent z-[1]" />

            {/* Carte "Appel manqué" — taille réduite 50% */}
            <div className="absolute right-3 sm:right-5 lg:right-7 bottom-3 sm:bottom-8 lg:bottom-12 z-[2] flex items-center gap-2.5 bg-white rounded-xl px-3.5 py-2.5 shadow-[0_10px_24px_rgba(0,0,0,0.16)] min-w-[140px] sm:min-w-[160px]">
              <div className="w-7 h-7 sm:w-[30px] sm:h-[30px] rounded-full bg-orange-50 text-orange flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "15px", fontVariationSettings: "'FILL' 1" }}
                >
                  call
                </span>
              </div>
              <div>
                <strong className="block font-nunito font-extrabold text-bleu text-xs mb-0.5">
                  Appel manqué
                </strong>
                <p className="text-gray-500 text-[10px] leading-tight">Numéro masqué</p>
                <p className="text-gray-500 text-[10px] leading-tight">Aujourd&apos;hui à 11:42</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bloc bas — 5 raisons */}
        <div className="px-6 py-10 sm:px-10 sm:py-12 border-t border-creme-dark">
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
                      fontSize: "50px",
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
