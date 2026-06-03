-- CreateTable
CREATE TABLE "EmailOpen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaign" TEXT NOT NULL,
    "recipient" TEXT,
    "userAgent" TEXT,
    "ip" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "EmailOpen_campaign_idx" ON "EmailOpen"("campaign");

-- CreateIndex
CREATE INDEX "EmailOpen_createdAt_idx" ON "EmailOpen"("createdAt");
