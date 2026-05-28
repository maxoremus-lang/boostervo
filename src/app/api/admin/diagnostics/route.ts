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

// GET /api/admin/diagnostics
// Liste des demandes de diagnostic (CTA "Découvrir le diagnostic"), du plus
// récent au plus ancien.
export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const requests = await prisma.diagnosticRequest.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      email: true,
      slug: true,
      createdAt: true,
    },
  });

  return NextResponse.json(requests);
}
