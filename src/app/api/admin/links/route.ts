import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Non autorisé" }, { status: 401 }) };
  }
  if ((session.user as any).role !== "admin") {
    return { error: NextResponse.json({ error: "Accès interdit" }, { status: 403 }) };
  }
  return { session };
}

// Slug réservé qui n'est pas une "campagne" mais une action secondaire (clic
// sur le bouton télécharger manuel sur la page signup). On l'affiche quand
// même dans la liste pour le compteur de téléchargements, mais on s'en sert
// surtout pour calculer le cross-tab "campagne -> téléchargement manuel".
const MANUEL_SLUG = "manuel-app";

// GET /api/admin/links
// Renvoie la liste des liens courts configurés avec leurs stats agrégées
// (clics totaux, visiteurs uniques, conversions, taux, dernier clic, et
// nb de visiteurs ayant également téléchargé le manuel).
export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const links = await prisma.linkConfig.findMany({
    orderBy: { slug: "asc" },
  });

  // Set des cookieId visiteurs qui ont cliqué sur /manuel-app, utilisé pour
  // le cross-tab "parmi les visiteurs de cette campagne, combien ont
  // aussi téléchargé le manuel ?".
  const manuelLink = links.find((l) => l.slug === MANUEL_SLUG);
  let manuelVisitors = new Set<string>();
  if (manuelLink) {
    const rows = await prisma.linkClick.findMany({
      where: { linkConfigId: manuelLink.id },
      distinct: ["cookieId"],
      select: { cookieId: true },
    });
    manuelVisitors = new Set(rows.map((r) => r.cookieId));
  }

  const stats = await Promise.all(
    links.map(async (link) => {
      const [totalClicks, totalConversions, lastClick, distinctVisitors] = await Promise.all([
        prisma.linkClick.count({ where: { linkConfigId: link.id } }),
        prisma.linkClick.count({
          where: { linkConfigId: link.id, convertedAt: { not: null } },
        }),
        prisma.linkClick.findFirst({
          where: { linkConfigId: link.id },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        }),
        prisma.linkClick.findMany({
          where: { linkConfigId: link.id },
          distinct: ["cookieId"],
          select: { cookieId: true },
        }),
      ]);

      // Nb de visiteurs uniques de ce lien qui ont aussi téléchargé le manuel.
      // Pour /manuel-app lui-même, ça reproduit juste son uniqueVisitors —
      // pas pertinent à afficher, le front masquera la stat dans ce cas.
      const downloadedManuel =
        link.slug === MANUEL_SLUG
          ? distinctVisitors.length
          : distinctVisitors.filter((v) => manuelVisitors.has(v.cookieId)).length;

      return {
        id: link.id,
        slug: link.slug,
        label: link.label,
        destination: link.destination,
        active: link.active,
        smsSent: link.smsSent,
        totalClicks,
        uniqueVisitors: distinctVisitors.length,
        // Taux de clics campagne SMS = visiteurs uniques / SMS envoyés.
        // null si smsSent == 0 (pas de campagne SMS rattachée → on n'affiche pas).
        clickRate: link.smsSent > 0 ? distinctVisitors.length / link.smsSent : null,
        totalConversions,
        conversionRate: totalClicks > 0 ? totalConversions / totalClicks : 0,
        downloadedManuel,
        downloadedManuelRate:
          distinctVisitors.length > 0 ? downloadedManuel / distinctVisitors.length : 0,
        lastClickAt: lastClick?.createdAt ?? null,
      };
    })
  );

  return NextResponse.json(stats);
}
