-- CreateTable
CREATE TABLE "SimulatorLead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "branch" TEXT,
    "appels" INTEGER NOT NULL,
    "manques" INTEGER NOT NULL,
    "decrochesImmediats" INTEGER NOT NULL,
    "delayLabel" TEXT NOT NULL,
    "margeVo" INTEGER NOT NULL,
    "convMoyenne" REAL NOT NULL,
    "convImmediate" REAL NOT NULL,
    "convRappels" REAL NOT NULL,
    "ventesTotalActuel" REAL NOT NULL,
    "margeTotalActuel" INTEGER NOT NULL,
    "ventesTotalPotentiel" REAL NOT NULL,
    "margeTotalPotentiel" INTEGER NOT NULL,
    "gainVentesMois" REAL NOT NULL,
    "gainMargeMois" INTEGER NOT NULL,
    "gainMargeAn" INTEGER NOT NULL,
    "slug" TEXT,
    "cookieId" TEXT,
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "SimulatorLead_email_idx" ON "SimulatorLead"("email");

-- CreateIndex
CREATE INDEX "SimulatorLead_createdAt_idx" ON "SimulatorLead"("createdAt");
