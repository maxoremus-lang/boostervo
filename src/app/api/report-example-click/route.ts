import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { CLICK_COOKIE_NAME, extractIp } from "../../../lib/linkTracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/report-example-click — appelé quand un visiteur clique sur le lien
// "Cliquez ici pour avoir un exemple de rapport" (home). Enregistre une ligne
// best-effort : on compte l'intérêt en attendant que le document existe.
export async function POST(req: NextRequest) {
  const cookieId = req.cookies.get(CLICK_COOKIE_NAME)?.value || null;
  const ip = extractIp(req.headers);
  const userAgent = req.headers.get("user-agent");

  try {
    await prisma.reportExampleClick.create({
      data: { cookieId, ip, userAgent },
    });
  } catch (err) {
    console.error("[report-example-click] création échouée:", err);
    // Non-bloquant : un clic perdu ne doit pas casser l'UX.
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  return NextResponse.json({ ok: true });
}

// GET /api/report-example-click — compteur (admin only) : total des clics et
// nombre de visiteurs uniques (cookieId distinct).
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if ((session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  const total = await prisma.reportExampleClick.count();
  const distinct = await prisma.reportExampleClick.findMany({
    where: { cookieId: { not: null } },
    distinct: ["cookieId"],
    select: { cookieId: true },
  });

  return NextResponse.json({ total, uniqueVisitors: distinct.length });
}
