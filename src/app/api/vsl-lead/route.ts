import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { CLICK_COOKIE_NAME } from "../../../lib/linkTracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/vsl-lead — capte un lead (prénom + email) sur la VSL "gate email"
// (/vsl-prive). Stocke le lead, relie au visiteur via le cookie bvo_clk, et
// crédite le clic d'origine (go9) comme converti pour l'attribution A/B.
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

  if (!firstName) {
    return NextResponse.json({ error: "Prénom obligatoire" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  const cookieId = req.cookies.get(CLICK_COOKIE_NAME)?.value || null;

  // Slug source = dernier lien court emprunté par ce visiteur (ex: "go9").
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
      console.error("[vsl-lead] résolution slug échouée:", err);
    }
  }

  try {
    await prisma.vslLead.create({
      data: { firstName, email, slug, cookieId },
    });
  } catch (err) {
    console.error("[vsl-lead] création lead échouée:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  // Attribution first-touch : crédite le premier clic non-converti du visiteur.
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
      console.error("[vsl-lead] attribution clic échouée:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
