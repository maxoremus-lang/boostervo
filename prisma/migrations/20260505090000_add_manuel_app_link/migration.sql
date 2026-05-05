-- Ajout du slug "manuel-app" pour tracker les téléchargements du PDF
-- Présentation App Mobile depuis la page signup. Le slug redirige vers le
-- PDF statique servi depuis /public/manuel/. INSERT OR IGNORE pour rester
-- idempotent si la migration est rejouée.
INSERT OR IGNORE INTO "LinkConfig" ("id", "slug", "destination", "label", "active", "createdAt", "updatedAt")
VALUES (
  'link_cfg_manuel_app',
  'manuel-app',
  '/manuel/Presentation-App-Mobile-BoosterVO.pdf',
  'Téléchargement manuel App Mobile (signup)',
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
