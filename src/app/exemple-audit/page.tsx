import type { Metadata } from "next";
import Image from "next/image";
import styles from "./styles.module.css";

export const metadata: Metadata = {
  title: "BoosterVO — Exemple d'audit VO",
  description:
    "Découvrez un rapport d'audit complet réalisé pour un négociant VO. Mesurez le profit caché derrière vos appels manqués.",
};

export default function ExempleAudit() {
  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.logo}>
          <Image src="/logo.svg" alt="BoosterVO" width={160} height={32} priority />
        </div>
        <div className={styles.topbarMeta}>
          <span>Call Tracking VO</span>
          <span>Audit 15 jours offert</span>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.eyebrow}>Exemple d&apos;audit r&eacute;el</div>
          <h1 className={styles.h1}>
            Mesurez le
            <br />
            <span className={styles.italic}>profit cach&eacute;</span>
            <br />
            derri&egrave;re <span className={styles.underline}>vos appels.</span>
          </h1>
          <p className={styles.lede}>
            D&eacute;couvrez un <strong>rapport d&apos;audit complet</strong> r&eacute;alis&eacute; pour
            un n&eacute;gociant VO qui, comme vous, publie des annonces sur Lbc.
          </p>
          <a
            className={styles.cta}
            href="https://wa.me/33612345678?text=Bonjour,%20je%20veux%20voir%20un%20exemple%20d'audit"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>
              <span className={styles.ctaSub}>Sur WhatsApp</span>
              Recevoir l&apos;exemple d&apos;audit
            </span>
            <span className={styles.ctaIcon}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1B4F9B"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </a>
          <span className={styles.ctaNote}>
            R&eacute;ponse sous quelques minutes — aucun engagement
          </span>
        </div>

        <div className={styles.heroRight}>
          <div className={`${styles.auditCard} ${styles.cardMain}`}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardLabel}>Rapport d&apos;audit &middot; Extrait</div>
                <div className={styles.cardTitle}>Garage Martin VO — 14 jours</div>
              </div>
              <div className={styles.cardBadge}>Confidentiel</div>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Appels entrants Lbc</span>
              <span className={styles.metricValue}>247</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Appels manqu&eacute;s</span>
              <span className={`${styles.metricValue} ${styles.accent}`}>86</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Taux d&apos;appels manqu&eacute;s</span>
              <span className={styles.metricValue}>35 %</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Marge perdue estim&eacute;e</span>
              <span className={`${styles.metricValue} ${styles.accent}`}>12 450 &euro;</span>
            </div>
            <div className={styles.barTrack}>
              <div className={styles.barFill}></div>
            </div>
            <p className={styles.cardFooter}>
              &laquo; Je ne pensais pas rater autant d&apos;opportunit&eacute;s&hellip; &raquo;
            </p>
          </div>

          <div className={`${styles.auditCard} ${styles.cardAlert}`}>
            <div className={styles.alertNum}>+8 800 &euro;</div>
            <div className={styles.alertText}>
              de marge nette r&eacute;cup&eacute;rable/mois (prestation &laquo; Z&eacute;ro appel
              manqu&eacute; &raquo; d&eacute;j&agrave; pay&eacute;e), identifi&eacute;e gr&acirc;ce
              &agrave; l&apos;audit.
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footerStrip}>
        <div>&copy; BoosterVO — Mercure SAS</div>
        <div className={styles.trust}>
          <span>Confidentiel</span>
          <span>RGPD</span>
          <span>100 % gratuit</span>
        </div>
      </footer>
    </div>
  );
}
