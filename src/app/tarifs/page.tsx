import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./styles.module.css";

export const metadata: Metadata = {
  title: "BoosterVO — Nos tarifs",
  description:
    "Trois offres BoosterVO pour récupérer la marge perdue sur vos ventes VO : Pack Diagnostic, Abonnement Croissance, Abonnement Performance.",
};

type Feature = { label: string; bold?: boolean };
type Section = { heading: string; features: Feature[] };

type Plan = {
  id: string;
  name: string;
  tagline: string;
  price: string;
  priceUnit: string;
  priceNote?: string;
  ctaLabel: string;
  ctaHref: string;
  includes?: string;
  sections: Section[];
  excluded?: string[];
  footer?: string;
  highlight?: boolean;
};

const plans: Plan[] = [
  {
    id: "diagnostic",
    name: "Pack Diagnostic",
    tagline: "Mesurez la marge perdue sur vos appels manqués",
    price: "297 €",
    priceUnit: "HT, paiement unique",
    priceNote: "Étude sur 2 × 15 jours",
    ctaLabel: "Commander mon diagnostic",
    ctaHref: "https://wa.me/33612345678?text=Bonjour,%20je%20veux%20commander%20le%20Pack%20Diagnostic",
    sections: [
      {
        heading: "Phase 1 — Fonctionnement normal",
        features: [
          { label: "Suivi de 100% de vos appels entrants" },
          { label: "Identification des appels manqués" },
          { label: "Suivi des rappels et des délais de rappels" },
          { label: "Mesure du taux de conversion rappels → RDV / ventes" },
        ],
      },
      {
        heading: "Phase 2 — Décroché immédiat BoosterVO",
        features: [
          { label: "Un agent BoosterVO décroche 100% des appels" },
          { label: "Qualification du prospect en direct" },
          { label: "Prise de RDV ou transfert immédiat" },
          { label: "Mesure du taux de conversion décrochés immédiats → RDV / ventes" },
        ],
      },
      {
        heading: "Bilan & recommandations",
        features: [
          { label: "Taux de conversion rappels vs décrochés immédiats" },
          { label: "Estimation de la marge récupérable / mois" },
          { label: "Recommandation offre zéro appel manqué" },
          { label: "Rapport PDF personnalisé + échange de 30 min" },
        ],
      },
    ],
    excluded: ["Service récurrent", "Automatisation admin", "CRM"],
    footer: "La preuve chiffrée avant de vous engager.",
  },
  {
    id: "croissance",
    name: "Abonnement Croissance",
    tagline: "Agent IA + agent humain dédié",
    price: "397 €",
    priceUnit: "HT / mois",
    priceNote: "Sans engagement",
    ctaLabel: "Démarrer Croissance",
    ctaHref: "https://wa.me/33612345678?text=Bonjour,%20je%20veux%20démarrer%20l'abonnement%20Croissance",
    highlight: true,
    sections: [
      {
        heading: "Zéro appel manqué",
        features: [
          { label: "Réception des appels 24h/24, 7j/7" },
          { label: "Script personnalisé à votre enseigne" },
          { label: "Agent IA qui parle au nom de votre concession" },
          { label: "Jusqu'à 10 appels simultanés sur 1 numéro dédié" },
          { label: "Bascule vers un agent humain si nécessaire" },
        ],
      },
      {
        heading: "Qualification automatique des prospects",
        features: [
          { label: "Qualification complète (besoin, budget, délai)" },
          { label: "Accès instantané à votre stock et à vos prix" },
          { label: "Réponses immédiates aux questions courantes" },
          { label: "Historique client automatique" },
        ],
      },
      {
        heading: "Prise de RDV & gestion documents",
        features: [
          { label: "Prise de RDV automatisée dans votre agenda" },
          { label: "Notifications SMS / Email" },
          { label: "Priorisation des prospects chauds" },
        ],
      },
      {
        heading: "Suivi des opportunités",
        features: [
          { label: "Relance automatique des prospects non conclus" },
          { label: "Analyse des échanges sans suite" },
          { label: "Réactivation des leads « perdus »" },
        ],
      },
    ],
    excluded: ["Automatisation admin (AutoCerfa)", "CRM intégré"],
    footer: "L'offre la plus choisie par les négociants VO.",
  },
  {
    id: "performance",
    name: "Abonnement Performance",
    tagline: "Solution complète avec CRM intégré",
    price: "497 €",
    priceUnit: "HT / mois",
    priceNote: "Sans engagement",
    ctaLabel: "Passer en Performance",
    ctaHref: "https://wa.me/33612345678?text=Bonjour,%20je%20veux%20démarrer%20l'abonnement%20Performance",
    includes: "Tout Croissance inclus",
    sections: [
      {
        heading: "+ Automatisation admin",
        features: [
          { label: "Génération automatique des documents", bold: true },
          { label: "Intégration AutoCerfa", bold: true },
          { label: "Suivi des démarches administratives", bold: true },
        ],
      },
      {
        heading: "+ CRM intégré",
        features: [
          { label: "Gestion centralisée des leads", bold: true },
          { label: "Tableau de bord & Analytics avancés", bold: true },
          { label: "Historique complet des interactions", bold: true },
          { label: "Relances automatisées multi-canaux", bold: true },
          { label: "Suivi multi-sites" },
        ],
      },
      {
        heading: "Support",
        features: [
          { label: "Support dédié prioritaire" },
          { label: "Audit ROI trimestriel inclus" },
        ],
      },
    ],
    footer: "ROI maximum : pilotez votre activité de A à Z.",
  },
];

export default function TarifsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.logo}>
          <Image src="/logo.svg" alt="BoosterVO" width={160} height={32} priority />
        </Link>
        <div className={styles.topbarMeta}>
          <span>Tarifs</span>
          <span>Sans engagement</span>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.eyebrow}>Nos offres</div>
        <h1 className={styles.h1}>
          Choisissez la formule qui <span className={styles.italic}>récupère</span> votre{" "}
          <span className={styles.underline}>marge perdue.</span>
        </h1>
        <p className={styles.lede}>
          Un agent dédié, assisté par l&apos;IA, qui ne rate aucun appel et gère votre administratif.
          Trois offres pour passer du diagnostic ponctuel à la solution complète.
        </p>
      </section>

      <section className={styles.plans}>
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`${styles.card} ${plan.highlight ? styles.cardHighlight : ""}`}
          >
            {plan.highlight && <div className={styles.ribbon}>Recommandé</div>}

            <header className={styles.cardHeader}>
              <h2 className={styles.cardName}>{plan.name}</h2>
              <p className={styles.cardTagline}>{plan.tagline}</p>
            </header>

            <div className={styles.priceBlock}>
              <div className={styles.priceRow}>
                <span className={styles.price}>{plan.price}</span>
                <span className={styles.priceUnit}>{plan.priceUnit}</span>
              </div>
              {plan.priceNote && <div className={styles.priceNote}>{plan.priceNote}</div>}
            </div>

            <a
              className={styles.cta}
              href={plan.ctaHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{plan.ctaLabel}</span>
              <span className={styles.ctaIcon}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1B4F9B"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </a>

            {plan.includes && (
              <div className={styles.includesBanner}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {plan.includes}
              </div>
            )}

            <div className={styles.sections}>
              {plan.sections.map((section) => (
                <div key={section.heading} className={styles.section}>
                  <h3 className={styles.sectionHeading}>{section.heading}</h3>
                  <ul className={styles.featureList}>
                    {section.features.map((feature) => (
                      <li
                        key={feature.label}
                        className={`${styles.feature} ${feature.bold ? styles.featureBold : ""}`}
                      >
                        <span className={styles.featureDash}>—</span>
                        <span>{feature.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {plan.excluded && plan.excluded.length > 0 && (
                <div className={styles.section}>
                  <h3 className={`${styles.sectionHeading} ${styles.sectionHeadingMuted}`}>
                    Non inclus
                  </h3>
                  <ul className={styles.featureList}>
                    {plan.excluded.map((label) => (
                      <li key={label} className={`${styles.feature} ${styles.featureExcluded}`}>
                        <span className={styles.featureCross}>×</span>
                        <span>{label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {plan.footer && <p className={styles.cardFooter}>{plan.footer}</p>}
          </article>
        ))}
      </section>

      <footer className={styles.pageFooter}>
        <p>
          Tarifs HT, hors taxes locales. Configuration en 48h, sans engagement, résiliation à tout
          moment.
        </p>
        <p className={styles.footerLinks}>
          <Link href="/cgv">CGV</Link>
          <span>·</span>
          <Link href="/mentions-legales">Mentions légales</Link>
          <span>·</span>
          <Link href="/confidentialite">Confidentialité</Link>
        </p>
      </footer>
    </div>
  );
}
