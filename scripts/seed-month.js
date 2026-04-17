/* eslint-disable */
/**
 * Seed "1 mois de données réaliste" pour un user donné.
 *
 * Usage :
 *   node scripts/seed-month.js max@boostervo.fr
 *   node scripts/seed-month.js max@boostervo.fr 80 30   // 80 prospects sur 30 jours (défaut)
 *
 * ⚠️ Efface TOUS les prospects + CallEvents du user avant de re-seeder.
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ============ PARAMÈTRES ============
const DEFAULT_VOLUME = 80;
const DEFAULT_DAYS = 30;

// Répartition temporelle : plus dense près d'aujourd'hui (bucket = [startDay, endDay, weight])
const TIME_BUCKETS = [
  { from: 0, to: 7, weight: 40 },   // 40% sur les 7 derniers jours
  { from: 7, to: 14, weight: 30 },  // 30% semaine d'avant
  { from: 14, to: 21, weight: 20 }, // 20% 3e semaine
  { from: 21, to: 30, weight: 10 }, // 10% 4e semaine
];

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

// ~15% des prospects pending deviennent urgents (2+ appels manqués)
const URGENT_RATIO = 0.15;

// ============ DATA POOLS ============
const FIRST_NAMES = [
  "Marc","Sophie","Karim","Élise","Thomas","Pascale","Patrick","Julien","Laurent","Céline",
  "Nicolas","Isabelle","Vincent","Marie","Pierre","Amélie","Stéphane","Nathalie","Fabien","Julie",
  "Olivier","Caroline","Bruno","Valérie","Christophe","Sandrine","Sébastien","Laure","Cédric","Virginie",
  "David","Aurélie","Damien","Émilie","Xavier","Claire","Romain","Léa","Anthony","Charlotte",
  "Maxime","Hélène","Guillaume","Sarah","Antoine","Camille","Benoît","Mathilde","Renaud","Lucie",
];

const LAST_NAMES = [
  "Dubois","Leroy","Benali","Moreau","Girard","Durand","Roche","Fabre","Martin","Bernard",
  "Petit","Robert","Richard","Lefebvre","Garcia","Michel","David","Laurent","Thomas","Rousseau",
  "Vincent","Muller","Lefevre","Faure","Blanc","Guerin","Boyer","Garnier","Chevalier","Francois",
  "Legrand","Gauthier","Dupont","Lambert","Bonnet","Mercier","Gautier","Fournier","Morel","Girard",
];

const VEHICLES = [
  { model: "Peugeot 208",       price: 12900 },
  { model: "Peugeot 2008",      price: 18500 },
  { model: "Peugeot 3008 GT",   price: 24990 },
  { model: "Peugeot 508",       price: 28500 },
  { model: "Citroën C3",        price: 14500 },
  { model: "Citroën C4",        price: 17900 },
  { model: "Citroën C5 Aircross", price: 22500 },
  { model: "Renault Clio",      price: 13500 },
  { model: "Renault Captur",    price: 17900 },
  { model: "Renault Arkana",    price: 21900 },
  { model: "Renault Megane E-Tech", price: 32500 },
  { model: "Dacia Sandero",     price: 11200 },
  { model: "Dacia Duster",      price: 16900 },
  { model: "VW Polo",           price: 15800 },
  { model: "VW Golf",           price: 18500 },
  { model: "VW T-Roc",          price: 24500 },
  { model: "Toyota Yaris",      price: 13400 },
  { model: "Toyota C-HR",       price: 22900 },
  { model: "Toyota RAV4 Hybrid", price: 31500 },
  { model: "Ford Puma",         price: 19500 },
  { model: "Ford Kuga",         price: 25900 },
  { model: "Opel Corsa",        price: 13900 },
  { model: "Opel Mokka",        price: 20500 },
  { model: "BMW Série 1",       price: 22500 },
  { model: "BMW Série 3",       price: 34500 },
  { model: "Audi A3 Sportback", price: 27500 },
  { model: "Audi Q3",           price: 32900 },
  { model: "Mercedes Classe A", price: 26500 },
  { model: "Fiat 500",          price: 12500 },
  { model: "Hyundai Kona",      price: 19900 },
];

const NOTE_SNIPPETS = [
  "Budget {budget}K€, financement possible.",
  "Souhaite essayer ce weekend.",
  "A une reprise ({model2}, {year}, {km}km).",
  "Paiement cash possible.",
  "Doit convaincre conjoint(e).",
  "Vient de Bordeaux, peut se déplacer.",
  "Contacte plusieurs concessions.",
  "Prêt à signer si bon prix.",
  "Recherche boîte auto obligatoirement.",
  "Besoin pour déménagement dans 15j.",
];

// ============ UTILITAIRES ============
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomPhone() {
  const suffix = () => String(rand(10, 99));
  const prefix = Math.random() < 0.9 ? "06" : "07";
  return `+33 ${prefix.charAt(1)} ${suffix()} ${suffix()} ${suffix()} ${suffix()}`;
}
function pickTimeBucket() {
  const total = TIME_BUCKETS.reduce((s, b) => s + b.weight, 0);
  let r = Math.random() * total;
  for (const b of TIME_BUCKETS) {
    r -= b.weight;
    if (r <= 0) return b;
  }
  return TIME_BUCKETS[0];
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
function dateFromDaysAgo(daysAgo, hour = null, min = null) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  if (hour !== null) {
    d.setHours(hour, min ?? rand(0, 59), rand(0, 59), 0);
  } else {
    // Heures d'ouverture : 9h-19h, avec pic 10-12 et 14-17
    const hoursPool = [9, 10, 10, 11, 11, 12, 14, 14, 15, 15, 16, 16, 17, 17, 18];
    d.setHours(pick(hoursPool), rand(0, 59), 0, 0);
  }
  return d;
}

/**
 * Génère les CallEvents pour un prospect selon son statut.
 * Retourne { events, isUrgent, appointmentAt }
 */
function generateCallEvents(status, baseDate) {
  const events = [];
  let isUrgent = false;
  let appointmentAt = null;

  // baseDate = date du 1er contact (premier missed call)
  const makeMissed = (daysOffset = 0, hourOffset = 0) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + daysOffset);
    d.setHours(d.getHours() + hourOffset);
    return { type: "missed", createdAt: d, ringSec: rand(12, 28) };
  };
  const makeAnswered = (daysOffset = 0, hourOffset = 0) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + daysOffset);
    d.setHours(d.getHours() + hourOffset);
    return { type: "answered", createdAt: d, durationSec: rand(90, 480) };
  };

  if (status === "pending") {
    // 1er missed call + éventuellement urgent
    events.push(makeMissed(0));
    if (Math.random() < URGENT_RATIO) {
      // Urgent : 2-3 missed calls
      events.push(makeMissed(0, rand(1, 4)));
      if (Math.random() < 0.5) events.push(makeMissed(1, rand(0, 2)));
      isUrgent = true;
    }
  } else if (status === "unreachable") {
    // 1-2 missed, pas encore décroché
    events.push(makeMissed(0));
    if (Math.random() < 0.7) events.push(makeMissed(1, rand(2, 8)));
  } else if (status === "postponed") {
    // 1 missed + 1 answered (reporté par le client)
    events.push(makeMissed(0));
    events.push(makeAnswered(0, rand(1, 6)));
  } else if (status === "appointment") {
    // 1-2 missed + 1 answered, RDV planifié dans les 7 jours à venir ou récemment passé
    events.push(makeMissed(0));
    if (Math.random() < 0.4) events.push(makeMissed(0, rand(1, 4)));
    events.push(makeAnswered(0, rand(2, 8)));
    // 60% des RDV sont futurs, 40% passés (feedback pas encore saisi)
    const offset = Math.random() < 0.6 ? rand(1, 10) : -rand(1, 3);
    const rdv = new Date();
    rdv.setDate(rdv.getDate() + offset);
    rdv.setHours(pick([9, 10, 11, 14, 15, 16, 17]), pick([0, 15, 30, 45]), 0, 0);
    appointmentAt = rdv;
  } else if (status === "test_drive") {
    // 1 missed + 1 answered, essai déjà effectué
    events.push(makeMissed(0));
    events.push(makeAnswered(0, rand(1, 4)));
  } else if (status === "quote_sent") {
    // 1 missed + 1 answered, devis envoyé
    events.push(makeMissed(0));
    events.push(makeAnswered(0, rand(2, 12)));
  } else if (status === "sold") {
    // 1-2 missed + 1 answered long
    events.push(makeMissed(0));
    if (Math.random() < 0.3) events.push(makeMissed(0, rand(1, 3)));
    events.push(makeAnswered(rand(1, 3), rand(0, 8)));
  } else if (status === "not_interested") {
    events.push(makeMissed(0));
    events.push(makeAnswered(0, rand(1, 8)));
  }

  return { events, isUrgent, appointmentAt };
}

// ============ MAIN ============
async function main() {
  const email = process.argv[2];
  const volume = parseInt(process.argv[3] || DEFAULT_VOLUME, 10);
  const days = parseInt(process.argv[4] || DEFAULT_DAYS, 10);

  if (!email) {
    console.error("Usage: node scripts/seed-month.js <email> [volume=80] [days=30]");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User introuvable : ${email}`);
    process.exit(1);
  }

  console.log(`→ User : ${user.name} (${user.email})`);
  console.log(`→ Génération : ${volume} prospects sur ${days} derniers jours`);

  // === NETTOYAGE ===
  const existingProspects = await prisma.prospect.findMany({
    where: { userId: user.id },
    select: { id: true },
  });
  const ids = existingProspects.map((p) => p.id);
  if (ids.length > 0) {
    const deletedEvents = await prisma.callEvent.deleteMany({
      where: { prospectId: { in: ids } },
    });
    const deletedProspects = await prisma.prospect.deleteMany({
      where: { userId: user.id },
    });
    console.log(`→ Nettoyage : ${deletedProspects.count} prospects + ${deletedEvents.count} call events supprimés`);
  }

  // === GÉNÉRATION ===
  let created = 0;
  let eventsCount = 0;
  const usedPhones = new Set();

  for (let i = 0; i < volume; i++) {
    // Phone unique
    let phone;
    do {
      phone = randomPhone();
    } while (usedPhones.has(phone));
    usedPhones.add(phone);

    const bucket = pickTimeBucket();
    const daysAgo = rand(bucket.from, Math.max(bucket.from + 1, bucket.to));
    const baseDate = dateFromDaysAgo(daysAgo);

    const status = pickStatus();

    // Nom / véhicule : 25% des "pending" restent "inconnus" (fiche non remplie)
    const isFicheFilled = status !== "pending" || Math.random() >= 0.25;
    const name = isFicheFilled ? `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}` : null;
    const vehicle = isFicheFilled ? pick(VEHICLES) : null;
    const budget = isFicheFilled && vehicle && Math.random() < 0.6 ? vehicle.price + rand(-2000, 3000) : null;
    const notes = isFicheFilled && Math.random() < 0.4
      ? pick(NOTE_SNIPPETS)
          .replace("{budget}", String(Math.round((budget ?? vehicle.price) / 1000)))
          .replace("{model2}", pick(VEHICLES).model.split(" ").slice(0, 2).join(" "))
          .replace("{year}", String(rand(2015, 2022)))
          .replace("{km}", String(rand(50, 180) * 1000))
      : null;

    const { events, isUrgent, appointmentAt } = generateCallEvents(status, baseDate);

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
        createdAt: baseDate,
        updatedAt: events.length > 0 ? events[events.length - 1].createdAt : baseDate,
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
  const urgentCount = await prisma.prospect.count({ where: { userId: user.id, isUrgent: true } });

  console.log(`\n✅ Seed terminé :`);
  console.log(`   ${created} prospects créés · ${eventsCount} appels historiques`);
  console.log(`   ${urgentCount} urgents`);
  console.log(`\nRépartition par statut :`);
  for (const s of statuses.sort((a, b) => b._count._all - a._count._all)) {
    console.log(`   ${String(s._count._all).padStart(3)} × ${s.status}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
