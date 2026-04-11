export default function Footer() {
  return (
    <footer className="bg-bleu-dark border-t-[3px] border-orange py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-white.svg"
          alt="BoosterVO"
          width={91}
          height={24}
          className="h-[22px] w-auto"
        />
        <p className="text-white/50 text-xs text-center sm:text-right">
          &copy; {new Date().getFullYear()} BoosterVO. Tous droits
          r&eacute;serv&eacute;s.
          <br />
          Marque exploit&eacute;e par <strong className="text-white/70">MERCURE SAS</strong>,
          <br />
          SAS au capital de 2&nbsp;000&nbsp;&euro; &ndash; Paris B&nbsp;941519613
          <br />
          Si&egrave;ge social&nbsp;: 60 rue Fran&ccedil;ois 1<sup>er</sup>, 75008 Paris.
          <br />
          <a href="/cgv" className="hover:text-white underline">CGV</a> &middot; <a href="/mentions-legales" className="hover:text-white underline">Mentions l&eacute;gales</a> &middot; <a href="/confidentialite" className="hover:text-white underline">Politique de
          confidentialit&eacute;</a>
        </p>
      </div>
    </footer>
  );
}
