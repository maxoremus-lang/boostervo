/* eslint-disable */
/**
 * Refresh "démo live" — wipe + régénère les prospects d'un user avec :
 *   1. Des dates toujours fraîches (relatives à NOW).
 *   2. Une courbe d'impact décroissante (plus on rappelle vite, plus on convertit).
 *   3. Un délai moyen verrouillé entre 15 et 60 min.
 *
 * Conçu pour être lancé par cron chaque nuit → la démo ne vieillit jamais
 * ET raconte toujours la même histoire commerciale.
 *
 * Usage : node scripts/refresh-demo.js <email>
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ============ POOLS ============
// Tous les prospects sont qualifiés par un agent IA vocal qui prend l'appel en
// premier — donc chaque prospect a un prénom et un VO identifié, même ceux qui
// n'ont jamais été rappelés (Groupe A "missed only"). Les pools doivent être
// >= au nombre total de prospects par user (~200) pour garantir l'unicité.
const FIRST_NAMES = [
  "Marc","Sophie","Karim","Élise","Thomas","Pascale","Patrick","Julien","Laurent","Céline",
  "Nicolas","Isabelle","Vincent","Marie","Pierre","Amélie","Stéphane","Nathalie","Fabien","Julie",
  "Olivier","Caroline","Bruno","Valérie","Christophe","Sandrine","Sébastien","Laure","Cédric","Virginie",
  "David","Aurélie","Damien","Émilie","Xavier","Claire","Romain","Léa","Anthony","Charlotte",
  "Alain","Alice","Alexandre","Alexandra","Alexis","Alban","Aline","Anaïs","André","Andréa",
  "Antoine","Arnaud","Audrey","Aurélien","Axel","Bastien","Bénédicte","Benoît","Bertrand","Brigitte",
  "Camille","Cécile","Charles","Christelle","Christian","Christine","Clément","Clémence","Constance","Corinne",
  "Cyril","Delphine","Denis","Didier","Dimitri","Dominique","Édouard","Éric","Estelle","Étienne",
  "Eugène","Évelyne","Fabrice","Fanny","Florent","Florence","Florian","Franck","Françoise","Frédéric",
  "Gabriel","Gaëlle","Gaétan","Geneviève","Geoffrey","Georges","Gérard","Gilbert","Gilles","Grégory",
  "Guillaume","Hélène","Henri","Hervé","Hugo","Hugues","Inès","Ingrid","Ismaël","Jacqueline",
  "Jacques","Jean","Jeanne","Jérémy","Jérôme","Joël","Jonathan","Joséphine","Joseph","Judith",
  "Justine","Karine","Kévin","Léon","Léonard","Lila","Lilian","Lina","Lisa","Loïc",
  "Lola","Louis","Louise","Lucas","Lucie","Lucien","Ludovic","Madeleine","Magali","Manon",
  "Marcel","Marina","Marjorie","Mathieu","Mathilde","Maud","Maurice","Maxence","Maxime","Mélanie",
  "Michel","Mickaël","Mireille","Morgane","Muriel","Nadia","Nadine","Nathan","Noé","Nora",
  "Norbert","Odile","Paola","Patrice","Paul","Pauline","Philippe","Quentin","Rachid","Raphaël",
  "Régine","Régis","Rémi","Renaud","René","Robert","Roland","Rose","Roxane","Sabine",
  "Sabrina","Salomé","Samuel","Sara","Serge","Simon","Solène","Stéphanie","Suzanne","Sylvain",
  "Sylvie","Tania","Tanguy","Théo","Théodore","Thierry","Tiffany","Timothée","Tristan","Ulysse",
  "Valentin","Valentine","Vanessa","Véronique","Victor","Victoire","Yann","Yannick","Yasmine","Yves",
  "Zoé","Zoubir","Adrien","Adèle","Aïcha","Albane","Amine","Apolline","Armand","Aurore",
  "Bilal","Capucine","Célia","Chloé","Coralie","Corentin","Diane","Dorian","Eléonore","Elsa",
  "Emma","Enzo","Erwan","Eva","Gauthier","Hadrien","Iris","Jade","Jules","Léna",
];
const VEHICLES = [
  // Peugeot
  { model: "Peugeot 108", price: 9900 },
  { model: "Peugeot 208", price: 12900 },
  { model: "Peugeot 2008", price: 18500 },
  { model: "Peugeot 308", price: 17500 },
  { model: "Peugeot 3008 GT", price: 24990 },
  { model: "Peugeot 5008", price: 26500 },
  { model: "Peugeot 408", price: 28900 },
  { model: "Peugeot 508", price: 24500 },
  { model: "Peugeot Rifter", price: 19900 },
  // Citroën
  { model: "Citroën C1", price: 8900 },
  { model: "Citroën C3", price: 14500 },
  { model: "Citroën C3 Aircross", price: 16900 },
  { model: "Citroën C4", price: 17900 },
  { model: "Citroën C5 Aircross", price: 23500 },
  { model: "Citroën C5 X", price: 28500 },
  { model: "Citroën Berlingo", price: 18900 },
  // Renault
  { model: "Renault Twingo", price: 9500 },
  { model: "Renault Clio", price: 13500 },
  { model: "Renault Captur", price: 17900 },
  { model: "Renault Mégane", price: 18500 },
  { model: "Renault Kadjar", price: 19900 },
  { model: "Renault Arkana", price: 24500 },
  { model: "Renault Austral", price: 28900 },
  { model: "Renault Scénic", price: 21500 },
  { model: "Renault Espace", price: 32500 },
  { model: "Renault Trafic", price: 22900 },
  { model: "Renault Kangoo", price: 16500 },
  // Dacia
  { model: "Dacia Sandero", price: 11200 },
  { model: "Dacia Logan", price: 11900 },
  { model: "Dacia Duster", price: 16900 },
  { model: "Dacia Jogger", price: 17500 },
  { model: "Dacia Spring", price: 14500 },
  // Volkswagen
  { model: "VW Polo", price: 15800 },
  { model: "VW Golf", price: 18500 },
  { model: "VW T-Cross", price: 19900 },
  { model: "VW T-Roc", price: 22500 },
  { model: "VW Tiguan", price: 27500 },
  { model: "VW Passat", price: 24900 },
  { model: "VW Arteon", price: 32500 },
  { model: "VW Touran", price: 21500 },
  { model: "VW Touareg", price: 38500 },
  { model: "VW ID.3", price: 28500 },
  { model: "VW ID.4", price: 32900 },
  // Audi
  { model: "Audi A1", price: 17900 },
  { model: "Audi A3", price: 22900 },
  { model: "Audi A4", price: 28500 },
  { model: "Audi A5", price: 32900 },
  { model: "Audi A6", price: 36500 },
  { model: "Audi Q2", price: 24500 },
  { model: "Audi Q3", price: 28900 },
  { model: "Audi Q5", price: 36500 },
  { model: "Audi Q7", price: 48900 },
  { model: "Audi Q8", price: 58500 },
  { model: "Audi e-tron", price: 52900 },
  // BMW
  { model: "BMW Série 1", price: 22500 },
  { model: "BMW Série 2", price: 26900 },
  { model: "BMW Série 3", price: 32900 },
  { model: "BMW Série 4", price: 38500 },
  { model: "BMW Série 5", price: 42500 },
  { model: "BMW X1", price: 28900 },
  { model: "BMW X2", price: 30500 },
  { model: "BMW X3", price: 38500 },
  { model: "BMW X4", price: 42900 },
  { model: "BMW X5", price: 52500 },
  { model: "BMW X6", price: 58900 },
  { model: "BMW i3", price: 24500 },
  { model: "BMW i4", price: 48500 },
  { model: "BMW M3", price: 68500 },
  // Mercedes
  { model: "Mercedes Classe A", price: 24500 },
  { model: "Mercedes Classe B", price: 26900 },
  { model: "Mercedes Classe C", price: 34500 },
  { model: "Mercedes Classe E", price: 42500 },
  { model: "Mercedes GLA", price: 28500 },
  { model: "Mercedes GLB", price: 32900 },
  { model: "Mercedes GLC", price: 42500 },
  { model: "Mercedes GLE", price: 52900 },
  { model: "Mercedes GLS", price: 68500 },
  { model: "Mercedes EQA", price: 38500 },
  { model: "Mercedes EQB", price: 42900 },
  // Toyota
  { model: "Toyota Yaris", price: 13400 },
  { model: "Toyota Aygo", price: 9900 },
  { model: "Toyota Corolla", price: 19500 },
  { model: "Toyota C-HR", price: 22900 },
  { model: "Toyota RAV4", price: 28500 },
  { model: "Toyota Camry", price: 32500 },
  { model: "Toyota Land Cruiser", price: 48900 },
  { model: "Toyota Hilux", price: 32500 },
  { model: "Toyota Yaris Cross", price: 18900 },
  // Ford
  { model: "Ford Fiesta", price: 12900 },
  { model: "Ford Focus", price: 17500 },
  { model: "Ford Puma", price: 19500 },
  { model: "Ford Kuga", price: 24900 },
  { model: "Ford Mondeo", price: 22500 },
  { model: "Ford Mustang", price: 42500 },
  { model: "Ford EcoSport", price: 16900 },
  { model: "Ford Edge", price: 32900 },
  // Opel
  { model: "Opel Corsa", price: 13900 },
  { model: "Opel Astra", price: 17500 },
  { model: "Opel Mokka", price: 19900 },
  { model: "Opel Crossland", price: 16500 },
  { model: "Opel Grandland", price: 24900 },
  { model: "Opel Insignia", price: 22500 },
  { model: "Opel Combo", price: 17900 },
  // Fiat
  { model: "Fiat 500", price: 12500 },
  { model: "Fiat 500X", price: 16500 },
  { model: "Fiat 500L", price: 14900 },
  { model: "Fiat Panda", price: 9900 },
  { model: "Fiat Tipo", price: 13500 },
  { model: "Fiat Doblo", price: 17900 },
  // Hyundai
  { model: "Hyundai i10", price: 10500 },
  { model: "Hyundai i20", price: 13900 },
  { model: "Hyundai i30", price: 17500 },
  { model: "Hyundai Kona", price: 19900 },
  { model: "Hyundai Tucson", price: 24500 },
  { model: "Hyundai Santa Fe", price: 32900 },
  { model: "Hyundai Bayon", price: 17500 },
  { model: "Hyundai Ioniq 5", price: 38500 },
  // Kia
  { model: "Kia Picanto", price: 10900 },
  { model: "Kia Rio", price: 13500 },
  { model: "Kia Ceed", price: 17900 },
  { model: "Kia Stonic", price: 16500 },
  { model: "Kia Sportage", price: 24900 },
  { model: "Kia Niro", price: 22500 },
  { model: "Kia Sorento", price: 38900 },
  { model: "Kia EV6", price: 42500 },
  // Nissan
  { model: "Nissan Micra", price: 13500 },
  { model: "Nissan Juke", price: 18900 },
  { model: "Nissan Qashqai", price: 22500 },
  { model: "Nissan X-Trail", price: 28900 },
  { model: "Nissan Leaf", price: 24500 },
  { model: "Nissan Ariya", price: 38900 },
  { model: "Nissan Note", price: 14500 },
  // Skoda
  { model: "Skoda Fabia", price: 13900 },
  { model: "Skoda Scala", price: 17500 },
  { model: "Skoda Kamiq", price: 18900 },
  { model: "Skoda Karoq", price: 22500 },
  { model: "Skoda Kodiaq", price: 32500 },
  { model: "Skoda Octavia", price: 19900 },
  { model: "Skoda Superb", price: 26900 },
  { model: "Skoda Enyaq", price: 38500 },
  // SEAT
  { model: "SEAT Ibiza", price: 13500 },
  { model: "SEAT Leon", price: 17900 },
  { model: "SEAT Arona", price: 17500 },
  { model: "SEAT Ateca", price: 22500 },
  { model: "SEAT Tarraco", price: 28900 },
  // Mini
  { model: "Mini Cooper", price: 19500 },
  { model: "Mini Countryman", price: 24900 },
  { model: "Mini Clubman", price: 22500 },
  { model: "Mini Cabrio", price: 26500 },
  // Volvo
  { model: "Volvo V60", price: 28500 },
  { model: "Volvo V90", price: 38500 },
  { model: "Volvo S60", price: 27900 },
  { model: "Volvo S90", price: 36500 },
  { model: "Volvo XC40", price: 32900 },
  { model: "Volvo XC60", price: 38900 },
  { model: "Volvo XC90", price: 52500 },
  { model: "Volvo EX30", price: 36500 },
  // Tesla
  { model: "Tesla Model 3", price: 38900 },
  { model: "Tesla Model Y", price: 42500 },
  { model: "Tesla Model S", price: 78500 },
  // Mazda
  { model: "Mazda 2", price: 14500 },
  { model: "Mazda 3", price: 19900 },
  { model: "Mazda CX-3", price: 18500 },
  { model: "Mazda CX-30", price: 22500 },
  { model: "Mazda CX-5", price: 28900 },
  { model: "Mazda MX-5", price: 28500 },
  // Honda
  { model: "Honda Jazz", price: 16500 },
  { model: "Honda Civic", price: 21500 },
  { model: "Honda HR-V", price: 22900 },
  { model: "Honda CR-V", price: 28500 },
  // Suzuki
  { model: "Suzuki Swift", price: 13500 },
  { model: "Suzuki Vitara", price: 19500 },
  { model: "Suzuki S-Cross", price: 21900 },
  { model: "Suzuki Jimny", price: 18900 },
  // Alfa Romeo
  { model: "Alfa Romeo Giulia", price: 32500 },
  { model: "Alfa Romeo Stelvio", price: 38900 },
  { model: "Alfa Romeo Tonale", price: 28500 },
  // Cupra
  { model: "Cupra Born", price: 32500 },
  { model: "Cupra Formentor", price: 28900 },
  { model: "Cupra Leon", price: 24500 },
  // DS
  { model: "DS3 Crossback", price: 22500 },
  { model: "DS4", price: 28900 },
  { model: "DS7 Crossback", price: 32500 },
  // Jeep
  { model: "Jeep Renegade", price: 19900 },
  { model: "Jeep Compass", price: 24500 },
  { model: "Jeep Wrangler", price: 42900 },
  { model: "Jeep Avenger", price: 22500 },
  // Land Rover
  { model: "Land Rover Defender", price: 58900 },
  { model: "Land Rover Discovery Sport", price: 38500 },
  { model: "Range Rover Evoque", price: 36500 },
  { model: "Range Rover Velar", price: 48900 },
  { model: "Range Rover Sport", price: 68500 },
  // Porsche
  { model: "Porsche Macan", price: 58900 },
  { model: "Porsche Cayenne", price: 78500 },
  { model: "Porsche 911", price: 92500 },
  // Lexus
  { model: "Lexus UX", price: 32500 },
  { model: "Lexus NX", price: 42500 },
  { model: "Lexus RX", price: 52900 },
  // Subaru
  { model: "Subaru Forester", price: 28500 },
  { model: "Subaru Outback", price: 32900 },
];
const NOTE_SNIPPETS = [
  "Budget {budget}K€, financement possible.",
  "Souhaite essayer ce weekend.",
  "Paiement cash possible.",
  "Contacte plusieurs concessions.",
  "Prêt à signer si bon prix.",
  "Recherche boîte auto.",
];

// ============ UTILS ============
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const minutesAgo = (m) => new Date(Date.now() - m * 60_000);

/**
 * Crée un échantillonneur sans remise : mélange le pool puis renvoie une
 * fonction qui sort un élément différent à chaque appel. Utilisé pour garantir
 * que chaque prospect ait un prénom et un VO uniques.
 */
function createUniqueSampler(pool, label) {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  let idx = 0;
  return () => {
    if (idx >= shuffled.length) {
      throw new Error(`Pool "${label}" épuisé (taille ${shuffled.length}). Augmente le pool dans refresh-demo.js.`);
    }
    return shuffled[idx++];
  };
}

// Samplers uniques pour le run en cours — initialisés dans main() après wipe.
let nextFirstName, nextVehicle;

// ==== Business hours (heures d'ouverture concessions VO, TZ Europe/Paris) ====
const BUSINESS_START_MIN = 9 * 60 + 15;   // 09h15
const BUSINESS_END_MIN   = 19 * 60 + 45;  // 19h45
// 0 = dimanche, 1 = lundi, …, 6 = samedi. Dimanche exclu.
const BUSINESS_DAYS = new Set([1, 2, 3, 4, 5, 6]);

const PARIS_TIME_FMT = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Paris',
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
  weekday: 'short',
});

/** Minutes depuis minuit à Paris pour une Date donnée. */
function parisMinutesOfDay(date) {
  const parts = PARIS_TIME_FMT.formatToParts(date);
  const h = parseInt(parts.find(p => p.type === 'hour').value, 10);
  const m = parseInt(parts.find(p => p.type === 'minute').value, 10);
  return h * 60 + m;
}

/** Jour de la semaine à Paris (0 = dim, 6 = sam). */
function parisDayOfWeek(date) {
  const w = PARIS_TIME_FMT.formatToParts(date).find(p => p.type === 'weekday').value;
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[w];
}

/** True si la Date tombe en heures d'ouverture concession à Paris. */
function isBusinessTimeParis(date) {
  if (!BUSINESS_DAYS.has(parisDayOfWeek(date))) return false;
  const m = parisMinutesOfDay(date);
  return m >= BUSINESS_START_MIN && m <= BUSINESS_END_MIN;
}

/**
 * Tire une Date dans la fenêtre [minOffsetMin, maxOffsetMin] minutes avant maintenant,
 * contrainte aux heures d'ouverture concession (lundi-samedi 9h15-19h45 Paris).
 * Rejet par échantillonnage ; en cas d'échec (très rare), retourne null.
 */
function sampleBusinessDate(minOffsetMin, maxOffsetMin) {
  for (let i = 0; i < 300; i++) {
    const offset = rand(minOffsetMin, maxOffsetMin);
    const d = new Date(Date.now() - offset * 60_000);
    if (isBusinessTimeParis(d)) return d;
  }
  return null;
}

/**
 * Tire une paire (missed, answered) en heures d'ouverture, avec delayMin fixé.
 * answered dans [answeredMinAgoRange], missed = answered - delayMin.
 */
function samplePairedBusinessDates(answeredMinRange, delayMin) {
  for (let i = 0; i < 300; i++) {
    const answeredOffset = rand(answeredMinRange[0], answeredMinRange[1]);
    const answered = new Date(Date.now() - answeredOffset * 60_000);
    if (!isBusinessTimeParis(answered)) continue;
    const missed = new Date(answered.getTime() - delayMin * 60_000);
    if (isBusinessTimeParis(missed)) return { missed, answered };
  }
  return null;
}

function randomPhone(used) {
  const two = () => String(rand(10, 99));
  for (let i = 0; i < 50; i++) {
    const prefix = Math.random() < 0.9 ? "6" : "7";
    const phone = `+33 ${prefix} ${two()} ${two()} ${two()} ${two()}`;
    if (!used.has(phone)) {
      used.add(phone);
      return phone;
    }
  }
  throw new Error("randomPhone: trop de collisions");
}

function fillFiche(status, hasAnswered = true) {
  // Tous les prospects sont qualifiés par un agent IA vocal qui prend l'appel
  // en premier — donc chaque prospect a un prénom et un VO identifié, même
  // ceux du Groupe A (missed only). Budget et notes restent réservés aux
  // prospects ayant été rappelés (hasAnswered=true) car ils dépendent d'un
  // échange humain.
  const vehicle = nextVehicle();
  const name = nextFirstName();
  const budget = hasAnswered && Math.random() < 0.6 ? vehicle.price + rand(-2000, 3000) : null;
  const notes = hasAnswered && Math.random() < 0.4
    ? pick(NOTE_SNIPPETS).replace("{budget}", String(Math.round((budget ?? vehicle.price) / 1000)))
    : null;
  return { name, vehicle, budget, notes };
}

function pickAppointmentDate() {
  // 70% futur (1-10j), 30% passé (1-3j → fiche "à remplir après RDV")
  const offset = Math.random() < 0.7 ? rand(1, 10) : -rand(1, 3);
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(pick([9, 10, 11, 14, 15, 16, 17]), pick([0, 15, 30, 45]), 0, 0);
  return d;
}

// ============ GROUPE A : Prospects "à rappeler" (missed only) ============
// Ils alimentent le tableau de bord et la liste rappels. Pas d'answered → pas
// d'impact sur le délai moyen ni sur la courbe de conversion.
const DASHBOARD_GROUPS = [
  {
    label: "urgents",
    count: 10,
    status: "pending",
    isUrgent: true,
    lastMissedMinRange: [3, 90],       // appel il y a 3-90 min
    extraMissed: { proba: 0.8, offsetMinRange: [30, 180] },
  },
  {
    label: "à rappeler",
    count: 18,
    status: "pending",
    isUrgent: false,
    lastMissedMinRange: [120, 1440],   // 2-24 h
    extraMissed: { proba: 0.2, offsetMinRange: [60, 300] },
  },
  {
    label: "injoignables",
    count: 6,
    status: "unreachable",
    isUrgent: false,
    lastMissedMinRange: [180, 3 * 1440],  // 3h à 3j
    extraMissed: { proba: 0, offsetMinRange: [180, 720] },  // pas d'inbound supplémentaire
    // On a vraiment essayé de joindre le prospect : 3 à 5 tentatives sortantes
    // après son appel initial, toutes sans réponse. C'est ça qui justifie "injoignable".
    outboundAttempts: { min: 3, max: 5, offsetMinRange: [30, 720] },
  },
];

// ============ GROUPE B : Prospects "traités" (missed + answered) ============
// Chacun a exactement 1 missed + 1 answered, avec un délai choisi dans la
// tranche. Alimente la courbe d'impact et l'avgDelay. Volume choisi pour que
// avgDelay ≈ 40 min (cf. commentaire bas de fichier).
const IMPACT_BUCKETS = [
  {
    label: "< 5 min",
    count: 50,
    delayMinRange: [1, 4],
    // 20% ventes, 30% RDV (= appointment + test_drive + quote_sent), 50% autres
    statusPool: [
      ...Array(10).fill("sold"),
      ...Array(9).fill("appointment"),
      ...Array(4).fill("test_drive"),
      ...Array(2).fill("quote_sent"),
      ...Array(20).fill("not_interested"),
      ...Array(5).fill("postponed"),
    ],
  },
  {
    label: "5 - 30 min",
    count: 40,
    delayMinRange: [6, 29],
    // 10% ventes, 25% RDV, 65% autres
    statusPool: [
      ...Array(4).fill("sold"),
      ...Array(7).fill("appointment"),
      ...Array(2).fill("test_drive"),
      ...Array(1).fill("quote_sent"),
      ...Array(24).fill("not_interested"),
      ...Array(2).fill("postponed"),
    ],
  },
  {
    label: "30 min - 2 h",
    count: 20,
    delayMinRange: [35, 115],
    // 0% ventes, 10% RDV, 90% autres
    statusPool: [
      ...Array(2).fill("appointment"),
      ...Array(17).fill("not_interested"),
      ...Array(1).fill("postponed"),
    ],
  },
  {
    label: "> 2 h",
    count: 15,
    delayMinRange: [150, 240],   // on borne à 4h pour tenir l'avg sous 60 min
    // 0% conversion
    statusPool: [
      ...Array(15).fill("not_interested"),
    ],
  },
];

// ============ GROUPE C : Décroché direct (inbound-answered, sans missed préalable) ============
// Cas réaliste : le négociant est au téléphone et décroche immédiatement un appel entrant.
// 1 seul event (answered inbound), pas de rappel nécessaire. Le prospect est qualifié
// pendant l'appel et son statut reflète le résultat de la conversation.
const DIRECT_PICKUP = {
  count: 40,
  // Décrochés répartis sur les 30 derniers jours en heures d'ouverture.
  answeredMinRange: [60, 30 * 24 * 60],
  // Distribution des issues pour un décroché direct (canal le plus performant) :
  //  - 45% RDV (appointment + test_drive + quote_sent)
  //  - 35% vente conclue
  //  - 15% pas intéressé
  //  - 5% reporté
  // Le décroché direct doit avoir le meilleur taux de transformation, juste
  // au-dessus du rappel < 5 min (40% RDV / 30% vente).
  statusPool: [
    ...Array(14).fill("sold"),
    ...Array(10).fill("appointment"),
    ...Array(5).fill("test_drive"),
    ...Array(3).fill("quote_sent"),
    ...Array(6).fill("not_interested"),
    ...Array(2).fill("postponed"),
  ],
};

// ============ MAIN ============
async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node scripts/refresh-demo.js <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User introuvable : ${email}`);
    process.exit(1);
  }
  console.log(`→ User : ${user.name} (${user.email})`);

  // === WIPE ===
  const existing = await prisma.prospect.findMany({
    where: { userId: user.id },
    select: { id: true },
  });
  const ids = existing.map((p) => p.id);
  if (ids.length > 0) {
    await prisma.callEvent.deleteMany({ where: { prospectId: { in: ids } } });
    await prisma.prospect.deleteMany({ where: { userId: user.id } });
    console.log(`→ Wipe : ${ids.length} prospects supprimés`);
  }

  let created = 0, eventsCount = 0;
  const usedPhones = new Set();
  let totalDelayMin = 0, delayObservations = 0;

  // Samplers uniques (sans remise) pour ce run : chaque prospect aura un
  // prénom et un VO différent des autres prospects de ce user.
  nextFirstName = createUniqueSampler(FIRST_NAMES, "FIRST_NAMES");
  nextVehicle = createUniqueSampler(VEHICLES, "VEHICLES");

  // === GROUPE A : Dashboard (missed only) ===
  let skippedA = 0;
  for (const g of DASHBOARD_GROUPS) {
    for (let i = 0; i < g.count; i++) {
      const lastMissedDate = sampleBusinessDate(g.lastMissedMinRange[0], g.lastMissedMinRange[1]);
      if (!lastMissedDate) { skippedA++; continue; }

      const phone = randomPhone(usedPhones);
      // Groupe A : aucun answered → jamais qualifié (name null)
      const fiche = fillFiche(g.status, false);

      // Event initial : appel entrant manqué du prospect
      const events = [{ type: "missed", direction: "inbound", createdAt: lastMissedDate, ringSec: rand(12, 28) }];
      if (Math.random() < g.extraMissed.proba) {
        // Extra missed inbound : une Date antérieure à lastMissedDate, elle aussi en heures d'ouverture
        let earlier = null;
        for (let k = 0; k < 50; k++) {
          const o = rand(g.extraMissed.offsetMinRange[0], g.extraMissed.offsetMinRange[1]);
          const cand = new Date(lastMissedDate.getTime() - o * 60_000);
          if (isBusinessTimeParis(cand)) { earlier = cand; break; }
        }
        if (earlier) {
          events.unshift({ type: "missed", direction: "inbound", createdAt: earlier, ringSec: rand(12, 28) });
        }
      }
      // Tentatives sortantes sans réponse (ex : injoignables) — postérieures au 1er inbound
      if (g.outboundAttempts) {
        const nAttempts = rand(g.outboundAttempts.min, g.outboundAttempts.max);
        for (let a = 0; a < nAttempts; a++) {
          let cand = null;
          for (let k = 0; k < 50; k++) {
            const o = rand(g.outboundAttempts.offsetMinRange[0], g.outboundAttempts.offsetMinRange[1]);
            const c = new Date(lastMissedDate.getTime() + o * 60_000);
            if (c.getTime() < Date.now() && isBusinessTimeParis(c)) { cand = c; break; }
          }
          if (cand) {
            events.push({ type: "missed", direction: "outbound", createdAt: cand, ringSec: rand(15, 30) });
          }
        }
      }

      await createProspectAndEvents({
        user, phone, fiche, status: g.status, isUrgent: g.isUrgent,
        appointmentAt: null, events,
      });
      created++;
      eventsCount += events.length;
    }
  }
  if (skippedA > 0) console.log(`   (groupe A : ${skippedA} prospects sautés car plage hors ouverture)`);

  // === GROUPE B : Rappel réussi (missed entrant → outbound-answered) ===
  // Le prospect a appelé (missed inbound), le négociant l'a rappelé depuis l'app
  // et a eu la personne au bout du fil (outbound answered). C'est le vrai "rappel effectué".
  let skippedB = 0;
  for (const bucket of IMPACT_BUCKETS) {
    // On mélange le pool de statuts pour varier l'ordre d'apparition en base
    const pool = [...bucket.statusPool].sort(() => Math.random() - 0.5);
    for (let i = 0; i < bucket.count; i++) {
      const status = pool[i % pool.length];
      const delayMin = rand(bucket.delayMinRange[0], bucket.delayMinRange[1]);

      // answered entre 1h et 20 jours dans le passé, missed = answered - delayMin.
      // Les deux doivent tomber en heures d'ouverture Paris.
      const pair = samplePairedBusinessDates([60, 20 * 24 * 60], delayMin);
      if (!pair) { skippedB++; continue; }

      const phone = randomPhone(usedPhones);
      const fiche = fillFiche(status);

      const events = [
        { type: "missed",   direction: "inbound",  createdAt: pair.missed,   ringSec: rand(12, 28) },
        { type: "answered", direction: "outbound", createdAt: pair.answered, durationSec: rand(90, 480) },
      ];

      const appointmentAt = status === "appointment" ? pickAppointmentDate() : null;
      const postponedUntil = status === "postponed" ? minutesAgo(-rand(1, 7) * 24 * 60) : null;

      await createProspectAndEvents({
        user, phone, fiche, status, isUrgent: false,
        appointmentAt, postponedUntil, events,
      });
      created++;
      eventsCount += events.length;
      totalDelayMin += delayMin;
      delayObservations++;
    }
  }
  if (skippedB > 0) console.log(`   (groupe B : ${skippedB} prospects sautés car paire hors ouverture)`);

  // === GROUPE C : Décrochés directs (inbound-answered sans missed) ===
  let skippedC = 0;
  const poolC = [...DIRECT_PICKUP.statusPool].sort(() => Math.random() - 0.5);
  for (let i = 0; i < DIRECT_PICKUP.count; i++) {
    const status = poolC[i % poolC.length];
    const answeredDate = sampleBusinessDate(DIRECT_PICKUP.answeredMinRange[0], DIRECT_PICKUP.answeredMinRange[1]);
    if (!answeredDate) { skippedC++; continue; }

    const phone = randomPhone(usedPhones);
    const fiche = fillFiche(status);
    const events = [
      { type: "answered", createdAt: answeredDate, durationSec: rand(90, 480) },
    ];
    const appointmentAt = status === "appointment" ? pickAppointmentDate() : null;
    const postponedUntil = status === "postponed" ? minutesAgo(-rand(1, 7) * 24 * 60) : null;

    await createProspectAndEvents({
      user, phone, fiche, status, isUrgent: false,
      appointmentAt, postponedUntil, events,
    });
    created++;
    eventsCount += events.length;
  }
  if (skippedC > 0) console.log(`   (groupe C : ${skippedC} prospects sautés car plage hors ouverture)`);

  // === STATS ===
  const statuses = await prisma.prospect.groupBy({
    by: ["status"],
    where: { userId: user.id },
    _count: { _all: true },
  });
  const urgentCount = await prisma.prospect.count({ where: { userId: user.id, isUrgent: true } });
  const avgDelay = delayObservations > 0 ? Math.round(totalDelayMin / delayObservations) : 0;

  console.log(`\n✅ Refresh terminé :`);
  console.log(`   ${created} prospects · ${eventsCount} CallEvents · ${urgentCount} urgents`);
  console.log(`   Délai moyen visé : ${avgDelay} min (cible 15-60)`);
  for (const s of statuses.sort((a, b) => b._count._all - a._count._all)) {
    console.log(`   ${String(s._count._all).padStart(3)} × ${s.status}`);
  }
}

const TERMINAL_STATUSES = new Set([
  "sold", "appointment", "test_drive", "quote_sent", "not_interested", "unreachable",
]);

async function createProspectAndEvents({
  user, phone, fiche, status, isUrgent, appointmentAt, postponedUntil = null, events,
}) {
  const sorted = [...events].sort((a, b) => a.createdAt - b.createdAt);
  const createdAt = sorted[0].createdAt;
  const updatedAt = sorted[sorted.length - 1].createdAt;
  // Pour les statuts terminaux, on considère que le négociant a "clôturé" le prospect
  // au moment du dernier appel de la séquence.
  const outcomeAt = TERMINAL_STATUSES.has(status) ? updatedAt : null;
  // Pour les ventes conclues, on simule des prix/marges réalistes :
  //   - Prix de vente : prix affiché ± 3 % (négociation)
  //   - Marge : distribution autour de la moyenne du négociant ± 30 %
  let salePrice = null;
  let saleMargin = null;
  if (status === "sold" && fiche.vehicle?.price) {
    const negotiation = 0.97 + Math.random() * 0.06; // 0.97 - 1.03
    salePrice = Math.round(fiche.vehicle.price * negotiation / 100) * 100;
    const avg = user.averageMarginVo || 800;
    const spread = 0.7 + Math.random() * 0.6; // 0.7 - 1.3
    saleMargin = Math.round((avg * spread) / 50) * 50;
  }

  const prospect = await prisma.prospect.create({
    data: {
      phone,
      userId: user.id,
      name: fiche.name,
      vehicleInterest: fiche.vehicle?.model ?? null,
      vehiclePrice: fiche.vehicle?.price ?? null,
      salePrice,
      saleMargin,
      budget: fiche.budget,
      notes: fiche.notes,
      status,
      isUrgent,
      appointmentAt,
      postponedUntil,
      outcomeAt,
      createdAt,
      updatedAt,
    },
  });

  for (const ev of sorted) {
    // Outbound : nous → prospect (fromPhone null côté outbound webhook Twilio).
    // Inbound (défaut) : prospect → numéro Twilio du négociant.
    const isOutbound = ev.direction === "outbound";
    await prisma.callEvent.create({
      data: {
        prospectId: prospect.id,
        type: ev.type,
        fromPhone: isOutbound ? null : phone,
        toPhone: isOutbound ? phone : (user.twilioNumber ?? null),
        ringSec: ev.ringSec ?? null,
        durationSec: ev.durationSec ?? null,
        createdAt: ev.createdAt,
      },
    });
  }
}

main()
  .catch((e) => { console.error("❌ Erreur refresh :", e); process.exit(1); })
  .finally(() => prisma.$disconnect());

// ============ NOTES DE DIMENSIONNEMENT ============
// Délai moyen théorique (ne compte que le groupe B) :
//   <5 min  : 50 × 2.5 = 125
//   5-30    : 40 × 17  = 680
//   30-2h   : 20 × 75  = 1500
//   >2h     : 15 × 195 = 2925
//   Total   : 125 obs, 5230 min → ≈ 42 min ✅ (dans la cible 15-60)
//
// Distribution conversion (impact graph) :
//   <5 min  : 15 sold / 20 RDV / 50 → 30% ventes, 40% RDV
//   5-30    :  4 sold / 10 RDV / 40 → 10% ventes, 25% RDV
//   30-2h   :  0 sold /  2 RDV / 20 →  0% ventes, 10% RDV
//   >2h     :  0 sold /  0 RDV / 15 →  0% ventes,  0% RDV
