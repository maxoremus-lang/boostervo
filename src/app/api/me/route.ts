import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

const VALID_SOUNDS = ["cloche", "sonnette"] as const;
const PHONE_REGEX = /^\+\d{8,15}$/;

function normalizePhone(raw: string): string {
  return raw.replace(/[\s.\-()]/g, "");
}

/**
 * GET /api/me
 * Retourne le profil complet du user connecté.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      dealership: true,
      twilioNumber: true,
      forwardPhone: true,
      role: true,
      notificationSound: true,
      soundEnabled: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User introuvable" }, { status: 404 });
  }

  return NextResponse.json(user);
}

/**
 * PATCH /api/me
 * Met à jour les préférences du user connecté.
 * Body: {
 *   notificationSound?: "cloche"|"sonnette",
 *   soundEnabled?: boolean,
 *   twilioNumber?: string | null,   // "" ou null efface
 *   forwardPhone?: string | null,   // "" ou null efface
 * }
 */
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const body = await req.json().catch(() => ({}));

  const data: {
    notificationSound?: string;
    soundEnabled?: boolean;
    twilioNumber?: string | null;
    forwardPhone?: string | null;
  } = {};
  if (typeof body.notificationSound === "string") {
    if (!VALID_SOUNDS.includes(body.notificationSound)) {
      return NextResponse.json({ error: "Son invalide" }, { status: 400 });
    }
    data.notificationSound = body.notificationSound;
  }
  if (typeof body.soundEnabled === "boolean") {
    data.soundEnabled = body.soundEnabled;
  }

  for (const field of ["twilioNumber", "forwardPhone"] as const) {
    if (field in body) {
      const raw = body[field];
      if (raw === null || (typeof raw === "string" && raw.trim() === "")) {
        data[field] = null;
        continue;
      }
      if (typeof raw !== "string") {
        return NextResponse.json({ error: `${field} invalide` }, { status: 400 });
      }
      const normalized = normalizePhone(raw.trim());
      if (!PHONE_REGEX.test(normalized)) {
        return NextResponse.json(
          { error: "Numéro invalide (format attendu : +33XXXXXXXXX)" },
          { status: 400 },
        );
      }
      data[field] = normalized;
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Aucun champ valide" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      notificationSound: true,
      soundEnabled: true,
      twilioNumber: true,
      forwardPhone: true,
    },
  });

  return NextResponse.json(user);
}
