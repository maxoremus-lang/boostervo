import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

type Period = "day" | "week" | "month" | "all";

const ALL_STATUSES = [
  "pending",
  "postponed",
  "unreachable",
  "appointment",
  "test_drive",
  "quote_sent",
  "not_interested",
  "sold",
] as const;

/**
 * GET /api/stats?period=day|week|month|all
 * Statistiques du négociant connecté pour la période demandée.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const periodParam = (req.nextUrl.searchParams.get("period") || "week") as Period;
  const fromParam = req.nextUrl.searchParams.get("from");
  const toParam = req.nextUrl.searchParams.get("to");
  const period: Period = ["day", "week", "month", "all"].includes(periodParam) ? periodParam : "week";

  // Calcul des bornes de période
  const now = new Date();
  let since: Date | null = null;
  let until: Date | null = null;

  // Priorité aux dates personnalisées si elles sont fournies
  if (fromParam || toParam) {
    if (fromParam) {
      const d = new Date(fromParam + "T00:00:00");
      if (!isNaN(d.getTime())) since = d;
    }
    if (toParam) {
      const d = new Date(toParam + "T23:59:59");
      if (!isNaN(d.getTime())) until = d;
    }
  } else {
    if (period === "day") {
      since = new Date(now);
      since.setHours(0, 0, 0, 0);
    } else if (period === "week") {
      since = new Date(now);
      since.setDate(now.getDate() - 7);
    } else if (period === "month") {
      since = new Date(now);
      since.setDate(now.getDate() - 30);
    }
    // "all" → since null → pas de filtre temporel
  }

  const eventsTimeFilter = since || until
    ? {
        createdAt: {
          ...(since ? { gte: since } : {}),
          ...(until ? { lte: until } : {}),
        },
      }
    : undefined;

  // Prospects + CallEvents filtrés par période pour les KPI de performance
  const prospects = await prisma.prospect.findMany({
    where: { userId },
    include: {
      callEvents: {
        where: eventsTimeFilter,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // --- KPI de performance (basés sur les call events de la période) ---
  let callbacksDone = 0; // prospects avec ≥ 1 answered ET ≥ 1 missed dans la période
  let totalDelayMs = 0;
  let delayCount = 0;
  let appointmentsCount = 0; // prospects callback-done qui ont abouti à RDV / essai / devis
  let salesCount = 0; // prospects callback-done qui ont abouti à vente

  let prospectsWithMissed = 0; // dénominateur du taux de rappel

  // Collecte de tous les délais de rappel (un par "round" missed → answered)
  const allDelaysMs: number[] = [];

  for (const p of prospects) {
    const missed = p.callEvents.filter((e) => e.type === "missed");
    const answered = p.callEvents.filter((e) => e.type === "answered");

    if (missed.length === 0) continue; // pas d'appel manqué dans la période = pas comptabilisé
    prospectsWithMissed++;

    if (answered.length > 0) {
      callbacksDone++;

      // Calcul propre des délais par "round" : chaque answered termine une séquence
      // de missed qui le précèdent. Le délai = answered.at - firstMissed.at du round.
      const sortedAsc = [...p.callEvents].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      let firstMissedOfRound: Date | null = null;
      for (const ev of sortedAsc) {
        if (ev.type === "missed") {
          if (!firstMissedOfRound) firstMissedOfRound = ev.createdAt;
        } else if (ev.type === "answered") {
          if (firstMissedOfRound) {
            const delay = ev.createdAt.getTime() - firstMissedOfRound.getTime();
            if (delay > 0) {
              allDelaysMs.push(delay);
              totalDelayMs += delay;
              delayCount++;
            }
            firstMissedOfRound = null;
          }
        }
      }

      // Taux de transfo : parmi les prospects qu'on a RAPPELÉS, combien ont abouti
      // (on regarde leur statut actuel pour mesurer le succès du rappel)
      if (p.status === "appointment" || p.status === "test_drive" || p.status === "quote_sent") {
        appointmentsCount++;
      }
      if (p.status === "sold") salesCount++;
    }
  }

  // --- Distribution des délais par tranches (9 buckets) ---
  const MIN = 60 * 1000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;
  const buckets = [
    { key: "lt1min",    label: "< 1 min",      max: 1 * MIN },
    { key: "1to3min",   label: "1-3 min",      max: 3 * MIN },
    { key: "3to5min",   label: "3-5 min",      max: 5 * MIN },
    { key: "5to10min",  label: "5-10 min",     max: 10 * MIN },
    { key: "10to15min", label: "10-15 min",    max: 15 * MIN },
    { key: "15to20min", label: "15-20 min",    max: 20 * MIN },
    { key: "20minTo1h", label: "20 min - 1 h", max: 1 * HOUR },
    { key: "1hTo24h",   label: "1 - 24 h",     max: 24 * HOUR },
    { key: "gt24h",     label: "> 24 h",       max: Infinity },
  ];
  const delayDistribution = buckets.map((b) => ({ key: b.key, label: b.label, count: 0 }));
  for (const d of allDelaysMs) {
    const idx = buckets.findIndex((b) => d < b.max);
    const i = idx === -1 ? buckets.length - 1 : idx;
    delayDistribution[i].count++;
  }
  const fastCallbacks = allDelaysMs.filter((d) => d < 5 * MIN).length; // < 5 min = réflexe commercial idéal
  const fastCallbackRate = allDelaysMs.length > 0
    ? Math.round((fastCallbacks / allDelaysMs.length) * 100)
    : 0;

  const callbackRate = prospectsWithMissed > 0 ? Math.round((callbacksDone / prospectsWithMissed) * 100) : 0;
  const avgDelayMin = delayCount > 0 ? Math.round(totalDelayMs / delayCount / 60000) : 0;
  const conversionRate = callbacksDone > 0 ? Math.round(((appointmentsCount + salesCount) / callbacksDone) * 100) : 0;

  // Marge récupérée (estimation simplifiée : marge moyenne × ventes)
  const MARGE_MOYENNE_PAR_VENTE = 2500; // €
  const marginRecovered = salesCount * MARGE_MOYENNE_PAR_VENTE;

  // --- Répartition par statut (sur les prospects actifs dans la période) ---
  const statusWhereTime = since || until
    ? {
        updatedAt: {
          ...(since ? { gte: since } : {}),
          ...(until ? { lte: until } : {}),
        },
      }
    : {};
  const statusRows = await prisma.prospect.groupBy({
    by: ["status"],
    where: {
      userId,
      ...statusWhereTime,
    },
    _count: { _all: true },
  });
  const byStatus: Record<string, number> = Object.fromEntries(ALL_STATUSES.map((s) => [s, 0]));
  for (const row of statusRows) {
    byStatus[row.status] = row._count._all;
  }
  const byStatusTotal = Object.values(byStatus).reduce((a, b) => a + b, 0);

  // --- Graph par jour (toujours basé sur les 7 derniers jours pour la lisibilité) ---
  const graphSince = new Date(now);
  graphSince.setDate(now.getDate() - 6);
  graphSince.setHours(0, 0, 0, 0);

  const dayLabels = ["D", "L", "M", "M", "J", "V", "S"]; // dimanche..samedi
  const byDay = [];
  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(graphSince);
    dayStart.setDate(graphSince.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    const count = prospects.reduce((sum, p) => {
      return sum + p.callEvents.filter((e) => e.type === "answered" && e.createdAt >= dayStart && e.createdAt < dayEnd).length;
    }, 0);

    const isToday = dayStart.toDateString() === now.toDateString();
    byDay.push({ day: dayLabels[dayStart.getDay()], count, isToday });
  }

  return NextResponse.json({
    period,
    marginRecovered,
    salesCount,
    conversionRate,
    callbacksDone,
    callbackRate,
    avgDelayMin,
    appointmentsCount,
    byStatus,
    byStatusTotal,
    byDay,
    teamRanking: null,
    // Stats dédiées au délai de rappel
    delayStats: {
      totalCallbacks: allDelaysMs.length,
      avgDelayMs: delayCount > 0 ? Math.round(totalDelayMs / delayCount) : 0,
      fastCallbacks,
      fastCallbackRate,
      distribution: delayDistribution,
    },
  });
}
