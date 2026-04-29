import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import nodemailer from "nodemailer";
import { prisma } from "../../../lib/prisma";

async function sendSignupNotification(payload: {
  firstName: string;
  lastName: string;
  dealership: string;
  mobile: string;
  email: string;
  website: string | null;
  averageMarginVo: number;
  publicationMode: string;
}) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[signup] SMTP non configuré, notification skip");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "https://boostervo.fr";
  const adminUrl = `${baseUrl}/app/admin/users`;
  const publicationLabel = payload.publicationMode === "auto" ? "Automatique" : "Manuelle";

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1B4F9B; padding: 20px 30px; border-radius: 8px 8px 0 0;">
        <span style="font-size: 22px; font-weight: 700; color: #fff;">Booster</span><span style="font-size: 22px; font-weight: 700; color: #FF6600;">VO</span>
        <span style="display: block; margin-top: 6px; font-size: 13px; color: rgba(255,255,255,0.8);">Nouvelle inscription b&ecirc;ta</span>
      </div>
      <div style="background: #fff; padding: 28px 30px; border: 1px solid #eee; border-top: none;">
        <h2 style="color: #1B4F9B; font-size: 18px; margin: 0 0 20px 0;">Un n&eacute;gociant vient de cr&eacute;er son compte</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #555; width: 160px;">Pr&eacute;nom</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #222;">${payload.firstName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #555;">Nom</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #222;">${payload.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #555;">Concession</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #222; font-weight: 700;">${payload.dealership}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #555;">Mobile</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #222;">${payload.mobile}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #555;">Email</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #1B4F9B;">${payload.email}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #555;">Site web</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #222;">${payload.website || "&mdash;"}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #555;">Marge moyenne VO</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #222;">${payload.averageMarginVo} &euro;</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: 600; color: #555;">Publication leboncoin</td>
            <td style="padding: 10px 0; color: #222;">${publicationLabel}</td>
          </tr>
        </table>
        <div style="margin-top: 24px; padding: 16px; background: #f0f7ff; border-radius: 6px; border-left: 4px solid #FF6600;">
          <p style="margin: 0 0 12px; font-size: 14px; color: #333;">
            <strong>Action requise :</strong> provisionner un num&eacute;ro Twilio et l&apos;assigner au compte pour activer l&apos;app.
          </p>
          <a href="${adminUrl}" style="display: inline-block; padding: 10px 20px; background: #FF6600; color: #fff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 700;">
            Activer le compte &rarr;
          </a>
        </div>
      </div>
      <div style="padding: 16px 30px; background: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center; border: 1px solid #eee; border-top: none;">
        <p style="margin: 0; font-size: 11px; color: #aaa;">BoosterVO &mdash; Mercure SAS &mdash; Email automatique</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"BoosterVO" <${process.env.SMTP_USER}>`,
    to: "lucas@boostervo.fr, max@boostervo.fr",
    subject: `Nouvelle inscription b\u00EAta \u2014 ${payload.firstName} ${payload.lastName} (${payload.dealership})`,
    html: htmlBody,
    replyTo: payload.email,
  });
}

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

  // Notification mail aux admins (non bloquant pour le signup)
  try {
    await sendSignupNotification({
      firstName,
      lastName,
      dealership,
      mobile,
      email,
      website: website || null,
      averageMarginVo,
      publicationMode,
    });
  } catch (err) {
    console.error("[signup] envoi notification mail échoué:", err);
  }

  return NextResponse.json({ ok: true, userId: user.id });
}
