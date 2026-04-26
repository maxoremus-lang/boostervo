import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Manuel BoosterVO — Pilotez vos appels leboncoin en temps réel",
  description:
    "Découvrez en 7 étapes comment BoosterVO transforme votre mobile en tableau de bord commercial : visualisation des appels, qualification rapide, statistiques de conversion et impact financier.",
};

type StepProps = {
  number: number;
  title: string;
  highlight?: string;
  intro?: string;
  bullets?: Array<string | { strong: string; rest?: string }>;
  outro?: string;
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  reverse?: boolean;
  bgClass?: string;
};

function Step({
  number,
  title,
  highlight,
  intro,
  bullets,
  outro,
  imageSrc,
  imageAlt,
  imageWidth,
  imageHeight,
  reverse = false,
  bgClass = "bg-white",
}: StepProps) {
  return (
    <section className={`${bgClass} py-16 sm:py-24 px-6 sm:px-10 lg:px-16`}>
      <div className="max-w-6xl mx-auto">
        <div
          className={`flex flex-col ${
            reverse ? "lg:flex-row-reverse" : "lg:flex-row"
          } gap-10 lg:gap-16 items-center`}
        >
          {/* Texte */}
          <div className="lg:w-1/2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange text-white font-nunito font-extrabold text-xl mb-5">
              {number}
            </div>
            <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl lg:text-4xl text-bleu leading-tight mb-2">
              {title}
            </h2>
            {highlight && (
              <p className="font-nunito font-extrabold text-xl sm:text-2xl text-orange leading-tight mb-6">
                {highlight}
              </p>
            )}
            {intro && (
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-5">
                {intro}
              </p>
            )}
            {bullets && bullets.length > 0 && (
              <ul className="space-y-2.5 mb-5">
                {bullets.map((b, i) => {
                  const isObj = typeof b !== "string";
                  return (
                    <li
                      key={i}
                      className="flex gap-3 text-gray-700 text-base leading-relaxed"
                    >
                      <span className="text-orange font-bold flex-shrink-0">
                        →
                      </span>
                      <span>
                        {isObj ? (
                          <>
                            <strong className="font-bold text-bleu">
                              {b.strong}
                            </strong>
                            {b.rest ? ` ${b.rest}` : ""}
                          </>
                        ) : (
                          b
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            {outro && (
              <p className="text-bleu font-bold text-base sm:text-lg leading-relaxed border-l-4 border-orange pl-4 mt-5">
                {outro}
              </p>
            )}
          </div>

          {/* Image mobile */}
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative w-full max-w-[280px] sm:max-w-[340px]">
              <div className="rounded-3xl overflow-hidden shadow-2xl bg-white">
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  width={imageWidth}
                  height={imageHeight}
                  className="w-full h-auto"
                  priority={number <= 2}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ManuelPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* HERO — Slide 1 */}
        <section className="bg-bleu pt-16 sm:pt-24 pb-20 sm:pb-28 px-6 sm:px-10 lg:px-16 text-white">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-orange font-bold text-xs sm:text-sm uppercase tracking-[0.25em] mb-6">
              Manuel de démonstration
            </p>
            <h1 className="font-nunito font-extrabold text-3xl sm:text-5xl lg:text-6xl leading-tight mb-8">
              Pilotez vos appels{" "}
              <span className="text-orange">leboncoin</span> en temps réel
            </h1>
            <p className="text-white/85 text-base sm:text-xl leading-relaxed max-w-3xl mx-auto mb-8">
              Vos annonces VO génèrent des appels. Mais malgré les notifications de
              votre mobile et les statistiques leboncoin, vous pilotez encore vos
              appels à l&apos;aveugle.
            </p>
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto text-left mb-10">
              <p className="text-white/90 text-sm sm:text-base font-semibold mb-3">
                Vous n&apos;avez pas de visibilité sur :
              </p>
              <ul className="space-y-2 text-white/85 text-sm sm:text-base">
                <li>• les appels manqués rappelés</li>
                <li>• votre délai moyen de rappel</li>
                <li>• les appels convertis en RDV</li>
                <li>• les appels convertis en ventes</li>
              </ul>
            </div>
            <p className="font-nunito font-extrabold text-xl sm:text-3xl leading-tight">
              Transformez votre mobile en{" "}
              <span className="text-orange">centre de profit commercial.</span>
            </p>
          </div>
        </section>

        {/* Étape 1 — Slide 2 */}
        <Step
          number={1}
          title="Reprenez le contrôle"
          highlight="de tous les appels générés par vos annonces VO."
          intro="Chaque appel entrant s'affiche immédiatement dans l'application et vous visualisez en temps réel :"
          bullets={[
            { strong: "10 prospects urgents", rest: "à rappeler en priorité" },
            { strong: "47 appels manqués", rest: "non traités à rappeler" },
            { strong: "42 appels qualifiés", rest: "en cours" },
            { strong: "110 appels traités", rest: "avec statut RDV, ventes…" },
          ]}
          outro="Plus de « je rappelle après » — car dans votre métier, « après » veut souvent dire « trop tard »."
          imageSrc="/manuel/dashboard.png"
          imageAlt="Dashboard BoosterVO — flux d'appels en temps réel"
          imageWidth={715}
          imageHeight={1547}
          bgClass="bg-fond"
        />

        {/* Étape 2 — Slide 3 */}
        <Step
          number={2}
          title="Qualifiez en 20 secondes"
          highlight="chaque prospect rappelé."
          intro="Vous venez de raccrocher. L'application vous propose immédiatement de qualifier le prospect :"
          bullets={[
            "Injoignable",
            "À recontacter",
            "RDV pris",
            "Vente conclue",
          ]}
          outro="Un tap, et la fiche est enregistrée. Votre pipeline commercial se construit tout seul — chaque qualification alimente automatiquement vos statistiques BoosterVO et votre CRM."
          imageSrc="/manuel/qualification.png"
          imageAlt="Fiche de qualification rapide d'un prospect"
          imageWidth={417}
          imageHeight={905}
          reverse
        />

        {/* Étape 3 — Slide 4 */}
        <Step
          number={3}
          title="Pilotez votre performance"
          highlight="en temps réel."
          intro="Visualisez votre tunnel commercial en 3 étapes : Appels reçus → Conversations → Ventes. Chaque canal affiche son taux de conversion."
          bullets={[
            { strong: "Décroché direct → vente :", rest: "35 %" },
            { strong: "Rappel après appel manqué → vente :", rest: "11 %" },
            { strong: "Taux de rappel des appels manqués :", rest: "79 %" },
            { strong: "Délai moyen de rappel :", rest: "43 min" },
          ]}
          outro="Le constat est simple : l'app mesure et vous optimisez. En décrochant immédiatement, vous convertissez 3× mieux qu'un rappel tardif."
          imageSrc="/manuel/stats-general.png"
          imageAlt="Statistiques générales — tunnel de conversion"
          imageWidth={310}
          imageHeight={854}
          bgClass="bg-fond"
        />

        {/* Étape 4 — Slide 5 */}
        <Step
          number={4}
          title="Rappelez plus vite"
          highlight="pour gagner plus de ventes."
          intro="Dans le VO, chaque minute compte. Plus vous rappelez vite, plus vos chances de vendre augmentent. 43 minutes — c'est souvent le temps qu'il faut pour laisser partir une vente."
          bullets={[
            {
              strong: "Sur 125 rappels,",
              rest: "seulement 50 prospects sont rappelés en moins de 5 minutes.",
            },
            {
              strong: "Un rappel en moins de 5 min",
              rest: "peut doubler vos chances de conversion.",
            },
            {
              strong: "Chaque minute perdue",
              rest: "vous coûte des ventes.",
            },
          ]}
          outro="Mesurer, optimiser, vendre plus."
          imageSrc="/manuel/stats-delai.png"
          imageAlt="Statistiques délai de rappel"
          imageWidth={312}
          imageHeight={854}
          reverse
        />

        {/* Étape 5 — Slide 6 */}
        <Step
          number={5}
          title="Ce que votre délai vous coûte vraiment."
          highlight="Vous voyez le manque à gagner."
          intro="La question que tout patron de négoce se pose — et que personne ne savait chiffrer. Si tous vos rappels avaient été faits en moins de 5 minutes, combien auriez-vous vendu en plus ? Combien de marge auriez-vous récupérée ?"
          bullets={[
            { strong: "Potentiel inexploité :", rest: "45 RDV → 56 · 28 ventes → 39" },
            { strong: "Manque à gagner calculé :", rest: "≈ 8 550 € sur la période" },
            {
              strong: "Entonnoir commercial visuel,",
              rest: "simulateur intégré, taux de conversion par tranche de délai.",
            },
          ]}
          outro="Réponse : un chiffre précis, en euros."
          imageSrc="/manuel/stats-impact.png"
          imageAlt="Statistiques impact financier — manque à gagner"
          imageWidth={315}
          imageHeight={871}
          bgClass="bg-fond"
        />

        {/* CTA FINAL — Slide 7 */}
        <section className="relative bg-gradient-to-br from-bleu via-bleu to-bleu-dark text-white py-20 sm:py-28 px-6 sm:px-10 lg:px-16 overflow-hidden">
          <div className="max-w-4xl mx-auto">
            <p className="text-orange font-bold text-xs sm:text-sm uppercase tracking-[0.3em] mb-6">
              Passons à l&apos;action
            </p>
            <h2 className="font-nunito font-extrabold text-4xl sm:text-6xl lg:text-7xl leading-[1.05] mb-8">
              Les 50 premiers
              <br />
              auront <span className="text-orange">10 ans d&apos;avance.</span>
            </h2>
            <p className="text-white/85 text-base sm:text-lg leading-relaxed max-w-2xl mb-10">
              Chaque jour de retard, c&apos;est une semaine de données en moins
              pour piloter votre activité, et des dizaines d&apos;appels manqués
              qui ne reviendront jamais. Réservez votre place bêta dès
              aujourd&apos;hui — <strong>10 jours gratuits, sans carte bancaire.</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/app/signup"
                className="inline-flex items-center justify-center bg-orange hover:bg-orange-dark text-white font-bold text-base sm:text-lg px-8 py-4 rounded-full transition-colors shadow-xl min-h-[52px]"
              >
                Oui, je veux tester l&apos;app mobile →
              </Link>
              <a
                href="/#audit"
                className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold text-base sm:text-lg px-8 py-4 rounded-full transition-colors min-h-[52px]"
              >
                Demander un audit gratuit
              </a>
            </div>
            <div className="border-t border-white/20 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="text-white/50 uppercase text-xs font-bold tracking-widest mb-1">
                  Site
                </p>
                <p className="text-white">boostervo.fr</p>
              </div>
              <div>
                <p className="text-white/50 uppercase text-xs font-bold tracking-widest mb-1">
                  Email
                </p>
                <a
                  href="mailto:contact@boostervo.fr"
                  className="text-white underline hover:text-orange transition-colors"
                >
                  contact@boostervo.fr
                </a>
              </div>
              <div>
                <p className="text-white/50 uppercase text-xs font-bold tracking-widest mb-1">
                  Éditeur
                </p>
                <p className="text-white">Mercure SAS</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
