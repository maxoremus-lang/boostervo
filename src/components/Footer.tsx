export default function Footer() {
  return (
    <footer className="bg-bleu-dark border-t-[3px] border-orange py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="BoosterVO"
          width={130}
          height={34}
          className="h-8 w-auto brightness-0 invert"
        />
        <p className="text-white/50 text-xs text-center sm:text-right">
          &copy; {new Date().getFullYear()} BoosterVO. Tous droits
          r&eacute;serv&eacute;s.
          <br />
          Mentions l&eacute;gales &middot; Politique de
          confidentialit&eacute;
        </p>
      </div>
    </footer>
  );
}
