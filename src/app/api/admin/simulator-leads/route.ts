import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Non autorisé" }, { status: 401 }) };
  }
  if ((session.user as { role?: string }).role !== "admin") {
    return { error: NextResponse.json({ error: "Accès interdit" }, { status: 403 }) };
  }
  return { session };
}

// GET /api/admin/simulator-leads
// Liste des leads captés par le simulateur "Combien mes appels me coûtent /
// rapportent" (pop-up home), du plus récent au plus ancien.
export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const leads = await prisma.simulatorLead.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      branch: true,
      appels: true,
      manques: true,
      decrochesImmediats: true,
      delayLabel: true,
      margeVo: true,
      convMoyenne: true,
      ventesTotalActuel: true,
      margeTotalActuel: true,
      gainVentesMois: true,
      gainMargeMois: true,
      gainMargeAn: true,
      slug: true,
      createdAt: true,
    },
  });

  return NextResponse.json(leads);
}
