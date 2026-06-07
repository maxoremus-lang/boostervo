import type { Metadata } from "next";
import Footer from "@/components/Footer";
import styles from "./styles.module.css";
import DiagnosticCardCta from "./DiagnosticCardCta";

export const metadata: Metadata = {
  title: "BoosterVO — Nos tarifs",
  description:
    "Trois offres BoosterVO pour récupérer la marge perdue sur vos ventes VO : Pack Diagnostic, Call Agent Croissance, Call Agent Performance.",
};

type Feature = { label: string; bold?: boolean; href?: string };
type Section = { heading: string; features: Feature[] };

type Plan = {
  id: string;
  name: string;
  tagline: string;
  price: string;
  priceUnit: string;
  priceNote?: string;
  ctaLabel: string;
  ctaSource: string;
  ctaModalTitle?: string;
  ctaModalSubtitle?: string;
  includes?: string;
  sections: Section[];
  excluded?: string[];
  footer?: string;
  highlight?: boolean;
  guarantee?: boolean;
};

const plans: Plan[] = [
  {
    id: "diagnostic",
    name: "Pack Diagnostic",
    tagline: "Mesurez la marge perdue sur vos appels manqués",
    price: "197 €",
    priceUnit: "HT, paiement unique",
    priceNote: "Étude sur 2 × 15 jours",
    ctaLabel: "Découvrir le pack diagnostic",
    ctaSource: "tarifs-diagnostic",
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
          { label: "Comparatif des taux de conversion rappels vs décrochés immédiats" },
          { label: "Estimation de la marge récupérable / mois" },
          { label: "Recommandation offre Call Agent" },
          { label: "Rapport PDF personnalisé + échange de 30 min" },
          { label: "Cliquez ici pour télécharger un exemplaire de rapport", href: "/exemple-rapport.pdf" },
        ],
      },
    ],
    footer: "La preuve chiffrée avant de vous engager.",
    guarantee: true,
  },
  {
    id: "croissance",
    name: "Call Agent Croissance",
    tagline: "Agent humain dédié assisté par l'IA",
    price: "397 €",
    priceUnit: "HT / mois",
    priceNote: "Sans engagement",
    ctaLabel: "Démarrer Croissance",
    ctaSource: "tarifs-croissance",
    ctaModalTitle: "Démarrer Call Agent Croissance",
    ctaModalSubtitle: "Échange gratuit et sans engagement en 20 minutes.",
    highlight: true,
    sections: [
      {
        heading: "Zéro appel manqué",
        features: [
          { label: "Réception des appels 24h/24 – 7j/7" },
          { label: "100 % d'appels décrochés immédiatement" },
          { label: "Agent humain dédié" },
          { label: "Script personnalisé à votre enseigne" },
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
    name: "Call Agent Performance",
    tagline: "Solution complète avec CRM intégré",
    price: "497 €",
    priceUnit: "HT / mois",
    priceNote: "Sans engagement",
    ctaLabel: "Passer en Performance",
    ctaSource: "tarifs-performance",
    ctaModalTitle: "Passer en Call Agent Performance",
    ctaModalSubtitle: "Échange gratuit et sans engagement en 20 minutes.",
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
    <>
      <div className={styles.siteHeaderWrap}>
        <header className={styles.siteHeader}>
          <a href="/" aria-label="Accueil BoosterVO" className={styles.logoLink}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-white.svg" alt="BoosterVO" width={150} height={28} className={styles.logoMark} />
          </a>
          <nav className={styles.nav}>
            <a href="/" className={styles.navLink}>Accueil</a>
            <a href="/#diagnostic" className={styles.navLink}>Le diagnostic BoosterVO</a>
            <a href="/#faq" className={styles.navLink}>FAQ</a>
            <a href="/tarifs" className={styles.navLink}>Tarifs</a>
            <a href="/programme-gold.html" className={styles.navLink}>Programme Gold</a>
          </nav>
        </header>
      </div>
      <div className={styles.page}>
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

            {plan.guarantee && (
              <div className={styles.guaranteeBadge} aria-hidden="true">
                <svg viewBox="0 0 120 120" width="100%" height="100%">
                  <defs>
                    <path
                      id={`top-arc-${plan.id}`}
                      d="M 60,60 m -42,0 a 42,42 0 0 1 84,0"
                    />
                    <path
                      id={`bot-arc-${plan.id}`}
                      d="M 60,60 m -42,0 a 42,42 0 1 0 84,0"
                    />
                  </defs>
                  {/* rayons décoratifs */}
                  <g stroke="#FF6600" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="60" y1="4" x2="60" y2="12" />
                    <line x1="60" y1="108" x2="60" y2="116" />
                    <line x1="4" y1="60" x2="12" y2="60" />
                    <line x1="108" y1="60" x2="116" y2="60" />
                    <line x1="20" y1="20" x2="26" y2="26" />
                    <line x1="100" y1="20" x2="94" y2="26" />
                    <line x1="20" y1="100" x2="26" y2="94" />
                    <line x1="100" y1="100" x2="94" y2="94" />
                  </g>
                  {/* disque crénelé orange */}
                  <circle cx="60" cy="60" r="45" fill="#FF6600" />
                  {/* anneau intérieur clair */}
                  <circle cx="60" cy="60" r="38" fill="#FFF7F0" />
                  {/* texte courbé */}
                  <text fill="#FF6600" fontSize="9" fontWeight="800" letterSpacing="1.5">
                    <textPath href={`#top-arc-${plan.id}`} startOffset="50%" textAnchor="middle">
                      SATISFAIT
                    </textPath>
                  </text>
                  <text fill="#FF6600" fontSize="9" fontWeight="800" letterSpacing="1.5">
                    <textPath href={`#bot-arc-${plan.id}`} startOffset="50%" textAnchor="middle">
                      OU REMBOURSÉ
                    </textPath>
                  </text>
                  {/* bandeau central */}
                  <rect x="14" y="51" width="92" height="18" fill="#0B2D6E" />
                  <polygon points="14,51 8,57 14,63" fill="#06204D" />
                  <polygon points="106,51 112,57 106,63" fill="#06204D" />
                  <text
                    x="60"
                    y="64"
                    fill="#ffffff"
                    fontSize="13"
                    fontWeight="900"
                    textAnchor="middle"
                  >
                    100%
                  </text>
                </svg>
              </div>
            )}

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

            <DiagnosticCardCta
              label={plan.ctaLabel}
              source={plan.ctaSource}
              title={plan.ctaModalTitle}
              subtitle={plan.ctaModalSubtitle}
            />

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
                        {feature.href ? (
                          <a
                            href={feature.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.featureLink}
                          >
                            {feature.label}
                          </a>
                        ) : (
                          <span>{feature.label}</span>
                        )}
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
      </footer>
      </div>
      <Footer />
    </>
  );
}
