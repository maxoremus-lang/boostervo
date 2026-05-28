import type { Metadata } from "next";
import VslGate from "./VslGate";

export const metadata: Metadata = {
  title: "BoosterVO — Accédez à la vidéo",
  description:
    "Indiquez votre prénom et votre email pour accéder à la vidéo : le profit caché derrière vos appels manqués sur vos ventes VO.",
};

export default function VslPrivePage() {
  return <VslGate />;
}
