// En-tête de navigation bleu identique à la page d'accueil (boostervo.fr).
// Logo à gauche, liens à droite. Réutilisé sur les pages VSL (/vsl, /vsl-prive)
// et toute page hors mockup.html qui doit afficher le même menu.
export default function SiteNav() {
  return (
    <div className="sticky top-0 z-50 bg-bleu shadow-[0_4px_20px_rgba(7,18,37,0.18)]">
      <header className="max-w-[1100px] mx-auto flex items-center justify-between px-5 sm:px-10 py-4">
        <a href="/" aria-label="Accueil BoosterVO" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-white.svg"
            alt="BoosterVO"
            width={150}
            height={28}
            className="h-7 w-auto block"
          />
        </a>
        <nav className="hidden sm:flex items-center gap-8 lg:gap-11 font-semibold text-[15px]">
          <a href="/" className="text-white/85 hover:text-orange transition-colors">
            Accueil
          </a>
          <a href="/#diagnostic" className="text-white/85 hover:text-orange transition-colors">
            Le diagnostic BoosterVO
          </a>
          <a href="/#faq" className="text-white/85 hover:text-orange transition-colors">
            FAQ
          </a>
          <a href="/tarifs" className="text-white/85 hover:text-orange transition-colors">
            Tarifs
          </a>
          <a href="/programme-gold.html" className="text-white/85 hover:text-orange transition-colors">
            Programme Gold
          </a>
        </nav>
      </header>
    </div>
  );
}
