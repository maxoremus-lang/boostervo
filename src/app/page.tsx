import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Probleme from "@/components/Probleme";
import ChiffreChoc from "@/components/ChiffreChoc";
import LeboncoinAppels from "@/components/LeboncoinAppels";
import Solution from "@/components/Solution";
import Resultats from "@/components/Resultats";
import Pourquoi from "@/components/Pourquoi";
import Offre from "@/components/Offre";
import PreuveSociale from "@/components/PreuveSociale";
import CTAFinal from "@/components/CTAFinal";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Probleme />
        <ChiffreChoc />
        <LeboncoinAppels />
        <Solution />
        <Resultats />
        <Pourquoi />
        <Offre />
        <PreuveSociale />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
