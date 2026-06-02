import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { CLICK_COOKIE_NAME, parseUserAgent } from "../../../lib/linkTracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const str = (v: unknown, max: number): string | null =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

// POST /api/page-view — enregistre une visite d'une page publique de
// boostervo.fr (beacon client au chargement). Mesure la fréquentation :
// visites + visiteurs uniques (dédup visitorId) + source (referer/UTM).
// cookieId (bvo_clk) = attribution campagne si le visiteur vient d'un /go….
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const path = str(data.path, 200) ?? "/";
  // On ignore les chemins de l'appli (déjà trackés autrement / privés).
  if (path.startsWith("/app")) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { device, browser, os } = parseUserAgent(req.headers.get("user-agent"));
  const cookieId = req.cookies.get(CLICK_COOKIE_NAME)?.value || null;

  try {
    await prisma.pageView.create({
      data: {
        path,
        referer: str(data.referer, 300),
        utmSource: str(data.utmSource, 100),
        utmMedium: str(data.utmMedium, 100),
        utmCampaign: str(data.utmCampaign, 100),
        device,
        browser,
        os,
        visitorId: str(data.visitorId, 64),
        cookieId,
      },
    });
  } catch (err) {
    console.error("[page-view] création échouée:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
