import Link from "next/link";

export const metadata = {
  title: "Politique de confidentialit\u00e9 - BoosterVO",
  description: "D\u00e9claration de confidentialit\u00e9 BoosterVO - MERCURE SAS",
};

export default function Confidentialite() {
  return (
    <main className="bg-white min-h-screen py-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="text-bleu-brand hover:underline text-sm mb-8 inline-block"
        >
          &larr; Retour &agrave; l&apos;accueil
        </Link>

        <h1 className="text-3xl font-bold text-bleu-dark mb-2 text-center">
          POLITIQUE DE CONFIDENTIALIT&Eacute;
        </h1>
        <h2 className="text-xl font-bold text-bleu-dark mb-10 text-center">
          D&Eacute;CLARATION DE CONFIDENTIALIT&Eacute; <span className="font-extrabold">BOOSTERVO</span>
        </h2>

        <p className="text-gray-700 leading-relaxed mb-4">
          <span className="font-bold">BoosterVO</span> est une marque exploit&eacute;e par la soci&eacute;t&eacute; MERCURE SAS, Soci&eacute;t&eacute; par Actions Simplifi&eacute;e au capital de 2&nbsp;000 euros, immatricul&eacute;e au Registre du Commerce et des Soci&eacute;t&eacute;s de Paris sous le num&eacute;ro B 941 519 613, dont le si&egrave;ge social est situ&eacute; 60 rue Fran&ccedil;ois 1er, 75008 Paris.
        </p>

        {/* Article 1 */}
        <h3 className="text-lg font-bold text-bleu-dark mt-8 mb-3">
          ARTICLE 1 &ndash; RENSEIGNEMENTS PERSONNELS RECUEILLIS
        </h3>
        <p className="text-gray-700 leading-relaxed mb-3">
          Lorsque vous effectuez un achat sur notre boutique ou dans le cadre de notre processus d&rsquo;achat et de vente, nous recueillons les renseignements personnels que vous nous fournissez, tels que votre nom, votre adresse et votre adresse e-mail.
        </p>
        <p className="text-gray-700 leading-relaxed mb-3">
          Lorsque vous naviguez sur notre boutique, nous recevons &eacute;galement automatiquement l&rsquo;adresse de protocole Internet (adresse IP) de votre ordinateur, qui nous permet d&rsquo;obtenir plus de d&eacute;tails au sujet du navigateur et du syst&egrave;me d&rsquo;exploitation que vous utilisez.
        </p>
        <p className="text-gray-700 leading-relaxed mb-3">
          Marketing par e-mail (le cas &eacute;ch&eacute;ant) : Avec votre permission, nous pourrions vous envoyer des e-mails au sujet de notre boutique, de nouveaux produits et d&rsquo;autres mises &agrave; jour.
        </p>

        {/* Article 2 */}
        <h3 className="text-lg font-bold text-bleu-dark mt-8 mb-3">
          ARTICLE 2 &ndash; CONSENTEMENT
        </h3>
        <p className="text-gray-700 leading-relaxed mb-3 font-semibold">
          Comment obtenez-vous mon consentement ?
        </p>
        <p className="text-gray-700 leading-relaxed mb-3">
          Lorsque vous nous fournissez vos renseignements personnels pour conclure une transaction, v&eacute;rifier votre carte de cr&eacute;dit, passer une commande, planifier une livraison ou retourner un achat, nous pr&eacute;sumons que vous consentez &agrave; ce que nous recueillons vos renseignements et &agrave; ce que nous les utilisions &agrave; cette fin uniquement.
        </p>
        <p className="text-gray-700 leading-relaxed mb-3">
          Si nous vous demandons de nous fournir vos renseignements personnels pour une autre raison, &agrave; des fins de marketing par exemple, nous vous demanderons directement votre consentement explicite, ou nous vous donnerons la possibilit&eacute; de refuser.
        </p>
        <p className="text-gray-700 leading-relaxed mb-3 font-semibold">
          Comment puis-je retirer mon consentement ?
        </p>
        <p className="text-gray-700 leading-relaxed mb-3">
          Si apr&egrave;s nous avoir donn&eacute; votre consentement, vous changez d&rsquo;avis et ne consentez plus &agrave; ce que nous puissions vous contacter, recueillir vos renseignements ou les divulguer, vous pouvez nous en aviser en nous contactant &agrave; : contact@mercure-sas.com ou par courrier &agrave; :
        </p>
        <p className="text-gray-700 leading-relaxed mb-3">
          MERCURE SAS (Propri&eacute;taire de la marque <span className="font-bold">BoosterVO</span>)<br />
          60 rue Fran&ccedil;ois 1er<br />
          75008 PARIS
        </p>

        {/* Article 3 */}
        <h3 className="text-lg font-bold text-bleu-dark mt-8 mb-3">
          ARTICLE 3 &ndash; DIVULGATION
        </h3>
        <p className="text-gray-700 leading-relaxed mb-3">
          Nous pouvons divulguer vos renseignements personnels si la loi nous oblige &agrave; le faire ou si vous violez nos Conditions G&eacute;n&eacute;rales de Vente et d&rsquo;Utilisation.
        </p>

        {/* Article 4 */}
        <h3 className="text-lg font-bold text-bleu-dark mt-8 mb-3">
          ARTICLE 4 &ndash; H&Eacute;BERGEMENT
        </h3>
        <p className="text-gray-700 leading-relaxed mb-3">
          Notre site est h&eacute;berg&eacute; sur un serveur VPS s&eacute;curis&eacute;. Vos donn&eacute;es sont stock&eacute;es dans des syst&egrave;mes de stockage de donn&eacute;es s&eacute;curis&eacute;s. Vos donn&eacute;es sont conserv&eacute;es sur un serveur s&eacute;curis&eacute; prot&eacute;g&eacute; par un pare-feu.
        </p>
        <p className="text-gray-700 leading-relaxed mb-3 font-semibold">
          Paiement :
        </p>
        <p className="text-gray-700 leading-relaxed mb-3">
          Si vous r&eacute;alisez votre achat par le biais d&rsquo;une passerelle de paiement direct, vos renseignements de carte de cr&eacute;dit sont chiffr&eacute;s conform&eacute;ment &agrave; la norme de s&eacute;curit&eacute; des donn&eacute;es &eacute;tablie par l&rsquo;industrie des cartes de paiement (norme PCI-DSS). Les renseignements relatifs &agrave; votre transaction d&rsquo;achat sont conserv&eacute;s aussi longtemps que n&eacute;cessaire pour finaliser votre commande. Une fois votre commande finalis&eacute;e, les renseignements relatifs &agrave; la transaction d&rsquo;achat sont supprim&eacute;s.
        </p>
        <p className="text-gray-700 leading-relaxed mb-3">
          Toutes les passerelles de paiement direct respectent la norme PCI-DSS, g&eacute;r&eacute;e par le conseil des normes de s&eacute;curit&eacute; PCI, qui r&eacute;sulte de l&rsquo;effort conjoint d&rsquo;entreprises telles que Visa, MasterCard, American Express et Discover.
        </p>
        <p className="text-gray-700 leading-relaxed mb-3">
          Les exigences de la norme PCI-DSS permettent d&rsquo;assurer le traitement s&eacute;curis&eacute; des donn&eacute;es de cartes de cr&eacute;dit par notre boutique et par ses prestataires de services.
        </p>

        {/* Article 5 */}
        <h3 className="text-lg font-bold text-bleu-dark mt-8 mb-3">
          ARTICLE 5 &ndash; SERVICES FOURNIS PAR DES TIERS
        </h3>
        <p className="text-gray-700 leading-relaxed mb-3">
          De mani&egrave;re g&eacute;n&eacute;rale, les fournisseurs tiers que nous utilisons vont uniquement recueillir, utiliser et divulguer vos renseignements dans la mesure du n&eacute;cessaire pour pouvoir r&eacute;aliser les services qu&rsquo;ils nous fournissent.
        </p>
        <p className="text-gray-700 leading-relaxed mb-3">
          Cependant, certains tiers fournisseurs de services, comme les passerelles de paiement et autres processeurs de transactions de paiement, poss&egrave;dent leurs propres politiques de confidentialit&eacute; quant aux renseignements que nous sommes tenus de leur fournir pour vos transactions d&rsquo;achat.
        </p>
        <p className="text-gray-700 leading-relaxed mb-3">
          En ce qui concerne ces fournisseurs, nous vous recommandons de lire attentivement leurs politiques de confidentialit&eacute; pour que vous puissiez comprendre la mani&egrave;re dont ils traiteront vos renseignements personnels.
        </p>
        <p className="text-gray-700 leading-relaxed mb-3">
          Une fois que vous quittez le site de notre boutique ou que vous &ecirc;tes redirig&eacute; vers le site web ou l&rsquo;application d&rsquo;un tiers, vous n&rsquo;&ecirc;tes plus r&eacute;gi par la pr&eacute;sente Politique de Confidentialit&eacute; ni par les Conditions G&eacute;n&eacute;rales de Vente et d&rsquo;Utilisation de notre site web.
        </p>
        <p className="text-gray-700 leading-relaxed mb-3 font-semibold">
          Liens
        </p>
        <p className="text-gray-700 leading-relaxed mb-3">
          Vous pourriez &ecirc;tre amen&eacute; &agrave; quitter notre site web en cliquant sur certains liens pr&eacute;sents sur notre site. Nous n&rsquo;assumons aucune responsabilit&eacute; quant aux pratiques de confidentialit&eacute; exerc&eacute;es par ces autres sites et vous recommandons de lire attentivement leurs politiques de confidentialit&eacute;.
        </p>

        {/* Article 6 */}
        <h3 className="text-lg font-bold text-bleu-dark mt-8 mb-3">
          ARTICLE 6 &ndash; S&Eacute;CURIT&Eacute;
        </h3>
        <p className="text-gray-700 leading-relaxed mb-3">
          Pour prot&eacute;ger vos donn&eacute;es personnelles, nous prenons des pr&eacute;cautions raisonnables et suivons les meilleures pratiques de l&rsquo;industrie pour nous assurer qu&rsquo;elles ne soient pas perdues, d&eacute;tourn&eacute;es, consult&eacute;es, divulgu&eacute;es, modifi&eacute;es ou d&eacute;truites de mani&egrave;re inappropri&eacute;e.
        </p>
        <p className="text-gray-700 leading-relaxed mb-3">
          Si vous nous fournissez vos informations de carte de cr&eacute;dit, elles seront chiffr&eacute;es par le biais de l&rsquo;utilisation du protocole de s&eacute;curisation SSL et conserv&eacute;es avec un chiffrement de type AES-256. Bien qu&rsquo;aucune m&eacute;thode de transmission sur Internet ou de stockage &eacute;lectronique ne soit s&ucirc;re &agrave; 100&nbsp;%, nous suivons toutes les exigences de la norme PCI-DSS et mettons en &oelig;uvre des normes suppl&eacute;mentaires g&eacute;n&eacute;ralement reconnues par l&rsquo;industrie.
        </p>

        {/* Section 7 */}
        <h3 className="text-lg font-bold text-bleu-dark mt-8 mb-3">
          SECTION 7 &ndash; TYPES DE DONN&Eacute;ES COLLECT&Eacute;ES &ndash; DONN&Eacute;ES PERSONNELLES
        </h3>
        <p className="text-gray-700 leading-relaxed mb-3">
          En utilisant notre service, nous pouvons vous demander de nous fournir certaines informations personnellement identifiables qui peuvent &ecirc;tre utilis&eacute;es pour vous contacter ou vous identifier (&laquo;&nbsp;Donn&eacute;es personnelles&nbsp;&raquo;). Les informations personnellement identifiables peuvent inclure, mais sans s&rsquo;y limiter :
        </p>
        <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-3 space-y-1">
          <li>Adresse e-mail</li>
          <li>Adresse</li>
          <li>Pr&eacute;nom et nom</li>
          <li>Cookies et donn&eacute;es d&rsquo;utilisation</li>
        </ul>
        <p className="text-gray-700 leading-relaxed mb-3">
          Nous pouvons utiliser vos donn&eacute;es personnelles pour vous contacter avec des bulletins d&rsquo;information, du mat&eacute;riel de marketing ou de promotion et d&rsquo;autres informations susceptibles de vous int&eacute;resser. Vous pouvez choisir de ne recevoir aucune de ces communications, ou la totalit&eacute; de celles-ci, en suivant le lien de d&eacute;sabonnement ou les instructions fournies dans les courriels que nous envoyons.
        </p>

        <h4 className="text-md font-bold text-bleu-dark mt-6 mb-2">
          DONN&Eacute;ES D&rsquo;UTILISATION
        </h4>
        <p className="text-gray-700 leading-relaxed mb-3">
          Nous pouvons &eacute;galement recueillir des informations sur la mani&egrave;re dont le service est consult&eacute; et utilis&eacute; (&laquo;&nbsp;Donn&eacute;es d&rsquo;utilisation&nbsp;&raquo;). Ces donn&eacute;es d&rsquo;utilisation peuvent inclure des informations telles que l&rsquo;adresse de protocole Internet de votre ordinateur, le type de navigateur, la version du navigateur, les pages de notre service que vous visitez, l&rsquo;heure et la date de votre visite, le temps pass&eacute; sur ces pages, les identifiants uniques de p&eacute;riph&eacute;riques et d&rsquo;autres donn&eacute;es de diagnostic.
        </p>

        <h4 className="text-md font-bold text-bleu-dark mt-6 mb-2">
          SUIVI DES DONN&Eacute;ES DE COOKIES
        </h4>
        <p className="text-gray-700 leading-relaxed mb-3">
          Nous utilisons des cookies et des technologies de suivi similaires pour suivre l&rsquo;activit&eacute; et conserver certaines informations.
        </p>
        <p className="text-gray-700 leading-relaxed mb-3">
          Les cookies sont des fichiers avec une petite quantit&eacute; de donn&eacute;es pouvant inclure un identifiant unique anonyme. Les cookies sont envoy&eacute;s &agrave; votre navigateur &agrave; partir d&rsquo;un site Web et stock&eacute;s sur votre appareil.
        </p>
        <p className="text-gray-700 leading-relaxed mb-3">
          Vous pouvez demander &agrave; votre navigateur de refuser tous les cookies ou d&rsquo;indiquer quand un cookie est envoy&eacute;. Toutefois, si vous n&rsquo;acceptez pas les cookies, vous ne pourrez peut-&ecirc;tre pas utiliser toutes les fonctionnalit&eacute;s de notre service.
        </p>
        <p className="text-gray-700 leading-relaxed mb-3">
          Exemples de cookies que nous utilisons :
        </p>
        <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-3 space-y-1">
          <li>Cookies de session : pour faire fonctionner notre service.</li>
          <li>Cookies de pr&eacute;f&eacute;rence : pour m&eacute;moriser vos pr&eacute;f&eacute;rences et divers param&egrave;tres.</li>
          <li>Cookies de s&eacute;curit&eacute; : &agrave; des fins de s&eacute;curit&eacute;.</li>
        </ul>

        <h4 className="text-md font-bold text-bleu-dark mt-6 mb-2">
          UTILISATION DE DONN&Eacute;ES
        </h4>
        <p className="text-gray-700 leading-relaxed mb-3">
          Nous utilisons les donn&eacute;es collect&eacute;es &agrave; diverses fins :
        </p>
        <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-3 space-y-1">
          <li>Pour fournir et maintenir notre service</li>
          <li>Pour vous avertir des changements de notre service</li>
          <li>Pour fournir un soutien &agrave; la client&egrave;le</li>
          <li>Pour recueillir des analyses ou des informations pr&eacute;cieuses afin d&rsquo;am&eacute;liorer notre service</li>
          <li>Pour surveiller l&rsquo;utilisation de notre service</li>
          <li>Pour d&eacute;tecter, pr&eacute;venir et r&eacute;soudre les probl&egrave;mes techniques</li>
          <li>Pour vous fournir des nouvelles, des offres sp&eacute;ciales et des informations g&eacute;n&eacute;rales sur d&rsquo;autres biens, services et &eacute;v&eacute;nements similaires, sauf si vous avez choisi de ne pas recevoir ces informations</li>
        </ul>

        {/* Section 8 */}
        <h3 className="text-lg font-bold text-bleu-dark mt-8 mb-3">
          SECTION 8 &ndash; S&Eacute;CURIT&Eacute; DES DONN&Eacute;ES
        </h3>
        <p className="text-gray-700 leading-relaxed mb-3">
          La s&eacute;curit&eacute; de vos donn&eacute;es est importante pour nous, mais rappelez-vous qu&rsquo;aucune m&eacute;thode de transmission sur Internet, ou m&eacute;thode de stockage &eacute;lectronique n&rsquo;est s&eacute;curis&eacute;e &agrave; 100&nbsp;%. Bien que nous nous efforcions d&rsquo;utiliser des moyens commercialement acceptables pour prot&eacute;ger vos donn&eacute;es personnelles, nous ne pouvons pas garantir leur s&eacute;curit&eacute; absolue.
        </p>

        {/* Section 9 */}
        <h3 className="text-lg font-bold text-bleu-dark mt-8 mb-3">
          SECTION 9 &ndash; BASE JURIDIQUE DU TRAITEMENT DES DONN&Eacute;ES PERSONNELLES EN VERTU DU RGPD
        </h3>
        <p className="text-gray-700 leading-relaxed mb-3">
          Si vous &ecirc;tes membre de l&rsquo;Espace &eacute;conomique europ&eacute;en (EEE), notre base juridique pour la collecte et l&rsquo;utilisation des informations personnelles d&eacute;crites dans cette politique de confidentialit&eacute; d&eacute;pend des donn&eacute;es personnelles que nous collectons et du contexte sp&eacute;cifique dans lequel nous les collectons.
        </p>
        <p className="text-gray-700 leading-relaxed mb-3 font-semibold">
          Nous pouvons traiter vos donn&eacute;es personnelles parce que :
        </p>
        <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-3 space-y-1">
          <li>Nous devons effectuer un contrat avec vous ou exp&eacute;dier des produits achet&eacute;s &agrave; vous</li>
          <li>Vous nous avez donn&eacute; la permission de le faire</li>
          <li>Le traitement est dans nos int&eacute;r&ecirc;ts l&eacute;gitimes et il n&rsquo;est pas outrepass&eacute; par vos droits</li>
          <li>Pour le traitement des paiements</li>
          <li>Pour se conformer &agrave; la loi</li>
        </ul>

        <h4 className="text-md font-bold text-bleu-dark mt-6 mb-2">
          CONSERVATION DES DONN&Eacute;ES
        </h4>
        <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-3 space-y-1">
          <li>Nous conserverons vos donn&eacute;es personnelles uniquement pendant la dur&eacute;e n&eacute;cessaire aux fins d&eacute;crites dans la pr&eacute;sente politique de confidentialit&eacute;.</li>
          <li>Nous conserverons et utiliserons vos donn&eacute;es personnelles dans la mesure n&eacute;cessaire pour nous conformer &agrave; nos obligations l&eacute;gales, r&eacute;soudre les litiges et appliquer nos accords et politiques juridiques.</li>
        </ul>

        {/* Section 10 */}
        <h3 className="text-lg font-bold text-bleu-dark mt-8 mb-3">
          SECTION 10 &ndash; VOS DROITS DE PROTECTION DES DONN&Eacute;ES EN VERTU DU RGPD
        </h3>
        <p className="text-gray-700 leading-relaxed mb-3">
          Si vous r&eacute;sidez dans l&rsquo;Espace &eacute;conomique europ&eacute;en (EEE), vous avez certains droits en mati&egrave;re de protection des donn&eacute;es. Nous visons &agrave; prendre des mesures raisonnables pour vous permettre de corriger, modifier, supprimer ou limiter l&rsquo;utilisation de vos donn&eacute;es personnelles.
        </p>
        <p className="text-gray-700 leading-relaxed mb-3">
          Si vous souhaitez &ecirc;tre inform&eacute; des donn&eacute;es personnelles que nous d&eacute;tenons &agrave; votre sujet et si vous souhaitez les supprimer de nos syst&egrave;mes, veuillez nous contacter.
        </p>
        <p className="text-gray-700 leading-relaxed mb-3 font-semibold">
          Dans certaines circonstances, vous avez les droits de protection des donn&eacute;es suivants :
        </p>
        <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-3 space-y-1">
          <li>Le droit d&rsquo;acc&egrave;s, de mise &agrave; jour ou de suppression des informations que nous avons sur vous</li>
          <li>Le droit de rectification si ces informations sont inexactes ou incompl&egrave;tes</li>
          <li>Le droit de vous opposer au traitement de vos donn&eacute;es personnelles</li>
          <li>Le droit de demander que nous limitions le traitement de vos informations personnelles</li>
          <li>Le droit &agrave; la portabilit&eacute; des donn&eacute;es</li>
          <li>Le droit de retirer votre consentement &agrave; tout moment</li>
        </ul>
        <p className="text-gray-700 leading-relaxed mb-3">
          Veuillez noter que nous pouvons vous demander de v&eacute;rifier votre identit&eacute; avant de r&eacute;pondre &agrave; de telles demandes.
        </p>
        <p className="text-gray-700 leading-relaxed mb-3">
          Vous avez le droit de vous plaindre aupr&egrave;s d&rsquo;une autorit&eacute; de protection des donn&eacute;es. Pour plus d&rsquo;informations, veuillez contacter votre autorit&eacute; locale de protection des donn&eacute;es dans l&rsquo;Espace &eacute;conomique europ&eacute;en (EEE).
        </p>

        {/* Article 11 */}
        <h3 className="text-lg font-bold text-bleu-dark mt-8 mb-3">
          ARTICLE 11 &ndash; &Acirc;GE DE CONSENTEMENT
        </h3>
        <p className="text-gray-700 leading-relaxed mb-3">
          En utilisant ce site, vous d&eacute;clarez que vous avez au moins l&rsquo;&acirc;ge de la majorit&eacute; dans votre &Eacute;tat ou province de r&eacute;sidence, et que vous nous avez donn&eacute; votre consentement pour permettre &agrave; toute personne d&rsquo;&acirc;ge mineur &agrave; votre charge d&rsquo;utiliser ce site web.
        </p>

        {/* Article 12 */}
        <h3 className="text-lg font-bold text-bleu-dark mt-8 mb-3">
          ARTICLE 12 &ndash; MODIFICATIONS APPORT&Eacute;ES &Agrave; LA PR&Eacute;SENTE POLITIQUE DE CONFIDENTIALIT&Eacute;
        </h3>
        <p className="text-gray-700 leading-relaxed mb-3">
          Nous nous r&eacute;servons le droit de modifier la pr&eacute;sente politique de confidentialit&eacute; &agrave; tout moment. Les changements et les clarifications prendront effet imm&eacute;diatement apr&egrave;s leur publication sur le site web. Si nous apportons des changements au contenu de cette politique, nous vous aviserons ici qu&rsquo;elle a &eacute;t&eacute; mise &agrave; jour.
        </p>
        <p className="text-gray-700 leading-relaxed mb-3">
          Si notre boutique fait l&rsquo;objet d&rsquo;une acquisition par ou d&rsquo;une fusion avec une autre entreprise, vos renseignements pourraient &ecirc;tre transf&eacute;r&eacute;s aux nouveaux propri&eacute;taires pour que nous puissions continuer &agrave; vous vendre des produits.
        </p>

        {/* Questions */}
        <h3 className="text-lg font-bold text-bleu-dark mt-8 mb-3">
          QUESTIONS ET COORDONN&Eacute;ES
        </h3>
        <p className="text-gray-700 leading-relaxed mb-3">
          Si vous souhaitez : acc&eacute;der &agrave;, corriger, modifier ou supprimer toute information personnelle que nous avons &agrave; votre sujet, d&eacute;poser une plainte, ou si vous souhaitez simplement avoir plus d&rsquo;informations, contactez notre agent responsable des normes de confidentialit&eacute; &agrave; <a href="mailto:contact@mercure-sas.com" className="text-bleu-brand hover:underline">contact@mercure-sas.com</a> ou par courrier &agrave; :
        </p>
        <p className="text-gray-700 leading-relaxed mb-6">
          MERCURE SAS<br />
          60 rue Fran&ccedil;ois 1er<br />
          75008 PARIS
        </p>
      </div>
    </main>
  );
}
