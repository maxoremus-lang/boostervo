"use client";
import { useState } from "react";

const faqItems = [
  {
    question: "Je rappelle déjà tous les appels manqués, pourquoi faire l'audit ?",
    answer: [
      "Aujourd'hui, vous avez des appels manqués… et vous les rappelez, c'est une excellente démarche.",
      "Maintenant, avez-vous une vision précise de l'efficacité de ces rappels ? Combien d'appels sont réellement rappelés, à quel moment, sous quel délai, et avec quel impact sur vos ventes ?",
      "Selon les analyses réalisées par BoosterVO :\n• Appel décroché immédiatement : 20% à 40% des contacts peuvent mener à un RDV ou une vente\n• Rappel rapide (< 10 min) : 10% à 20%\n• Rappel tardif (> 30 min) : 2% à 10%",
      "Autrement dit, plus le délai de rappel augmente, plus la probabilité de conversion s'effondre.",
    ],
  },
  {
    question: "Pourquoi c'est gratuit ?",
    answer: [
      "Parce qu'avant de parler solution, il faut déjà savoir s'il y a un problème — et qu'on ne peut pas corriger ce que l'on ne mesure pas.",
      "Parce qu'il est essentiel que vous sachiez si une fuite de marge invisible impacte la rentabilité de vos annonces Leboncoin… sans même que vous le voyiez.",
      "L'Audit BVO fonctionne exactement comme un bilan de santé : il permet de détecter un problème avant qu'il ne devienne critique. Ensuite, libre à vous de décider quoi faire des résultats.",
    ],
  },
  {
    question: "Est-ce que ça va changer ma façon de travailler ?",
    answer: [
      "Non, absolument pas. Vos annonces restent identiques, votre téléphone (fixe ou mobile) continue de sonner normalement.",
      "C'est complètement transparent pour vous comme pour les prospects qui cherchent à vous joindre.",
      "La seule différence : vous voyez enfin ce qui se passe réellement sur vos appels.",
    ],
  },
  {
    question: "Est-ce que je peux perdre des appels pendant la période de tracking ?",
    answer: [
      "Non. À chaque appel sur le numéro de tracking, votre téléphone sonne instantanément, exactement comme aujourd'hui.",
      "Le tracking est totalement transparent : il ne bloque rien, ne ralentit rien et n'interfère pas avec votre activité.",
    ],
  },
  {
    question: "Pourquoi 15 jours de tracking ?",
    answer: [
      "Parce que 15 jours suffisent pour obtenir une vision fiable et exploitable de votre flux d'appels.",
      "Cette période permet d'analyser vos données et de les projeter sur un mois complet afin d'identifier précisément :\n• Ce que vous perdez\n• À quel moment vous le perdez\n• Combien vous pourriez récupérer",
      "L'Audit BVO permet justement de mesurer ces éléments pour identifier ce que vous pouvez améliorer… et récupérer.",
    ],
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
          Questions-réponses sur l&apos;audit BoosterVO
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
                  openIndex === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-5 text-gray-600 text-lg leading-relaxed space-y-3">
                  {item.answer.map((paragraph, i) => (
                    <p key={i} className="whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>
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
