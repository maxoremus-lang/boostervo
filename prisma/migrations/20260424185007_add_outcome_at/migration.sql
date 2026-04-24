-- AlterTable
ALTER TABLE "Prospect" ADD COLUMN "outcomeAt" DATETIME;

-- Backfill : pour les prospects déjà en statut terminal, on utilise updatedAt
-- comme meilleure approximation de la date de transition.
UPDATE "Prospect"
SET "outcomeAt" = "updatedAt"
WHERE "status" IN ('sold', 'appointment', 'test_drive', 'quote_sent', 'not_interested', 'unreachable');
