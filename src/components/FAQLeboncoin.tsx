"use client";
import { useState } from "react";

const faqItems = [
  {
    question: "Leboncoin me donne déjà des statistiques, qu'est-ce qui manque ?",
    answer: "Leboncoin vous montre les appels. Pas ce qu'ils deviennent.",
  },
  {
    question: "Puis-je savoir avec Leboncoin si mes appels génèrent des ventes ?",
    answer: "Non. Vous voyez l'appel… pas le résultat.",
  },
  {
    question: "Je rappelle mes appels manqués, quel est le problème ?",
    answer: "La vraie question est : combien, à quelle vitesse… et avec quel résultat ?",
  },
  {
    question: "Leboncoin permet-il de mesurer mes pertes ?",
    answer: "Non. Il mesure l'activité. Pas l'argent que vous perdez.",
  },
];

export default function FAQLeboncoin() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-gray-50 py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Titre */}
        <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl md:text-4xl text-bleu text-center leading-tight mb-12">
          FAQ – Leboncoin suffit-il vraiment ?
        </h2>

        {/* Accordéon */}
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <span className="font-nunito font-bold text-lg sm:text-xl text-bleu pr-4">
                  {item.question}
                </span>
                <span
                  className={`text-orange text-2xl font-bold flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="px-6 pb-5 text-gray-600 text-lg leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Punchline de conclusion */}
        <p className="text-center font-nunito font-extrabold text-lg sm:text-xl md:text-2xl mt-12">
          <span className="text-bleu">Leboncoin vous montre ce qui sonne.</span><br />
          <span className="text-orange italic">BoosterVO vous montre ce que ça rapporte.</span>
        </p>
      </div>
    </section>
  );
}
