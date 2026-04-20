/* eslint-disable */
/**
 * Refresh "démo live" — wipe + regénère les prospects d'un user avec des
 * dates toujours fraîches (urgents = dernières minutes, etc.).
 *
 * Pensé pour être lancé par cron chaque nuit → la démo ne vieillit jamais.
 *
 * Usage :
 *   node scripts/refresh-demo.js max@boostervo.fr
 *   node scripts/refresh-demo.js max@boostervo.fr 60   // 60 prospects (défaut 60)
 *
 * Distribution temporelle appliquée (override le comportement de seed-month) :
 *   - Urgents          : dernier appel 5 → 120 min avant maintenant
 *   - À rappeler       : dernier appel 2h → 24h avant maintenant
 *   - En cours / Traités : 1j → 14j avant maintenant (variable selon statut)
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DEFAULT_VOLUME = 60;

// Répartition par statut (% qui doit sommer à 100)
const STATUS_DISTRIBUTION = [
  { status: "pending",        pct: 40 },
  { status: "unreachable",    pct: 15 },
  { status: "postponed",      pct: 8 },
  { status: "appointment",    pct: 15 },
  { status: "test_drive",     pct: 8 },
  { status: "quote_sent",     pct: 5 },
  { status: "sold",           pct: 5 },
  { status: "not_interested", pct: 4 },
];

// ~15% des pending deviennent urgents
const URGENT_RATIO = 0.15;

// ============ POOLS ============
const FIRST_NAMES = [
  "Marc","Sophie","Karim","Élise","Thomas","Pascale","Patrick","Julien","Laurent","Céline",
  "Nicolas","Isabelle","Vincent","Marie","Pierre","Amélie","Stéphane","Nathalie","Fabien","Julie",
  "Olivier","Caroline","Bruno","Valérie","Christophe","Sandrine","Sébastien","Laure","Cédric","Virginie",
  "David","Aurélie","Damien","Émilie","Xavier","Claire","Romain","Léa","Anthony","Charlotte",
];
const LAST_NAMES = [
  "Dubois","Leroy","Benali","Moreau","Girard","Durand","Roche","Fabre","Martin","Bernard",
  "Petit","Robert","Richard","Lefebvre","Garcia","Michel","David","Laurent","Thomas","Rousseau",
  "Vincent","Muller","Lefevre","Faure","Blanc","Guerin","Boyer","Garnier","Chevalier","Francois",
];
const VEHICLES = [
  { model: "Peugeot 208", price: 12900 },
  { model: "Peugeot 2008", price: 18500 },
  { model: "Peugeot 3008 GT", price: 24990 },
  { model: "Peugeot 508", price: 28500 },
  { model: "Citroën C3", price: 14500 },
  { model: "Citroën C4", price: 17900 },
  { model: "Citroën C5 Aircross", price: 22500 },
  { model: "Renault Clio", price: 13500 },
  { model: "Renault Captur", price: 17900 },
  { model: "Renault Megane E-Tech", price: 32500 },
  { model: "Dacia Sandero", price: 11200 },
  { model: "Dacia Duster", price: 16900 },
  { model: "VW Polo", price: 15800 },
  { model: "VW Golf", price: 18500 },
  { model: "VW T-Roc", price: 24500 },
  { model: "Toyota Yaris", price: 13400 },
  { model: "Toyota C-HR", price: 22900 },
  { model: "Ford Puma", price: 19500 },
  { model: "Opel Corsa", price: 13900 },
  { model: "BMW Série 1", price: 22500 },
  { model: "Audi A3 Sportback", price: 27500 },
  { model: "Mercedes Classe A", price: 26500 },
  { model: "Fiat 500", price: 12500 },
  { model: "Hyundai Kona", price: 19900 },
];
const NOTE_SNIPPETS = [
  "Budget {budget}K€, financement possible.",
  "Souhaite essayer ce weekend.",
  "Paiement cash possible.",
  "Doit convaincre conjoint(e).",
  "Contacte plusieurs concessions.",
  "Prêt à signer si bon prix.",
  "Recherche boîte auto obligatoirement.",
  "Besoin pour déménagement dans 15j.",
];

// ============ UTILS ============
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const minutesAgo = (m) => new Date(Date.now() - m * 60_000);

function randomPhone() {
  const two = () => String(rand(10, 99));
  const prefix = Math.random() < 0.9 ? "6" : "7";
  return `+33 ${prefix} ${two()} ${two()} ${two()} ${two()}`;
}

function pickStatus() {
  const total = STATUS_DISTRIBUTION.reduce((s, b) => s + b.pct, 0);
  let r = Math.random() * total;
  for (const s of STATUS_DISTRIBUTION) {
    r -= s.pct;
    if (r <= 0) return s.status;
  }
  return "pending";
}

/**
 * Retourne le "dernier appel" (en minutes avant maintenant) selon la catégorie.
 * Urgents  : 5 → 120 min
 * À rappeler (pending non-urgent, postponed, unreachable) : 120 → 1440 min (2h → 24h)
 * Mid-funnel / Traités : 1j → 14j (en minutes)
 */
function pickLastCallMinutes(status, isUrgent) {
  if (isUrgent) return rand(5, 120);
  if (["pending", "postponed", "unreachable"].includes(status)) return rand(120, 1440);
  // appointment, test_drive, quote_sent, sold, not_interested
  return rand(1 * 1440, 14 * 1440);
}

/**
 * Génère la liste d'événements d'appel pour un prospect, ancrés sur "lastMin"
 * (le dernier événement), en remontant dans le temps pour les précédents.
 */
function generateEvents(status, isUrgent, lastMin) {
  const events = [];
  const mkMissed = (min) => ({ type: "missed", createdAt: minutesAgo(min), ringSec: rand(12, 28) });
  const mkAnswered = (min) => ({ type: "answered", createdAt: minutesAgo(min), durationSec: rand(90, 480) });

  if (status === "pending") {
    if (isUrgent) {
      // 2-3 missed calls rapprochés, le dernier = lastMin
      events.push(mkMissed(lastMin + rand(60, 240)));
      if (Math.random() < 0.6) events.push(mkMissed(lastMin + rand(20, 80)));
      events.push(mkMissed(lastMin));
    } else {
      events.push(mkMissed(lastMin));
    }
  } else if (status === "unreachable") {
    events.push(mkMissed(lastMin + rand(60, 300)));
    if (Math.random() < 0.7) events.push(mkMissed(lastMin));
    else events.push(mkMissed(lastMin));
  } else if (status === "postponed") {
    events.push(mkMissed(lastMin + rand(60, 240)));
    events.push(mkAnswered(lastMin));
  } else if (status === "appointment") {
    events.push(mkMissed(lastMin + rand(240, 720)));
    if (Math.random() < 0.4) events.push(mkMissed(lastMin + rand(60, 180)));
    events.push(mkAnswered(lastMin));
  } else if (status === "test_drive" || status === "quote_sent") {
    events.push(mkMissed(lastMin + rand(120, 600)));
    events.push(mkAnswered(lastMin));
  } else if (status === "sold" || status === "not_interested") {
    events.push(mkMissed(lastMin + rand(120, 600)));
    if (Math.random() < 0.3) events.push(mkMissed(lastMin + rand(30, 90)));
    events.push(mkAnswered(lastMin));
  }

  // Tri chrono croissant
  events.sort((a, b) => a.createdAt - b.createdAt);
  return events;
}

function pickAppointmentDate() {
  // 60% futur (1-10j), 40% passé récent (1-3j) → fiche "à remplir"
  const offset = Math.random() < 0.6 ? rand(1, 10) : -rand(1, 3);
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(pick([9, 10, 11, 14, 15, 16, 17]), pick([0, 15, 30, 45]), 0, 0);
  return d;
}

// ============ MAIN ============
async function main() {
  const email = process.argv[2];
  const volume = parseInt(process.argv[3] || DEFAULT_VOLUME, 10);

  if (!email) {
    console.error("Usage: node scripts/refresh-demo.js <email> [volume=60]");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User introuvable : ${email}`);
    process.exit(1);
  }

  console.log(`→ User : ${user.name} (${user.email})`);
  console.log(`→ Refresh démo : ${volume} prospects, dates fraîches`);

  // === WIPE ===
  const existing = await prisma.prospect.findMany({
    where: { userId: user.id },
    select: { id: true },
  });
  const ids = existing.map((p) => p.id);
  if (ids.length > 0) {
    await prisma.callEvent.deleteMany({ where: { prospectId: { in: ids } } });
    await prisma.prospect.deleteMany({ where: { userId: user.id } });
    console.log(`→ Wipe : ${ids.length} prospects + leurs appels supprimés`);
  }

  // === GEN ===
  let created = 0;
  let eventsCount = 0;
  const usedPhones = new Set();

  for (let i = 0; i < volume; i++) {
    let phone;
    do {
      phone = randomPhone();
    } while (usedPhones.has(phone));
    usedPhones.add(phone);

    const status = pickStatus();
    const isUrgent = status === "pending" && Math.random() < URGENT_RATIO;

    const lastMin = pickLastCallMinutes(status, isUrgent);
    const events = generateEvents(status, isUrgent, lastMin);

    const isFicheFilled = status !== "pending" || Math.random() >= 0.25;
    const name = isFicheFilled ? `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}` : null;
    const vehicle = isFicheFilled ? pick(VEHICLES) : null;
    const budget = isFicheFilled && vehicle && Math.random() < 0.6
      ? vehicle.price + rand(-2000, 3000)
      : null;
    const notes = isFicheFilled && Math.random() < 0.4
      ? pick(NOTE_SNIPPETS).replace("{budget}", String(Math.round((budget ?? vehicle.price) / 1000)))
      : null;

    const appointmentAt = status === "appointment" ? pickAppointmentDate() : null;
    const createdAt = events[0].createdAt;
    const updatedAt = events[events.length - 1].createdAt;

    const prospect = await prisma.prospect.create({
      data: {
        phone,
        name,
        vehicleInterest: vehicle?.model ?? null,
        vehiclePrice: vehicle?.price ?? null,
        budget,
        notes,
        status,
        isUrgent,
        appointmentAt,
        userId: user.id,
        createdAt,
        updatedAt,
      },
    });
    created++;

    for (const ev of events) {
      await prisma.callEvent.create({
        data: {
          prospectId: prospect.id,
          type: ev.type,
          fromPhone: phone,
          toPhone: user.twilioNumber ?? null,
          ringSec: ev.ringSec ?? null,
          durationSec: ev.durationSec ?? null,
          createdAt: ev.createdAt,
        },
      });
      eventsCount++;
    }
  }

  // === STATS ===
  const statuses = await prisma.prospect.groupBy({
    by: ["status"],
    where: { userId: user.id },
    _count: { _all: true },
  });
  const urgentCount = await prisma.prospect.count({
    where: { userId: user.id, isUrgent: true },
  });

  console.log(`\n✅ Refresh terminé :`);
  console.log(`   ${created} prospects · ${eventsCount} appels · ${urgentCount} urgents`);
  for (const s of statuses.sort((a, b) => b._count._all - a._count._all)) {
    console.log(`   ${String(s._count._all).padStart(3)} × ${s.status}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Erreur refresh :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
