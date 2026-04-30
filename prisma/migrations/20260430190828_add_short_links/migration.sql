-- CreateTable
CREATE TABLE "LinkConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "label" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LinkClick" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cookieId" TEXT NOT NULL,
    "linkConfigId" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "convertedAt" DATETIME,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LinkClick_linkConfigId_fkey" FOREIGN KEY ("linkConfigId") REFERENCES "LinkConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LinkClick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "LinkConfig_slug_key" ON "LinkConfig"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LinkClick_cookieId_key" ON "LinkClick"("cookieId");

-- CreateIndex
CREATE INDEX "LinkClick_linkConfigId_idx" ON "LinkClick"("linkConfigId");

-- CreateIndex
CREATE INDEX "LinkClick_userId_idx" ON "LinkClick"("userId");

-- CreateIndex
CREATE INDEX "LinkClick_createdAt_idx" ON "LinkClick"("createdAt");

-- Seed des 6 liens courts par défaut (campagnes SMS)
INSERT INTO "LinkConfig" ("id", "slug", "destination", "label", "active", "createdAt", "updatedAt")
VALUES
  ('link_cfg_go1', 'go1', '/app/signup', 'Campagne SMS 1', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('link_cfg_go2', 'go2', '/app/signup', 'Campagne SMS 2', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('link_cfg_go3', 'go3', '/app/signup', 'Campagne SMS 3', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('link_cfg_go4', 'go4', '/app/signup', 'Campagne SMS 4', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('link_cfg_go5', 'go5', '/app/signup', 'Campagne SMS 5', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('link_cfg_go6', 'go6', '/app/signup', 'Campagne SMS 6', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
