import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "../../../lib/prisma";

/**
 * POST /api/signup
 * Inscription publique d'un nouveau négociant.
 * Obligatoires : email, password, firstName, lastName, dealership, mobile,
 *                averageMarginVo, publicationMode.
 * Optionnels  : website, twilioNumber (tracking), forwardPhone (n° leboncoin).
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
  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
  const dealership = typeof body.dealership === "string" ? body.dealership.trim() : "";
  const mobile = typeof body.mobile === "string" ? body.mobile.trim() : "";
  const website = typeof body.website === "string" ? body.website.trim() : "";
  const twilioNumber = typeof body.twilioNumber === "string" ? body.twilioNumber.trim() : "";
  const forwardPhone = typeof body.forwardPhone === "string" ? body.forwardPhone.trim() : "";
  const averageMarginVoRaw = body.averageMarginVo;
  const publicationMode = typeof body.publicationMode === "string" ? body.publicationMode : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Le mot de passe doit faire au moins 8 caractères" }, { status: 400 });
  }
  if (!firstName) {
    return NextResponse.json({ error: "Prénom obligatoire" }, { status: 400 });
  }
  if (!lastName) {
    return NextResponse.json({ error: "Nom obligatoire" }, { status: 400 });
  }
  if (!dealership) {
    return NextResponse.json({ error: "Concession obligatoire" }, { status: 400 });
  }
  if (!mobile) {
    return NextResponse.json({ error: "Mobile obligatoire" }, { status: 400 });
  }
  const averageMarginVo = typeof averageMarginVoRaw === "number" ? averageMarginVoRaw : parseFloat(averageMarginVoRaw);
  if (!Number.isFinite(averageMarginVo) || averageMarginVo <= 0) {
    return NextResponse.json({ error: "Marge moyenne par VO invalide" }, { status: 400 });
  }
  if (!["manual", "auto"].includes(publicationMode)) {
    return NextResponse.json({ error: "Mode de publication obligatoire" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 409 });
  }

  const passwordHash = await hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      // name conservé pour rétro-compat (NextAuth, profil) — dérivé de firstName + lastName.
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      dealership,
      mobile,
      website: website || null,
      twilioNumber: twilioNumber || null,
      forwardPhone: forwardPhone || null,
      averageMarginVo,
      publicationMode,
    },
  });

  return NextResponse.json({ ok: true, userId: user.id });
}
