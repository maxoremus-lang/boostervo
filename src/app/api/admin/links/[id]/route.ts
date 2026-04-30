import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";

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

// PATCH /api/admin/links/:id — édite label / destination / actif
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Body invalide" }, { status: 400 });

  const data: { label?: string | null; destination?: string; active?: boolean } = {};
  if (typeof body.label === "string") {
    const trimmed = body.label.trim();
    data.label = trimmed === "" ? null : trimmed;
  }
  if (typeof body.destination === "string" && body.destination.trim()) {
    data.destination = body.destination.trim();
  }
  if (typeof body.active === "boolean") {
    data.active = body.active;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour" }, { status: 400 });
  }

  const link = await prisma.linkConfig.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json(link);
}

// GET /api/admin/links/:id — détail + 50 derniers clics
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const link = await prisma.linkConfig.findUnique({
    where: { id: params.id },
  });
  if (!link) return NextResponse.json({ error: "Lien introuvable" }, { status: 404 });

  const recentClicks = await prisma.linkClick.findMany({
    where: { linkConfigId: link.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      createdAt: true,
      device: true,
      browser: true,
      os: true,
      referer: true,
      ip: true,
      convertedAt: true,
      user: { select: { email: true, dealership: true } },
    },
  });

  return NextResponse.json({ link, recentClicks });
}
