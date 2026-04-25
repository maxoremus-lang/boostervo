-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "mobile" TEXT,
    "website" TEXT,
    "dealership" TEXT,
    "twilioNumber" TEXT,
    "forwardPhone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'negotiant',
    "notificationSound" TEXT NOT NULL DEFAULT 'cloche',
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "averageMarginVo" REAL NOT NULL DEFAULT 800,
    "publicationMode" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("averageMarginVo", "createdAt", "dealership", "email", "firstName", "forwardPhone", "id", "lastName", "mobile", "name", "notificationSound", "passwordHash", "role", "soundEnabled", "twilioNumber", "updatedAt", "website") SELECT "averageMarginVo", "createdAt", "dealership", "email", "firstName", "forwardPhone", "id", "lastName", "mobile", "name", "notificationSound", "passwordHash", "role", "soundEnabled", "twilioNumber", "updatedAt", "website" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
