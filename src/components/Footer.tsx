export default function Footer() {
  return (
    <footer className="bg-bleu-dark border-t-[3px] border-orange py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-white.svg"
          alt="BoosterVO"
          width={130}
          height={34}
          className="h-8 w-auto"
        />
        <p className="text-white/50 text-xs text-center sm:text-right">
          &copy; {new Date().getFullYear()} BoosterVO. Tous droits
          r&eacute;serv&eacute;s.
          <br />
          <a href="/cgv" className="hover:text-white underline">CGV</a> &middot; <a href="/mentions-legales" className="hover:text-white underline">Mentions l&eacute;gales</a> &middot; <a href="/confidentialite" className="hover:text-white underline">Politique de
          confidentialit&eacute;</a>
        </p>
      </div>
    </footer>
  );
}
