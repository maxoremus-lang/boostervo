-- CreateTable
CREATE TABLE "VslLead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "slug" TEXT,
    "cookieId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "VslLead_email_idx" ON "VslLead"("email");

-- CreateIndex
CREATE INDEX "VslLead_createdAt_idx" ON "VslLead"("createdAt");
