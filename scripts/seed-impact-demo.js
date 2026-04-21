/* eslint-disable */
/**
 * Seed "impact délai" — injecte des prospects dans les 4 tranches de délai
 * (< 5 min, 5-30 min, 30 min-2h, > 2h) avec un taux de conversion décroissant
 * pour illustrer le message "plus on rappelle vite, plus on convertit".
 *
 * Usage : node scripts/seed-impact-demo.js max@boostervo.fr
 *
 * Idempotent : les prospects sont identifiés par un numéro dédié (+339 00 XX YY ZZ)
 *              et mis à jour si déjà présents.
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const minutesAgo = (m) => new Date(Date.now() - m * 60_000);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Délai (minutes entre missed → answered) et distribution statut par bucket
// On garde des nombres ronds pour obtenir des taux lisibles.
const BUCKETS = [
  {
    label: "< 5 min",
    count: 12,
    delayMin: () => 1 + Math.floor(Math.random() * 3), // 1-3 min
    statuses: [
      ...Array(5).fill("sold"),           // 42% ventes
      ...Array(4).fill("appointment"),    // +33% RDV (→ 75% RDV total, ventes incluses)
      ...Array(2).fill("quote_sent"),
      ...Array(1).fill("not_interested"),
    ],
  },
  {
    label: "5 - 30 min",
    count: 12,
    delayMin: () => 6 + Math.floor(Math.random() * 24), // 6-29 min
    statuses: [
      ...Array(2).fill("sold"),           // 17% ventes
      ...Array(4).fill("appointment"),    // +33% RDV (→ 50% RDV)
      ...Array(1).fill("quote_sent"),
      ...Array(5).fill("not_interested"),
    ],
  },
  {
    label: "30 min - 2 h",
    count: 12,
    delayMin: () => 35 + Math.floor(Math.random() * 80), // 35-114 min
    statuses: [
      ...Array(1).fill("sold"),           // 8% ventes
      ...Array(2).fill("appointment"),    // +17% RDV (→ 25% RDV)
      ...Array(9).fill("not_interested"),
    ],
  },
  {
    label: "> 2 h",
    count: 80,
    delayMin: () => 3 * 60 + Math.floor(Math.random() * 10 * 60), // 3-13h
    statuses: [
      ...Array(2).fill("sold"),           // ~2% ventes
      ...Array(3).fill("appointment"),    // ~6% RDV total
      ...Array(75).fill("not_interested"),
    ],
  },
];

const VEHICLES = [
  { interest: "Peugeot 3008", price: 24990 },
  { interest: "Renault Clio", price: 15500 },
  { interest: "Citroën C3", price: 13900 },
  { interest: "VW Polo", price: 16800 },
  { interest: "Dacia Sandero", price: 11200 },
  { interest: "Toyota Yaris", price: 14300 },
  { interest: "Ford Fiesta", price: 12700 },
  { interest: "Opel Corsa", price: 13400 },
  { interest: "Fiat 500", price: 12900 },
  { interest: "Nissan Juke", price: 19800 },
];

const FIRST_NAMES = ["Julie", "Marc", "Pierre", "Claire", "Luc", "Anne", "Paul", "Sarah", "Thomas", "Emma", "Léa", "Antoine", "Camille", "Hugo", "Nina"];
const LAST_NAMES = ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau", "Simon", "Laurent"];

function makePhone(bucketIdx, slot) {
  // Bloc réservé pour ce seed : +33 9 00 BB SS NN
  // BB = bucket (01..04), SS = slot (00..99), NN = check (42)
  const bb = String(bucketIdx + 1).padStart(2, "0");
  const ss = String(slot).padStart(2, "0");
  return `+33 9 00 ${bb} ${ss} 42`;
}

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node scripts/seed-impact-demo.js <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User introuvable : ${email}`);
    process.exit(1);
  }
  console.log(`→ User : ${user.name} (${user.email})`);

  let created = 0, updated = 0, eventsAdded = 0;

  for (let b = 0; b < BUCKETS.length; b++) {
    const bucket = BUCKETS[b];
    for (let i = 0; i < bucket.count; i++) {
      const phone = makePhone(b, i);
      const status = bucket.statuses[i % bucket.statuses.length];
      const delayMin = bucket.delayMin();
      // Le missed a eu lieu "il y a entre 2 et 20 jours" pour rester dans la fenêtre stats
      const missedAgoMin = 2 * 24 * 60 + Math.floor(Math.random() * 18 * 24 * 60);
      const answeredAgoMin = Math.max(0, missedAgoMin - delayMin);

      const vehicle = pick(VEHICLES);
      const first = pick(FIRST_NAMES), last = pick(LAST_NAMES);

      const existing = await prisma.prospect.findUnique({
        where: { phone_userId: { phone, userId: user.id } },
      });

      const data = {
        phone,
        userId: user.id,
        name: `${first} ${last}`,
        vehicleInterest: vehicle.interest,
        vehiclePrice: vehicle.price,
        status,
        isUrgent: false,
        appointmentAt: status === "appointment" ? minutesAgo(-3 * 24 * 60) : null,
      };

      let prospect;
      if (existing) {
        prospect = await prisma.prospect.update({ where: { id: existing.id }, data });
        updated++;
      } else {
        prospect = await prisma.prospect.create({ data });
        created++;
      }

      // Réinitialise les events pour cohérence (seed idempotent)
      await prisma.callEvent.deleteMany({ where: { prospectId: prospect.id } });
      await prisma.callEvent.create({
        data: {
          prospectId: prospect.id,
          type: "missed",
          fromPhone: phone,
          toPhone: user.twilioNumber ?? null,
          ringSec: 18 + Math.floor(Math.random() * 10),
          createdAt: minutesAgo(missedAgoMin),
        },
      });
      await prisma.callEvent.create({
        data: {
          prospectId: prospect.id,
          type: "answered",
          fromPhone: phone,
          toPhone: user.twilioNumber ?? null,
          durationSec: 120 + Math.floor(Math.random() * 300),
          createdAt: minutesAgo(answeredAgoMin),
        },
      });
      eventsAdded += 2;
    }
  }

  console.log(`✅ Seed impact terminé :`);
  console.log(`   - ${created} prospects créés`);
  console.log(`   - ${updated} prospects mis à jour`);
  console.log(`   - ${eventsAdded} CallEvents enregistrés`);
  console.log(`   - Distribution : ${BUCKETS.map((b) => `${b.label}=${b.count}`).join(", ")}`);
}

main()
  .catch((e) => { console.error("❌ Erreur seed :", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
