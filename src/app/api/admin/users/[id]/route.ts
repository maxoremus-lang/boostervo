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

/**
 * PATCH /api/admin/users/[id]
 * Met à jour twilioNumber et/ou forwardPhone d'un utilisateur (admin uniquement).
 * Utilisé pour activer une inscription bêta après provisioning Twilio.
 */
export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Body invalide" }, { status: 400 });

  const data: { twilioNumber?: string | null; forwardPhone?: string | null } = {};

  if (typeof body.twilioNumber === "string") {
    const v = body.twilioNumber.trim();
    data.twilioNumber = v === "" ? null : v;
  }
  if (typeof body.forwardPhone === "string") {
    const v = body.forwardPhone.trim();
    data.forwardPhone = v === "" ? null : v;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id: ctx.params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const user = await prisma.user.update({
    where: { id: ctx.params.id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      mobile: true,
      website: true,
      dealership: true,
      twilioNumber: true,
      forwardPhone: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}
