import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "../../../lib/prisma";
import { CLICK_COOKIE_NAME } from "../../../lib/linkTracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function sendNotification(payload: {
  firstName: string;
  email: string;
  slug: string | null;
  source: string;
}) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[diagnostic-request] SMTP non configuré, notification skip");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const origin = payload.slug ? `lien /${payload.slug}` : payload.source || "page VSL";
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1B4F9B; padding: 20px 30px; border-radius: 8px 8px 0 0;">
        <span style="font-size: 22px; font-weight: 700; color: #fff;">Booster</span><span style="font-size: 22px; font-weight: 700; color: #FF6600;">VO</span>
        <span style="display: block; margin-top: 6px; font-size: 13px; color: rgba(255,255,255,0.8);">Nouvelle demande de diagnostic</span>
      </div>
      <div style="background: #fff; padding: 28px 30px; border: 1px solid #eee; border-top: none;">
        <h2 style="color: #1B4F9B; font-size: 18px; margin: 0 0 20px 0;">Un prospect souhaite une présentation (20 min)</h2>
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
          <tr>
            <td style="padding: 10px 0; font-weight: 600; color: #555;">Source</td>
            <td style="padding: 10px 0; color: #222;">${origin}</td>
          </tr>
        </table>
        <div style="margin-top: 24px; padding: 16px; background: #f0f7ff; border-radius: 6px; border-left: 4px solid #FF6600;">
          <p style="margin: 0; font-size: 14px; color: #333;">
            <strong>Action :</strong> recontacter ce prospect pour planifier la pr&eacute;sentation du diagnostic.
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
    subject: `Demande de diagnostic — ${payload.firstName} (${payload.email})`,
    html: htmlBody,
  });
}

// POST /api/diagnostic-request — CTA "Découvrir le diagnostic" sur les pages
// VSL. Stocke la demande (prénom + email), résout le lien source via le cookie
// bvo_clk, et notifie l'équipe par email. L'email est best-effort : la demande
// reste enregistrée même si l'envoi échoue.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const firstName = typeof data.firstName === "string" ? data.firstName.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const source = typeof data.source === "string" ? data.source.trim() : "";

  if (!firstName) {
    return NextResponse.json({ error: "Prénom obligatoire" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  const cookieId = req.cookies.get(CLICK_COOKIE_NAME)?.value || null;

  let slug: string | null = null;
  if (cookieId) {
    try {
      const lastClick = await prisma.linkClick.findFirst({
        where: { cookieId },
        orderBy: { createdAt: "desc" },
        select: { linkConfig: { select: { slug: true } } },
      });
      slug = lastClick?.linkConfig.slug ?? null;
    } catch (err) {
      console.error("[diagnostic-request] résolution slug échouée:", err);
    }
  }

  try {
    await prisma.diagnosticRequest.create({
      data: { firstName, email, slug, cookieId },
    });
  } catch (err) {
    console.error("[diagnostic-request] création échouée:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  try {
    await sendNotification({ firstName, email, slug, source });
  } catch (err) {
    console.error("[diagnostic-request] envoi mail échoué:", err);
    // Non-bloquant : la demande est déjà enregistrée.
  }

  return NextResponse.json({ ok: true });
}
