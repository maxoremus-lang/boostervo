-- CreateTable
CREATE TABLE "ReportExampleClick" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cookieId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ReportExampleClick_createdAt_idx" ON "ReportExampleClick"("createdAt");
