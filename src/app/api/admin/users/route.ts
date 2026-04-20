import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { hash } from "bcryptjs";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

const VALID_ROLES = ["admin", "negotiant", "invite", "partenaire"] as const;

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
 * GET /api/admin/users
 * Liste tous les utilisateurs (admin uniquement).
 */
export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      dealership: true,
      twilioNumber: true,
      forwardPhone: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

/**
 * POST /api/admin/users
 * Crée un nouvel utilisateur (admin uniquement).
 * Body: { email, password, name, dealership, twilioNumber?, forwardPhone?, role? }
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Body invalide" }, { status: 400 });

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const dealership =
    typeof body.dealership === "string" && body.dealership.trim() !== ""
      ? body.dealership.trim()
      : null;
  const twilioNumber =
    typeof body.twilioNumber === "string" && body.twilioNumber.trim() !== ""
      ? body.twilioNumber.trim()
      : null;
  const forwardPhone =
    typeof body.forwardPhone === "string" && body.forwardPhone.trim() !== ""
      ? body.forwardPhone.trim()
      : null;
  const role = VALID_ROLES.includes(body.role) ? body.role : "negotiant";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Mot de passe : 8 caractères minimum" }, { status: 400 });
  }
  if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);

  const user = await prisma.user.create({
    data: { email, passwordHash, name, dealership, twilioNumber, forwardPhone, role },
    select: {
      id: true,
      email: true,
      name: true,
      dealership: true,
      twilioNumber: true,
      forwardPhone: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
