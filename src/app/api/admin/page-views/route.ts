import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Non autorisé" }, { status: 401 }) };
  }
  if ((session.user as { role?: string }).role !== "admin") {
    return { error: NextResponse.json({ error: "Accès interdit" }, { status: 403 }) };
  }
  return { session };
}

// Source lisible d'une visite : utm_source en priorité, sinon le domaine du
// referer, sinon "Accès direct".
function sourceOf(row: { utmSource: string | null; referer: string | null }): string {
  if (row.utmSource) return row.utmSource;
  if (row.referer) {
    try {
      const host = new URL(row.referer).hostname.replace(/^www\./, "");
      return host || "Accès direct";
    } catch {
      return row.referer.slice(0, 60);
    }
  }
  return "Accès direct";
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

// GET /api/admin/page-views
// Fréquentation des pages publiques : visites totales, visiteurs uniques,
// évolution sur 14 jours, top sources et répartition par appareil.
export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const rows = await prisma.pageView.findMany({
    select: {
      path: true,
      referer: true,
      utmSource: true,
      device: true,
      visitorId: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalVisits = rows.length;

  // Visiteurs uniques : visitorId distincts + chaque visite sans visitorId.
  const visitorSet = new Set<string>();
  let anon = 0;
  for (const r of rows) {
    if (r.visitorId) visitorSet.add(r.visitorId);
    else anon++;
  }
  const uniqueVisitors = visitorSet.size + anon;

  // Évolution sur 14 jours (du plus ancien au plus récent).
  const days: { date: string; visits: number; unique: number }[] = [];
  const dayIndex = new Map<string, number>();
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = dayKey(d);
    dayIndex.set(key, days.length);
    days.push({ date: key, visits: 0, unique: 0 });
  }
  const daySeen: Map<string, Set<string>> = new Map();
  for (const r of rows) {
    const key = dayKey(new Date(r.createdAt));
    const idx = dayIndex.get(key);
    if (idx === undefined) continue;
    days[idx].visits++;
    let seen = daySeen.get(key);
    if (!seen) {
      seen = new Set();
      daySeen.set(key, seen);
    }
    const vid = r.visitorId ?? `anon-${days[idx].visits}`;
    if (!seen.has(vid)) {
      seen.add(vid);
      days[idx].unique++;
    }
  }

  // Top sources.
  const sourceCount = new Map<string, number>();
  for (const r of rows) {
    const s = sourceOf(r);
    sourceCount.set(s, (sourceCount.get(s) ?? 0) + 1);
  }
  const topSources = Array.from(sourceCount.entries())
    .map(([source, visits]) => ({ source, visits }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 8);

  // Répartition par appareil.
  const deviceCount = new Map<string, number>();
  for (const r of rows) {
    const d = r.device ?? "inconnu";
    deviceCount.set(d, (deviceCount.get(d) ?? 0) + 1);
  }
  const byDevice = Array.from(deviceCount.entries())
    .map(([device, visits]) => ({ device, visits }))
    .sort((a, b) => b.visits - a.visits);

  return NextResponse.json({
    totalVisits,
    uniqueVisitors,
    days,
    topSources,
    byDevice,
  });
}
