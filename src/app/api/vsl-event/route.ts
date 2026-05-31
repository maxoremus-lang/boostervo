import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { CLICK_COOKIE_NAME } from "../../../lib/linkTracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TYPES = new Set(["play", "p25", "p50", "p75", "p100"]);
const VALID_PAGES = new Set(["vsl", "vsl-prive"]);

// POST /api/vsl-event — enregistre un jalon de lecture d'une VSL (play, 25/50/
// 75/100 %). Appelé en sendBeacon depuis <VslPlayer>. Relie au visiteur via le
// cookie bvo_clk (slug de campagne) + visitorId stable côté client.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const visitorId = typeof data.visitorId === "string" ? data.visitorId.trim().slice(0, 64) : "";
  const page = typeof data.page === "string" ? data.page : "";
  const type = typeof data.type === "string" ? data.type : "";
  const positionSec = typeof data.positionSec === "number" ? data.positionSec : null;
  const durationSec = typeof data.durationSec === "number" ? data.durationSec : null;

  if (!visitorId || !VALID_PAGES.has(page) || !VALID_TYPES.has(type)) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
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
      console.error("[vsl-event] résolution slug échouée:", err);
    }
  }

  try {
    await prisma.vslEvent.create({
      data: { visitorId, cookieId, slug, page, type, positionSec, durationSec },
    });
  } catch (err) {
    console.error("[vsl-event] création événement échouée:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
