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
  { model: "Citroën C3", price: 14500 },
  { model: "Citroën C4", price: 17900 },
  { model: "Renault Clio", price: 13500 },
  { model: "Renault Captur", price: 17900 },
  { model: "Dacia Sandero", price: 11200 },
  { model: "Dacia Duster", price: 16900 },
  { model: "VW Polo", price: 15800 },
  { model: "VW Golf", price: 18500 },
  { model: "Toyota Yaris", price: 13400 },
  { model: "Ford Puma", price: 19500 },
  { model: "Opel Corsa", price: 13900 },
  { model: "Fiat 500", price: 12500 },
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
  // Règle métier : la fiche n'est remplie que quand on a parlé au prospect
  // (answered). Tant qu'on n'a eu que des missed, name = null ⇒ prospect
  // "non qualifié" dans l'app.
  if (!hasAnswered) return { name: null, vehicle: null, budget: null, notes: null };

  const vehicle = pick(VEHICLES);
  const budget = Math.random() < 0.6 ? vehicle.price + rand(-2000, 3000) : null;
  const notes = Math.random() < 0.4
    ? pick(NOTE_SNIPPETS).replace("{budget}", String(Math.round((budget ?? vehicle.price) / 1000)))
    : null;
  return {
    name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    vehicle,
    budget,
    notes,
  };
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
    // 30% ventes, 40% RDV (= appointment + test_drive + quote_sent), 30% autres
    statusPool: [
      ...Array(15).fill("sold"),
      ...Array(12).fill("appointment"),
      ...Array(6).fill("test_drive"),
      ...Array(2).fill("quote_sent"),
      ...Array(11).fill("not_interested"),
      ...Array(4).fill("postponed"),
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
  // Distribution des issues pour un décroché direct :
  //  - 25% RDV (appointment + test_drive + quote_sent)
  //  - 18% vente conclue
  //  - 40% pas intéressé
  //  - 17% reporté
  statusPool: [
    ...Array(10).fill("sold"),
    ...Array(6).fill("appointment"),
    ...Array(3).fill("test_drive"),
    ...Array(1).fill("quote_sent"),
    ...Array(14).fill("not_interested"),
    ...Array(6).fill("postponed"),
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

  const prospect = await prisma.prospect.create({
    data: {
      phone,
      userId: user.id,
      name: fiche.name,
      vehicleInterest: fiche.vehicle?.model ?? null,
      vehiclePrice: fiche.vehicle?.price ?? null,
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
