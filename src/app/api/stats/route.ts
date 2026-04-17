import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

/**
 * GET /api/stats
 * Statistiques du négociant connecté.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  // Période : cette semaine (lundi à aujourd'hui)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);

  const prospects = await prisma.prospect.findMany({
    where: { userId },
    include: {
      callEvents: {
        where: { createdAt: { gte: monday } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // Calcul des KPIs
  let callbacksDone = 0;
  let totalMissed = 0;
  let totalAnswered = 0;
  let totalDelayMs = 0;
  let delayCount = 0;
  let appointmentsCount = 0;
  let salesCount = 0;

  for (const p of prospects) {
    const missed = p.callEvents.filter((e) => e.type === "missed");
    const answered = p.callEvents.filter((e) => e.type === "answered");
    totalMissed += missed.length;
    totalAnswered += answered.length;

    if (answered.length > 0) {
      callbacksDone++;
      // Délai = temps entre le premier missed et le premier answered
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

  // Rappels par jour de la semaine
  const dayLabels = ["L", "M", "M", "J", "V", "S", "D"];
  const byDay = dayLabels.map((label, i) => {
    const dayStart = new Date(monday);
    dayStart.setDate(monday.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    const count = prospects.reduce((sum, p) => {
      return sum + p.callEvents.filter((e) => e.type === "answered" && e.createdAt >= dayStart && e.createdAt < dayEnd).length;
    }, 0);

    return { day: label, count, isToday: i === (dayOfWeek === 0 ? 6 : dayOfWeek - 1) };
  });

  return NextResponse.json({
    period: "week",
    marginRecovered,
    salesCount,
    conversionRate,
    callbacksDone,
    callbackRate,
    avgDelayMin,
    appointmentsCount,
    trends: {
      marginRecovered: 0,
      salesCount: 0,
      conversionRate: 0,
      callbacksDone: 0,
      callbackRate: 0,
      avgDelayMin: 0,
    },
    byDay,
    teamRanking: null, // À implémenter si activé par l'admin
  });
}
