-- Ajout d'un champ `source` à ReportExampleClick pour distinguer les clics
-- provenant de la home (simulateur) vs page tarifs (Pack Diagnostic).

ALTER TABLE "ReportExampleClick" ADD COLUMN "source" TEXT;

-- Index pour requêtes agrégées par source
CREATE INDEX "ReportExampleClick_source_idx" ON "ReportExampleClick"("source");
