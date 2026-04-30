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

// GET /api/admin/links
// Renvoie la liste des liens courts configurés avec leurs stats agrégées
// (clics totaux, conversions, taux, date du dernier clic).
export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const links = await prisma.linkConfig.findMany({
    orderBy: { slug: "asc" },
  });

  const stats = await Promise.all(
    links.map(async (link) => {
      const [totalClicks, totalConversions, lastClick] = await Promise.all([
        prisma.linkClick.count({ where: { linkConfigId: link.id } }),
        prisma.linkClick.count({
          where: { linkConfigId: link.id, convertedAt: { not: null } },
        }),
        prisma.linkClick.findFirst({
          where: { linkConfigId: link.id },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        }),
      ]);
      return {
        id: link.id,
        slug: link.slug,
        label: link.label,
        destination: link.destination,
        active: link.active,
        totalClicks,
        totalConversions,
        conversionRate: totalClicks > 0 ? totalConversions / totalClicks : 0,
        lastClickAt: lastClick?.createdAt ?? null,
      };
    })
  );

  return NextResponse.json(stats);
}
