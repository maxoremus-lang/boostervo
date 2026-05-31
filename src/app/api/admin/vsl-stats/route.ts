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

const STAGES = ["play", "p25", "p50", "p75", "p100"] as const;
type Stage = (typeof STAGES)[number];

type Funnel = Record<Stage, number>;

function emptyFunnel(): Funnel {
  return { play: 0, p25: 0, p50: 0, p75: 0, p100: 0 };
}

// GET /api/admin/vsl-stats
// Funnel de lecture des VSL : nombre de VISITEURS DISTINCTS ayant atteint chaque
// jalon (play → 25 → 50 → 75 → 100 %), au global et ventilé par campagne (slug)
// et par page. La déduplication se fait sur visitorId (id stable côté client).
export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const events = await prisma.vslEvent.findMany({
    select: { visitorId: true, slug: true, page: true, type: true },
  });

  // Pour chaque jalon, l'ensemble des visiteurs distincts l'ayant atteint —
  // au global, par slug, par page.
  const overall: Record<Stage, Set<string>> = {
    play: new Set(),
    p25: new Set(),
    p50: new Set(),
    p75: new Set(),
    p100: new Set(),
  };
  const bySlug = new Map<string, Record<Stage, Set<string>>>();
  const byPage = new Map<string, Record<Stage, Set<string>>>();

  const ensure = (m: Map<string, Record<Stage, Set<string>>>, key: string) => {
    let v = m.get(key);
    if (!v) {
      v = { play: new Set(), p25: new Set(), p50: new Set(), p75: new Set(), p100: new Set() };
      m.set(key, v);
    }
    return v;
  };

  for (const e of events) {
    if (!STAGES.includes(e.type as Stage)) continue;
    const stage = e.type as Stage;
    overall[stage].add(e.visitorId);
    ensure(bySlug, e.slug ?? "(direct)")[stage].add(e.visitorId);
    ensure(byPage, e.page)[stage].add(e.visitorId);
  }

  const toFunnel = (sets: Record<Stage, Set<string>>): Funnel => {
    const f = emptyFunnel();
    for (const s of STAGES) f[s] = sets[s].size;
    return f;
  };

  return NextResponse.json({
    overall: toFunnel(overall),
    bySlug: Array.from(bySlug.entries())
      .map(([slug, sets]) => ({ slug, ...toFunnel(sets) }))
      .sort((a, b) => b.play - a.play),
    byPage: Array.from(byPage.entries())
      .map(([page, sets]) => ({ page, ...toFunnel(sets) }))
      .sort((a, b) => b.play - a.play),
  });
}
