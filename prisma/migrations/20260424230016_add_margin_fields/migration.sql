-- AlterTable
ALTER TABLE "Prospect" ADD COLUMN "saleMargin" REAL;
ALTER TABLE "Prospect" ADD COLUMN "salePrice" REAL;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dealership" TEXT,
    "twilioNumber" TEXT,
    "forwardPhone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'negotiant',
    "notificationSound" TEXT NOT NULL DEFAULT 'cloche',
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "averageMarginVo" REAL NOT NULL DEFAULT 800,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "dealership", "email", "forwardPhone", "id", "name", "notificationSound", "passwordHash", "role", "soundEnabled", "twilioNumber", "updatedAt") SELECT "createdAt", "dealership", "email", "forwardPhone", "id", "name", "notificationSound", "passwordHash", "role", "soundEnabled", "twilioNumber", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
