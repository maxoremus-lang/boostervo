import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { CLICK_COOKIE_NAME, extractIp } from "../../../lib/linkTracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Sources valides pour ce tracker. "home" = lien dans la section diagnostic
// de la page d'accueil ; "tarifs" = lien dans le Pack Diagnostic de /tarifs.
const ALLOWED_SOURCES = new Set(["home", "tarifs"]);

function normalizeSource(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const v = input.trim().toLowerCase();
  return ALLOWED_SOURCES.has(v) ? v : null;
}

// POST /api/report-example-click — appelé quand un visiteur clique sur le lien
// "Cliquez ici pour un exemple de rapport" (home OU page tarifs). Le body JSON
// peut contenir { source: "home" | "tarifs" } — best-effort.
export async function POST(req: NextRequest) {
  const cookieId = req.cookies.get(CLICK_COOKIE_NAME)?.value || null;
  const ip = extractIp(req.headers);
  const userAgent = req.headers.get("user-agent");

  let source: string | null = null;
  try {
    // Body parsing tolérant : sendBeacon envoie souvent du JSON brut, fetch en JSON.
    const body = await req.json().catch(() => null);
    if (body && typeof body === "object") {
      source = normalizeSource((body as { source?: unknown }).source);
    }
  } catch {
    // Pas de body / parse échoué : on garde source = null (clic non typé).
  }

  try {
    await prisma.reportExampleClick.create({
      data: { cookieId, ip, userAgent, source },
    });
  } catch (err) {
    console.error("[report-example-click] création échouée:", err);
    // Non-bloquant : un clic perdu ne doit pas casser l'UX.
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  return NextResponse.json({ ok: true });
}

// GET /api/report-example-click — compteur (admin only) : total des clics,
// visiteurs uniques (cookieId distinct) et breakdown par source.
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

  // Breakdown par source : home, tarifs, ou non typé (null).
  const grouped = await prisma.reportExampleClick.groupBy({
    by: ["source"],
    _count: { _all: true },
  });
  const bySource: Record<string, number> = {};
  for (const row of grouped) {
    bySource[row.source ?? "untyped"] = row._count._all;
  }

  return NextResponse.json({
    total,
    uniqueVisitors: distinct.length,
    bySource,
  });
}
