-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dealership" TEXT NOT NULL,
    "twilioNumber" TEXT,
    "forwardPhone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'negotiant',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Prospect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "vehicleInterest" TEXT,
    "vehiclePrice" REAL,
    "budget" REAL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "appointmentAt" DATETIME,
    "postponedUntil" DATETIME,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Prospect_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CallEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "callSid" TEXT,
    "durationSec" INTEGER,
    "ringSec" INTEGER,
    "fromPhone" TEXT,
    "toPhone" TEXT,
    "prospectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CallEvent_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Prospect_phone_userId_key" ON "Prospect"("phone", "userId");
