-- LinkClick.cookieId devient l'identifiant du visiteur (non-unique).
-- Plusieurs clics d'un même visiteur partagent désormais ce cookieId, ce
-- qui permet de reconstruire son parcours (clic SMS → clic manuel →
-- inscription). On supprime l'unique index existant et on le remplace par
-- un index simple pour garder de bonnes perfs sur les lookups d'attribution.

DROP INDEX IF EXISTS "LinkClick_cookieId_key";

CREATE INDEX IF NOT EXISTS "LinkClick_cookieId_idx" ON "LinkClick"("cookieId");
