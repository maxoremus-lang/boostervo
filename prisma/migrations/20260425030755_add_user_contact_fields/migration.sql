-- AlterTable
ALTER TABLE "User" ADD COLUMN "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN "lastName" TEXT;
ALTER TABLE "User" ADD COLUMN "mobile" TEXT;
ALTER TABLE "User" ADD COLUMN "website" TEXT;

-- Backfill firstName / lastName à partir du champ "name" existant.
-- Split sur le 1er espace : "Jean Martin" → ("Jean", "Martin").
-- Si pas d'espace : firstName = name complet, lastName vide.
UPDATE "User"
SET
  "firstName" = CASE
    WHEN INSTR("name", ' ') > 0 THEN SUBSTR("name", 1, INSTR("name", ' ') - 1)
    ELSE "name"
  END,
  "lastName" = CASE
    WHEN INSTR("name", ' ') > 0 THEN TRIM(SUBSTR("name", INSTR("name", ' ') + 1))
    ELSE ''
  END
WHERE "firstName" IS NULL;
