/* eslint-disable */
/**
 * Script de seed pour peupler la DB avec des prospects de démo.
 *
 * Usage :
 *   node scripts/seed-demo.js max@boostervo.fr
 *
 * Idempotent : si un prospect avec le même (phone, userId) existe déjà, il est mis à jour.
 * Les CallEvents existants du prospect NE SONT PAS écrasés.
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const minutesAgo = (m) => new Date(Date.now() - m * 60_000);

/**
 * Jeu de données de démo — reproduit les prospects présents dans mockData.ts
 * pour que l'appli ait du contenu réaliste dès la connexion.
 */
const demoData = [
  {
    phone: "+33 6 14 28 35 77",
    status: "pending",
    isUrgent: true,
    lastMin: 134,
    events: [
      { at: 18, type: "missed", ringSec: 18 },
      { at: 54, type: "missed", ringSec: 22 },
      { at: 16 * 60, type: "missed", ringSec: 15 },
    ],
  },
  {
    phone: "+33 6 28 44 91 02",
    name: "Sophie Leroy",
    vehicleInterest: "Peugeot 3008 GT 2021",
    vehiclePrice: 24990,
    budget: 25000,
    notes: "Budget 25K€, financement possible. Veut essayer la GT en boîte auto.",
    status: "pending",
    isUrgent: true,
    lastMin: 108,
    events: [
      { at: 108, type: "missed", ringSec: 20 },
      { at: 180, type: "missed", ringSec: 18 },
    ],
  },
  {
    phone: "+33 6 22 85 12 44",
    status: "pending",
    isUrgent: false,
    lastMin: 35,
    events: [{ at: 35, type: "missed", ringSec: 19 }],
  },
  {
    phone: "+33 6 33 52 17 88",
    name: "Marc Dubois",
    vehicleInterest: "Citroën C3",
    vehiclePrice: 14500,
    status: "pending",
    isUrgent: false,
    lastMin: 12,
    events: [{ at: 12, type: "missed", ringSec: 21 }],
  },
  {
    phone: "+33 7 82 14 67 03",
    status: "pending",
    isUrgent: false,
    lastMin: 48,
    events: [{ at: 48, type: "missed", ringSec: 14 }],
  },
  {
    phone: "+33 6 55 71 20 11",
    name: "Karim Benali",
    vehicleInterest: "Renault Captur",
    vehiclePrice: 17900,
    status: "unreachable",
    isUrgent: false,
    lastMin: 120,
    events: [{ at: 120, type: "missed", ringSec: 25 }],
  },
  {
    phone: "+33 6 12 48 55 09",
    name: "Élise Moreau",
    vehicleInterest: "Dacia Sandero",
    vehiclePrice: 11200,
    status: "appointment",
    isUrgent: false,
    lastMin: 240,
    appointmentAtMin: -2 * 24 * 60, // dans 2 jours
    events: [{ at: 245, type: "answered", durationSec: 178 }],
  },
  {
    phone: "+33 6 78 90 23 45",
    name: "Thomas Girard",
    vehicleInterest: "VW Golf",
    vehiclePrice: 18500,
    status: "quote_sent",
    isUrgent: false,
    lastMin: 360,
    events: [{ at: 365, type: "answered", durationSec: 312 }],
  },
  {
    phone: "+33 6 41 66 78 22",
    name: "Pascale Durand",
    vehicleInterest: "Toyota Yaris",
    vehiclePrice: 13400,
    status: "test_drive",
    isUrgent: false,
    lastMin: 480,
    events: [{ at: 485, type: "answered", durationSec: 195 }],
  },
  {
    phone: "+33 6 99 88 77 66",
    name: "Patrick Roche",
    vehicleInterest: "BMW Série 1",
    vehiclePrice: 22500,
    status: "postponed",
    isUrgent: false,
    lastMin: 90,
    events: [{ at: 90, type: "missed", ringSec: 16 }],
  },
  {
    phone: "+33 6 47 23 91 56",
    name: "Julien Fabre",
    vehicleInterest: "Peugeot 208",
    vehiclePrice: 12900,
    status: "sold",
    isUrgent: false,
    lastMin: 1440,
    events: [{ at: 1445, type: "answered", durationSec: 420 }],
  },
];

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node scripts/seed-demo.js <email-du-user>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User introuvable : ${email}`);
    process.exit(1);
  }
  console.log(`→ User trouvé : ${user.name} (${user.email})`);

  let createdCount = 0;
  let updatedCount = 0;
  let eventsCreated = 0;

  for (const d of demoData) {
    const existing = await prisma.prospect.findUnique({
      where: { phone_userId: { phone: d.phone, userId: user.id } },
    });

    const prospectData = {
      phone: d.phone,
      name: d.name ?? null,
      vehicleInterest: d.vehicleInterest ?? null,
      vehiclePrice: d.vehiclePrice ?? null,
      budget: d.budget ?? null,
      notes: d.notes ?? null,
      status: d.status,
      isUrgent: d.isUrgent,
      appointmentAt: d.appointmentAtMin != null ? minutesAgo(d.appointmentAtMin) : null,
      userId: user.id,
    };

    let prospect;
    if (existing) {
      prospect = await prisma.prospect.update({ where: { id: existing.id }, data: prospectData });
      updatedCount++;
    } else {
      prospect = await prisma.prospect.create({ data: prospectData });
      createdCount++;
    }

    // Créer les CallEvents seulement si ce prospect n'en a pas encore
    const existingEvents = await prisma.callEvent.count({ where: { prospectId: prospect.id } });
    if (existingEvents === 0) {
      for (const ev of d.events) {
        await prisma.callEvent.create({
          data: {
            prospectId: prospect.id,
            type: ev.type,
            fromPhone: d.phone,
            toPhone: user.twilioNumber ?? null,
            ringSec: ev.ringSec ?? null,
            durationSec: ev.durationSec ?? null,
            createdAt: minutesAgo(ev.at),
          },
        });
        eventsCreated++;
      }
    }
  }

  console.log(`✅ Seed terminé :`);
  console.log(`   - ${createdCount} prospects créés`);
  console.log(`   - ${updatedCount} prospects mis à jour`);
  console.log(`   - ${eventsCreated} appels historiques ajoutés`);
  console.log(`   - Total prospects pour ${email} : ${await prisma.prospect.count({ where: { userId: user.id } })}`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
