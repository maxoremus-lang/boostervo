-- CreateTable
CREATE TABLE "DiagnosticRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "slug" TEXT,
    "cookieId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "DiagnosticRequest_email_idx" ON "DiagnosticRequest"("email");

-- CreateIndex
CREATE INDEX "DiagnosticRequest_createdAt_idx" ON "DiagnosticRequest"("createdAt");
