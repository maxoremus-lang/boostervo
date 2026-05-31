-- CreateTable
CREATE TABLE "VslEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitorId" TEXT NOT NULL,
    "cookieId" TEXT,
    "slug" TEXT,
    "page" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "positionSec" REAL,
    "durationSec" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "VslEvent_visitorId_idx" ON "VslEvent"("visitorId");

-- CreateIndex
CREATE INDEX "VslEvent_type_idx" ON "VslEvent"("type");

-- CreateIndex
CREATE INDEX "VslEvent_slug_idx" ON "VslEvent"("slug");

-- CreateIndex
CREATE INDEX "VslEvent_createdAt_idx" ON "VslEvent"("createdAt");
