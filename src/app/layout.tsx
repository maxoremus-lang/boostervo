import type { Metadata } from "next";
import { Nunito, Open_Sans } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-opensans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BoosterVO — Récupérez la marge perdue sur vos ventes VO",
  description:
    "BoosterVO identifie les appels manqués et les opportunités perdues sur vos annonces Leboncoin. Récupérez entre 1 500 € et 3 000 € de marge par mois.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${nunito.variable} ${openSans.variable}`}>
      <body className="font-opensans antialiased">{children}</body>
    </html>
  );
}
