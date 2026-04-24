import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "../../../lib/prisma";

/**
 * POST /api/signup
 * Inscription publique d'un nouveau négociant.
 * Champs obligatoires : email, password, name, dealership, averageMarginVo.
 * forwardPhone et twilioNumber sont renseignés plus tard via le Profil.
 */
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const dealership = typeof body.dealership === "string" ? body.dealership.trim() : "";
  const averageMarginVoRaw = body.averageMarginVo;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Le mot de passe doit faire au moins 8 caractères" }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: "Nom obligatoire" }, { status: 400 });
  }
  if (!dealership) {
    return NextResponse.json({ error: "Concession obligatoire" }, { status: 400 });
  }
  const averageMarginVo = typeof averageMarginVoRaw === "number" ? averageMarginVoRaw : parseFloat(averageMarginVoRaw);
  if (!Number.isFinite(averageMarginVo) || averageMarginVo <= 0) {
    return NextResponse.json({ error: "Marge moyenne par VO invalide" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 409 });
  }

  const passwordHash = await hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, dealership, averageMarginVo },
  });

  return NextResponse.json({ ok: true, userId: user.id });
}
