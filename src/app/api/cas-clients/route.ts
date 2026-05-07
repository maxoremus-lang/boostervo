import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "../../../lib/prisma";
import { CLICK_COOKIE_NAME } from "../../../lib/linkTracking";

async function sendCasClientsEmail(payload: { firstName: string; email: string; mobile: string; source: string }) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[cas-clients] SMTP non configuré, notification skip");
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

  const mobileRow = payload.mobile
    ? `<tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #555;">Mobile</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #222; font-weight: 700;">
          <a href="tel:${payload.mobile}" style="color: #FF6600; text-decoration: none;">${payload.mobile}</a>
        </td>
      </tr>`
    : "";

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1B4F9B; padding: 20px 30px; border-radius: 8px 8px 0 0;">
        <span style="font-size: 22px; font-weight: 700; color: #fff;">Booster</span><span style="font-size: 22px; font-weight: 700; color: #FF6600;">VO</span>
        <span style="display: block; margin-top: 6px; font-size: 13px; color: rgba(255,255,255,0.8);">Demande 3 cas clients</span>
      </div>
      <div style="background: #fff; padding: 28px 30px; border: 1px solid #eee; border-top: none;">
        <h2 style="color: #1B4F9B; font-size: 18px; margin: 0 0 20px 0;">Un prospect demande à recevoir 3 cas clients</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #555; width: 160px;">Pr&eacute;nom</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #222; font-weight: 700;">${payload.firstName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #555;">Email</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #222; font-weight: 700;">
              <a href="mailto:${payload.email}" style="color: #FF6600; text-decoration: none;">${payload.email}</a>
            </td>
          </tr>
          ${mobileRow}
          <tr>
            <td style="padding: 10px 0; font-weight: 600; color: #555;">Source</td>
            <td style="padding: 10px 0; color: #222;">${payload.source}</td>
          </tr>
        </table>
        <div style="margin-top: 24px; padding: 16px; background: #f0f7ff; border-radius: 6px; border-left: 4px solid #FF6600;">
          <p style="margin: 0; font-size: 14px; color: #333;">
            <strong>Action :</strong> envoyer les 3 cas clients à ce prospect.
          </p>
        </div>
      </div>
      <div style="padding: 16px 30px; background: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center; border: 1px solid #eee; border-top: none;">
        <p style="margin: 0; font-size: 11px; color: #aaa;">BoosterVO &mdash; Mercure SAS &mdash; Email automatique</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"BoosterVO" <${process.env.SMTP_USER}>`,
    to: "lucas@boostervo.fr, max@boostervo.fr, max@boostervo.com",
    subject: `Demande 3 cas clients — ${payload.firstName} (${payload.email})`,
    html: htmlBody,
  });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const mobile = typeof body.mobile === "string" ? body.mobile.trim() : "";
  const source = typeof body.source === "string" ? body.source.trim() : "signup";

  if (!firstName) {
    return NextResponse.json({ error: "Prénom obligatoire" }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }
  if (mobile && mobile.replace(/\D/g, "").length < 8) {
    return NextResponse.json({ error: "Mobile invalide" }, { status: 400 });
  }

  try {
    await sendCasClientsEmail({ firstName, email, mobile, source });
  } catch (err) {
    console.error("[cas-clients] envoi mail échoué:", err);
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
  }

  const cookieId = req.cookies.get(CLICK_COOKIE_NAME)?.value;
  if (cookieId) {
    try {
      const firstClick = await prisma.linkClick.findFirst({
        where: { cookieId, convertedAt: null },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });
      if (firstClick) {
        await prisma.linkClick.update({
          where: { id: firstClick.id },
          data: { convertedAt: new Date() },
        });
      }
    } catch (err) {
      console.error("[cas-clients] attribution clic échouée:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
