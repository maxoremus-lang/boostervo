import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "../../../lib/prisma";
import { CLICK_COOKIE_NAME } from "../../../lib/linkTracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fmtEUR(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n));
}
function fmtVentes(n: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(n);
}

async function sendNotification(lead: {
  email: string;
  branch: string | null;
  appels: number;
  manques: number;
  decrochesImmediats: number;
  delayLabel: string;
  margeVo: number;
  convMoyenne: number;
  ventesTotalActuel: number;
  margeTotalActuel: number;
  gainVentesMois: number;
  gainMargeMois: number;
  gainMargeAn: number;
  slug: string | null;
  source: string;
}) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[simulator-lead] SMTP non configuré, notification skip");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const origin = lead.slug ? `lien /${lead.slug}` : lead.source || "simulateur home";
  const row = (label: string, value: string) =>
    `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-weight:600;color:#555;width:230px;">${label}</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#222;font-weight:700;">${value}</td></tr>`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto;">
      <div style="background: #1B4F9B; padding: 20px 30px; border-radius: 8px 8px 0 0;">
        <span style="font-size: 22px; font-weight: 700; color: #fff;">Booster</span><span style="font-size: 22px; font-weight: 700; color: #FF6600;">VO</span>
        <span style="display: block; margin-top: 6px; font-size: 13px; color: rgba(255,255,255,0.8);">Nouveau lead — Simulateur d'appels</span>
      </div>
      <div style="background: #fff; padding: 28px 30px; border: 1px solid #eee; border-top: none;">
        <h2 style="color: #1B4F9B; font-size: 18px; margin: 0 0 20px 0;">Un visiteur a complété le simulateur</h2>
        <table style="width: 100%; border-collapse: collapse;">
          ${row("Email", `<a href="mailto:${lead.email}" style="color:#FF6600;text-decoration:none;">${lead.email}</a>`)}
          ${row("Appels traités / mois", String(lead.appels))}
          ${row("Décrochés immédiatement", String(lead.decrochesImmediats))}
          ${row("Appels manqués / mois", String(lead.manques))}
          ${row("Délai moyen de rappel", lead.delayLabel)}
          ${row("Marge moyenne par VO", `${fmtEUR(lead.margeVo)} €`)}
          ${row("Taux de conversion moyen", `${Math.round(lead.convMoyenne * 100)} %`)}
          ${row("Ventes générées (actuel)", `${fmtVentes(lead.ventesTotalActuel)} / mois`)}
          ${row("Marge générée (actuel)", `${fmtEUR(lead.margeTotalActuel)} € / mois`)}
        </table>
        <div style="margin-top: 24px; padding: 16px; background: #fff7ed; border-radius: 6px; border-left: 4px solid #FF6600;">
          <p style="margin: 0 0 6px 0; font-size: 14px; color: #333;"><strong>Gain estimé avec traitement immédiat :</strong></p>
          <p style="margin: 0; font-size: 14px; color: #333;">
            + ${fmtVentes(lead.gainVentesMois)} vente / mois &nbsp;·&nbsp;
            + ${fmtEUR(lead.gainMargeMois)} € / mois &nbsp;·&nbsp;
            <strong>+ ${fmtEUR(lead.gainMargeAn)} € / an</strong>
          </p>
        </div>
        <p style="margin: 20px 0 0 0; font-size: 13px; color: #777;">Source : ${origin}${lead.branch ? ` · branche ${lead.branch}` : ""}</p>
      </div>
      <div style="padding: 16px 30px; background: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center; border: 1px solid #eee; border-top: none;">
        <p style="margin: 0; font-size: 11px; color: #aaa;">BoosterVO &mdash; Mercure SAS &mdash; Email automatique</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"BoosterVO" <${process.env.SMTP_USER}>`,
    to: "lucas@boostervo.fr, max@boostervo.fr, max@boostervo.com",
    subject: `Lead simulateur — ${lead.email} (+ ${fmtEUR(lead.gainMargeAn)} €/an estimés)`,
    html: htmlBody,
  });
}

// Coerce vers un nombre fini >= 0, sinon fallback.
function num(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : fallback;
}

// POST /api/simulator-lead — pop-up "Combien mes appels me coûtent/rapportent"
// (home). Enregistre l'email + les réponses + le résultat du calcul, résout le
// lien source via le cookie bvo_clk, et notifie l'équipe par email. L'email est
// best-effort : le lead reste enregistré même si l'envoi échoue.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  const branch = typeof data.branch === "string" ? data.branch.trim().slice(0, 4) : null;
  const delayLabel = typeof data.delayLabel === "string" ? data.delayLabel.trim().slice(0, 40) : "";
  const source = typeof data.source === "string" ? data.source.trim().slice(0, 120) : "simulateur home";

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
      console.error("[simulator-lead] résolution slug échouée:", err);
    }
  }

  const lead = {
    email,
    branch,
    appels: Math.round(num(data.appels)),
    manques: Math.round(num(data.manques)),
    decrochesImmediats: Math.round(num(data.decrochesImmediats)),
    delayLabel,
    margeVo: Math.round(num(data.margeVo)),
    convMoyenne: num(data.convMoyenne),
    convImmediate: num(data.convImmediate),
    convRappels: num(data.convRappels),
    ventesTotalActuel: num(data.ventesTotalActuel),
    margeTotalActuel: Math.round(num(data.margeTotalActuel)),
    ventesTotalPotentiel: num(data.ventesTotalPotentiel),
    margeTotalPotentiel: Math.round(num(data.margeTotalPotentiel)),
    gainVentesMois: num(data.gainVentesMois),
    gainMargeMois: Math.round(num(data.gainMargeMois)),
    gainMargeAn: Math.round(num(data.gainMargeAn)),
    slug,
    cookieId,
    source,
  };

  try {
    await prisma.simulatorLead.create({ data: lead });
  } catch (err) {
    console.error("[simulator-lead] création échouée:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  try {
    await sendNotification(lead);
  } catch (err) {
    console.error("[simulator-lead] envoi mail échoué:", err);
    // Non-bloquant : le lead est déjà enregistré.
  }

  return NextResponse.json({ ok: true });
}
