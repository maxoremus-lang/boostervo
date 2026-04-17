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
  const period: Period = ["day", "week", "month", "all"].includes(periodParam) ? periodParam : "week";

  // Calcul de la borne de période
  const now = new Date();
  let since: Date | null = null;
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

  // Prospects + CallEvents filtrés par période pour les KPI de performance
  const prospects = await prisma.prospect.findMany({
    where: { userId },
    include: {
      callEvents: {
        where: since ? { createdAt: { gte: since } } : undefined,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // --- KPI de performance (basés sur les call events de la période) ---
  let callbacksDone = 0;
  let totalDelayMs = 0;
  let delayCount = 0;
  let appointmentsCount = 0;
  let salesCount = 0;

  for (const p of prospects) {
    const missed = p.callEvents.filter((e) => e.type === "missed");
    const answered = p.callEvents.filter((e) => e.type === "answered");

    if (answered.length > 0) {
      callbacksDone++;
      const firstMissed = missed[missed.length - 1];
      const firstAnswered = answered[answered.length - 1];
      if (firstMissed && firstAnswered) {
        const delay = new Date(firstAnswered.createdAt).getTime() - new Date(firstMissed.createdAt).getTime();
        if (delay > 0) {
          totalDelayMs += delay;
          delayCount++;
        }
      }
    }

    // Compteurs sur le statut courant du prospect (pas limité à la période)
    if (p.status === "appointment" || p.status === "test_drive") appointmentsCount++;
    if (p.status === "sold") salesCount++;
  }

  const prospectsWithMissed = prospects.filter((p) => p.callEvents.some((e) => e.type === "missed")).length;
  const callbackRate = prospectsWithMissed > 0 ? Math.round((callbacksDone / prospectsWithMissed) * 100) : 0;
  const avgDelayMin = delayCount > 0 ? Math.round(totalDelayMs / delayCount / 60000) : 0;
  const conversionRate = callbacksDone > 0 ? Math.round(((appointmentsCount + salesCount) / callbacksDone) * 100) : 0;

  // Marge récupérée (estimation simplifiée : marge moyenne × ventes)
  const MARGE_MOYENNE_PAR_VENTE = 2500; // €
  const marginRecovered = salesCount * MARGE_MOYENNE_PAR_VENTE;

  // --- Répartition par statut (sur les prospects actifs dans la période) ---
  // On filtre sur updatedAt >= since, sauf pour period=all où on prend tout.
  const statusRows = await prisma.prospect.groupBy({
    by: ["status"],
    where: {
      userId,
      ...(since ? { updatedAt: { gte: since } } : {}),
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
  });
}
