import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Compte admin BoosterVO
  const admin = await prisma.user.upsert({
    where: { email: "max@boostervo.fr" },
    update: {},
    create: {
      email: "max@boostervo.fr",
      passwordHash: hashSync("boostervo2026", 12),
      name: "Max Remus",
      dealership: "BoosterVO (admin)",
      role: "admin",
      twilioNumber: "+33159168772",
      forwardPhone: "+33600000000", // À remplacer par le vrai numéro
    },
  });

  // Compte négociant de test
  const nego = await prisma.user.upsert({
    where: { email: "jean.martin@concession-lyon.fr" },
    update: {},
    create: {
      email: "jean.martin@concession-lyon.fr",
      passwordHash: hashSync("demo1234", 12),
      name: "Jean Martin",
      dealership: "Concession Lyon Est",
      role: "negotiant",
      twilioNumber: "+33159168772",
      forwardPhone: "+33600000000", // À remplacer par le vrai numéro
    },
  });

  console.log("Seeded users:", admin.email, nego.email);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
