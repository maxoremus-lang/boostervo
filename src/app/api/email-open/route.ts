import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { extractIp } from "../../../lib/linkTracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GIF transparent 1x1 (43 octets).
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

function gifResponse() {
  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": String(PIXEL.length),
      // Empêche la mise en cache pour compter les ouvertures répétées
      // (les proxys email cachent quand même parfois — cf. doc).
      "Cache-Control": "no-store, no-cache, must-revalidate, private, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

// GET /api/email-open?c=<campagne>&r=<email destinataire>
// Pixel de tracking d'ouverture d'email. Renvoie TOUJOURS un GIF 1x1 (même si
// l'enregistrement échoue) pour ne jamais casser l'affichage de l'email.
export async function GET(req: NextRequest) {
  const c = req.nextUrl.searchParams.get("c");
  const campaign = (c || "").trim().slice(0, 120) || "(sans campagne)";
  const rRaw = req.nextUrl.searchParams.get("r");
  const recipient = rRaw ? rRaw.trim().slice(0, 160) : null;

  try {
    await prisma.emailOpen.create({
      data: {
        campaign,
        recipient,
        userAgent: req.headers.get("user-agent")?.slice(0, 300) || null,
        ip: extractIp(req.headers),
      },
    });
  } catch (err) {
    // Best-effort : on logge mais on renvoie quand même le pixel.
    console.error("[email-open] enregistrement échoué:", err);
  }

  return gifResponse();
}
