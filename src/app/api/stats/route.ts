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

  // Pour le taux de transfo : ventes et RDV issus spécifiquement d'un rappel (= prospects missed + answered)
  let appointmentsFromRappel = 0;
  let salesFromRappel = 0;

  // Comparaison : conversion en vente des décrochés directs vs des rappels après missed.
  // Décroché direct = prospect avec ≥1 answered et 0 missed dans la période.
  let directPickupsCount = 0;
  let salesFromDirect = 0;

  // KPI liés aux rappels (callbacksDone, délai moyen) : uniquement prospects avec ≥1 missed
  for (const p of prospects) {
    const missed = p.callEvents.filter((e) => e.type === "missed");
    const answered = p.callEvents.filter((e) => e.type === "answered");

    if (missed.length === 0) continue; // pas d'appel manqué dans la période = pas comptabilisé côté rappels
    prospectsWithMissed++;

    if (answered.length > 0) {
      callbacksDone++;

      if (p.status === "appointment" || p.status === "test_drive" || p.status === "quote_sent") {
        appointmentsFromRappel++;
      }
      if (p.status === "sold") salesFromRappel++;

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
    }
  }

  // Ventes et RDV : comptent TOUS les prospects au bon statut, qu'ils aient eu
  // un appel manqué ou un décroché direct (Groupe C). Sinon une vente issue
  // d'un décroché immédiat n'apparaîtrait pas dans les stats.
  for (const p of prospects) {
    if (p.status === "appointment" || p.status === "test_drive" || p.status === "quote_sent") {
      appointmentsCount++;
    }
    if (p.status === "sold") salesCount++;

    // Décroché direct : ≥1 answered et 0 missed dans la période
    const hasMissed = p.callEvents.some((e) => e.type === "missed");
    const hasAnswered = p.callEvents.some((e) => e.type === "answered");
    if (!hasMissed && hasAnswered) {
      directPickupsCount++;
      if (p.status === "sold") salesFromDirect++;
    }
  }

  // --- Distribution des délais par tranches (4 buckets, mutuellement exclusifs) ---
  const MIN = 60 * 1000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;
  const buckets = [
    { key: "lt5min",   label: "<5 min",  max: 5 * MIN },
    { key: "lt30min",  label: "<30 min", max: 30 * MIN },
    { key: "lt2h",     label: "<2h",     max: 2 * HOUR },
    { key: "gte2h",    label: ">24h",    max: Infinity },
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
  // Taux de transfo : % de rappels aboutis qui se traduisent par RDV/essai/devis/vente.
  // Uniquement sur les prospects qui ont eu un missed puis un answered
  // (donc issu de rappel stricto sensu — les décrochés directs ne passent pas par là).
  const conversionRate = callbacksDone > 0 ? Math.round(((appointmentsFromRappel + salesFromRappel) / callbacksDone) * 100) : 0;
  // Comparaison ventes seules : décroché direct vs rappel après missed.
  const salesRateDirect = directPickupsCount > 0 ? Math.round((salesFromDirect / directPickupsCount) * 100) : 0;
  const salesRateRappel = callbacksDone > 0 ? Math.round((salesFromRappel / callbacksDone) * 100) : 0;

  // Marge générée (estimation simplifiée : marge moyenne × ventes)
  const MARGE_MOYENNE_PAR_VENTE = 800; // €
  const marginRecovered = salesCount * MARGE_MOYENNE_PAR_VENTE;

  // Entonnoir "Parcours des appels entrants" :
  //   total = prospects avec au moins une activité d'appel dans la période
  //   = décrochés directs (inbound-answered sans missed)
  //   + prospects avec ≥1 missed (qu'ils aient été rappelés ou non)
  const incomingCalls = directPickupsCount + prospectsWithMissed;
  // Prospects missed que le négociant n'a pas (encore) réussi à rappeler
  const missedNotAnswered = prospectsWithMissed - callbacksDone;
  // Parmi ceux-là : injoignables (plusieurs tentatives infructueuses) vs encore à faire
  const unreachableCount = prospects.filter((p) => p.status === "unreachable").length;
  const stillToCall = Math.max(0, missedNotAnswered - unreachableCount);
  // RDV issus de décrochés directs (complément d'appointmentsFromRappel)
  const appointmentsFromDirect = Math.max(0, appointmentsCount - appointmentsFromRappel);
  // Impact de la réactivité : marge supplémentaire captée par les décrochés directs
  // = ventes réelles des directs - ventes hypothétiques si directs avaient été traités comme rappels
  const hypoSalesIfRappel = directPickupsCount * (salesRateRappel / 100);
  const marginGainedByDirect = Math.max(0, Math.round((salesFromDirect - hypoSalesIfRappel) * MARGE_MOYENNE_PAR_VENTE));
  const marginPerDirectCall = directPickupsCount > 0 ? Math.round(marginGainedByDirect / directPickupsCount) : 0;
  // Manque à gagner : si tous les rappels effectués avaient été décrochés immédiatement (au taux direct),
  // combien de ventes supplémentaires et combien d'€ en plus.
  // Utilise le taux réel non arrondi pour la précision du calcul.
  const realSalesRateDirect = directPickupsCount > 0 ? salesFromDirect / directPickupsCount : 0;
  const hypoSalesIfAllDirect = callbacksDone * realSalesRateDirect;
  const additionalSalesIfDirect = Math.max(0, hypoSalesIfAllDirect - salesFromRappel);
  const potentialMarginMissed = Math.round(additionalSalesIfDirect * MARGE_MOYENNE_PAR_VENTE);
  const displayHypoSales = Math.round(hypoSalesIfAllDirect);
  const displayAdditionalSales = Math.round(additionalSalesIfDirect);
  const marginLostPerMissed = callbacksDone > 0 ? Math.round(potentialMarginMissed / callbacksDone) : 0;
  // Taux de transfo global (RDV + ventes issus de tout canal, sur tous les appels aboutis)
  const totalAnsweredProspects = callbacksDone + directPickupsCount;
  const globalConversionRate = totalAnsweredProspects > 0
    ? Math.round(((appointmentsCount + salesCount) / totalAnsweredProspects) * 100)
    : 0;

  // --- Répartition par statut (sur les prospects actifs dans la période) ---
  // NB: "pending" exclut les urgents — ils sont comptés à part (byStatus.urgent)
  // pour rester cohérent avec le filtre "À faire" de l'app (urgents dans leur propre onglet, pas dupliqués).
  const statusWhereTime = since || until
    ? {
        updatedAt: {
          ...(since ? { gte: since } : {}),
          ...(until ? { lte: until } : {}),
        },
      }
    : {};
  const oneHourAgoStats = new Date(Date.now() - 60 * 60 * 1000);
  const urgentConditionStats = {
    status: "pending",
    OR: [
      { isUrgent: true },
      { callEvents: { some: { type: "missed", createdAt: { gte: oneHourAgoStats } } } },
    ],
  };
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
  byStatus.pending = await prisma.prospect.count({
    where: { userId, ...statusWhereTime, AND: [{ status: "pending" }, { NOT: urgentConditionStats }] },
  });
  const urgentCount = await prisma.prospect.count({
    where: { userId, ...statusWhereTime, ...urgentConditionStats },
  });
  byStatus.urgent = urgentCount;
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

  // --- Note de réactivité (basée sur le % de rappels < 5 min) ---
  function computeNote(rate: number): { letter: string; label: string; color: string } {
    if (rate >= 80) return { letter: "A+", label: "Exceptionnel", color: "green" };
    if (rate >= 60) return { letter: "A", label: "Très réactif", color: "green" };
    if (rate >= 40) return { letter: "B", label: "Bon", color: "lime" };
    if (rate >= 20) return { letter: "C", label: "Moyen", color: "yellow" };
    if (rate >= 10) return { letter: "D", label: "Faible", color: "orange" };
    return { letter: "E", label: "À travailler", color: "red" };
  }
  const note = computeNote(fastCallbackRate);

  // --- Évolution vs période précédente (même durée, décalée) ---
  let previousPeriod: {
    avgDelayMs: number;
    fastCallbackRate: number;
    note: { letter: string; label: string; color: string };
  } | null = null;
  if (since) {
    const end = until ?? now;
    const duration = end.getTime() - since.getTime();
    const prevUntil = new Date(since.getTime() - 1);
    const prevSince = new Date(since.getTime() - duration);
    const prevProspects = await prisma.prospect.findMany({
      where: { userId },
      include: {
        callEvents: {
          where: { createdAt: { gte: prevSince, lte: prevUntil } },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    const prevDelaysMs: number[] = [];
    for (const p of prevProspects) {
      let firstMissed: Date | null = null;
      for (const ev of p.callEvents) {
        if (ev.type === "missed") {
          if (!firstMissed) firstMissed = ev.createdAt;
        } else if (ev.type === "answered") {
          if (firstMissed) {
            const d = ev.createdAt.getTime() - firstMissed.getTime();
            if (d > 0) prevDelaysMs.push(d);
            firstMissed = null;
          }
        }
      }
    }
    if (prevDelaysMs.length > 0) {
      const prevAvg = Math.round(prevDelaysMs.reduce((a, b) => a + b, 0) / prevDelaysMs.length);
      const prevFast = prevDelaysMs.filter((d) => d < 5 * MIN).length;
      const prevRate = Math.round((prevFast / prevDelaysMs.length) * 100);
      previousPeriod = {
        avgDelayMs: prevAvg,
        fastCallbackRate: prevRate,
        note: computeNote(prevRate),
      };
    }
  }

  // --- Impact financier : distribution par tranche (4 buckets délai + 1 canal direct) ---
  const IMPACT_BUCKETS = [
    { key: "lt5min",    label: "< 5 min",      max: 5 * MIN },
    { key: "5to30min",  label: "5 - 30 min",   max: 30 * MIN },
    { key: "30minTo2h", label: "30 min - 2 h", max: 2 * HOUR },
    { key: "gt2h",      label: "> 2 h",        max: Infinity },
  ];
  type ImpactBucket = { key: string; label: string; rappels: number; rdvs: number; ventes: number; marge: number };
  // Bucket "Décroché direct" en 1ère position : canal sans rappel nécessaire (délai implicite = 0).
  // Permet d'afficher le Groupe C (inbound-answered sans missed) à côté des tranches de délai
  // et d'aligner current.margin avec marginRecovered côté stats générales.
  const directBucket: ImpactBucket = {
    key: "direct",
    label: "Décroché direct",
    rappels: directPickupsCount,
    rdvs: appointmentsFromDirect,
    ventes: salesFromDirect,
    marge: salesFromDirect * MARGE_MOYENNE_PAR_VENTE,
  };
  const impactDistribution: ImpactBucket[] = [
    directBucket,
    ...IMPACT_BUCKETS.map((b) => ({ key: b.key, label: b.label, rappels: 0, rdvs: 0, ventes: 0, marge: 0 })),
  ];
  const QUALIFIED_RDV_STATUSES = ["appointment", "test_drive", "quote_sent"];

  // Pour chaque prospect ayant un rappel (1ère séquence missed → answered), on remplit
  // le bucket de délai correspondant (offset +1 à cause du bucket direct en tête).
  for (const p of prospects) {
    const sortedAsc = [...p.callEvents].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    let firstMissedDate: Date | null = null;
    for (const ev of sortedAsc) {
      if (ev.type === "missed") {
        if (!firstMissedDate) firstMissedDate = ev.createdAt;
      } else if (ev.type === "answered") {
        if (firstMissedDate) {
          const d = ev.createdAt.getTime() - firstMissedDate.getTime();
          if (d > 0) {
            const idx = IMPACT_BUCKETS.findIndex((b) => d < b.max);
            const i = (idx === -1 ? IMPACT_BUCKETS.length - 1 : idx) + 1; // +1 : direct est en position 0
            impactDistribution[i].rappels++;
            if (QUALIFIED_RDV_STATUSES.includes(p.status)) impactDistribution[i].rdvs++;
            if (p.status === "sold") {
              impactDistribution[i].ventes++;
              impactDistribution[i].marge += MARGE_MOYENNE_PAR_VENTE;
            }
            break; // 1er round seulement
          }
          firstMissedDate = null;
        }
      }
    }
  }

  // Totaux courants : incluent maintenant les décrochés directs → alignés avec marginRecovered
  const totalImpactCallbacks = impactDistribution.reduce((s, b) => s + b.rappels, 0);
  const totalCurrentRdvs = impactDistribution.reduce((s, b) => s + b.rdvs, 0);
  const totalCurrentSales = impactDistribution.reduce((s, b) => s + b.ventes, 0);
  const totalCurrentMargin = totalCurrentSales * MARGE_MOYENNE_PAR_VENTE;

  // Potentiel : le meilleur bucket RAPPEL (on ne peut pas "rappeler" à un délai négatif).
  // Direct est déjà à son maximum ; on ne le fait pas évoluer dans le potentiel.
  const rappelBuckets = impactDistribution.filter((b) => b.key !== "direct");
  const bestBucket = rappelBuckets[0]; // <5 min par convention
  const bestRdvRate = bestBucket.rappels > 0 ? bestBucket.rdvs / bestBucket.rappels : 0;
  const bestSalesRate = bestBucket.rappels > 0 ? bestBucket.ventes / bestBucket.rappels : 0;
  const rappelCallbacks = rappelBuckets.reduce((s, b) => s + b.rappels, 0);
  // Si tous les rappels avaient été faits en <5 min (direct reste à son niveau actuel)
  const potentialRdvs = Math.round(rappelCallbacks * bestRdvRate) + directBucket.rdvs;
  const potentialSales = Math.round(rappelCallbacks * bestSalesRate) + directBucket.ventes;
  const potentialMargin = potentialSales * MARGE_MOYENNE_PAR_VENTE;
  const missedMargin = Math.max(0, potentialMargin - totalCurrentMargin);

  // --- Derniers rappels effectués (avec leur délai et infos prospect) ---
  type RecentCallback = {
    prospectId: string;
    name: string | null;
    phone: string;
    vehicleInterest: string | null;
    answeredAt: string;
    delayMs: number;
  };
  const recentCallbacks: RecentCallback[] = [];
  for (const p of prospects) {
    const sortedAsc = [...p.callEvents].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    let firstMissedDate: Date | null = null;
    for (const ev of sortedAsc) {
      if (ev.type === "missed") {
        if (!firstMissedDate) firstMissedDate = ev.createdAt;
      } else if (ev.type === "answered") {
        if (firstMissedDate) {
          const d = ev.createdAt.getTime() - firstMissedDate.getTime();
          if (d > 0) {
            recentCallbacks.push({
              prospectId: p.id,
              name: p.name,
              phone: p.phone,
              vehicleInterest: p.vehicleInterest,
              answeredAt: ev.createdAt.toISOString(),
              delayMs: d,
            });
          }
          firstMissedDate = null;
        }
      }
    }
  }
  recentCallbacks.sort((a, b) => new Date(b.answeredAt).getTime() - new Date(a.answeredAt).getTime());

  return NextResponse.json({
    period,
    marginRecovered,
    salesCount,
    conversionRate,
    callbacksDone,
    callbackRate,
    avgDelayMin,
    appointmentsCount,
    // Comparatif ventes : décroché direct vs rappel après missed
    directPickupsCount,
    salesFromDirect,
    salesRateDirect,
    salesFromRappel,
    salesRateRappel,
    // Entonnoir "Parcours des appels entrants"
    incomingCalls,
    prospectsWithMissed,
    missedNotAnswered,
    unreachableCount,
    stillToCall,
    appointmentsFromRappel,
    appointmentsFromDirect,
    marginGainedByDirect,
    marginPerDirectCall,
    globalConversionRate,
    // Manque à gagner : potentiel si rappels avaient été décrochés directement
    potentialMarginMissed,
    displayHypoSales,
    displayAdditionalSales,
    marginLostPerMissed,
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
      note,
      previousPeriod,
      recentCallbacks: recentCallbacks.slice(0, 20), // le frontend affichera 7 + "voir les autres"
    },
    // Stats dédiées à l'impact financier
    impactStats: {
      totalCallbacks: totalImpactCallbacks,
      // Sous-totaux : rappels effectués vs décrochés directs (pour textes explicatifs)
      rappelCallbacks,
      directPickups: directBucket.rappels,
      distribution: impactDistribution,
      current: {
        rdvs: totalCurrentRdvs,
        sales: totalCurrentSales,
        margin: totalCurrentMargin,
        rdvRate: totalImpactCallbacks > 0 ? Math.round((totalCurrentRdvs / totalImpactCallbacks) * 100) : 0,
        salesRate: totalImpactCallbacks > 0 ? Math.round((totalCurrentSales / totalImpactCallbacks) * 100) : 0,
      },
      potential: {
        rdvs: potentialRdvs,
        sales: potentialSales,
        margin: potentialMargin,
      },
      best: {
        rdvRate: Math.round(bestRdvRate * 100),
        salesRate: Math.round(bestSalesRate * 100),
        sampleSize: bestBucket.rappels,
      },
      missedMargin,
    },
  });
}
