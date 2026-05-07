-- Ajoute le compteur "SMS envoyés" sur chaque lien court (saisie manuelle
-- dans l'admin) pour calculer le taux de clics par campagne SMS :
--    taux_clics = uniqueVisitors / smsSent
-- 0 par défaut = lien sans campagne SMS associée (le taux ne s'affiche pas).

ALTER TABLE "LinkConfig" ADD COLUMN "smsSent" INTEGER NOT NULL DEFAULT 0;
