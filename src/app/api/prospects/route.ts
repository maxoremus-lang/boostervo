import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

/**
 * GET /api/prospects?filter=todo|in_progress|done|all&search=...
 * Liste les prospects du négociant connecté.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { searchParams } = req.nextUrl;
  const filter = searchParams.get("filter") || "all";
  const statusExact = searchParams.get("status"); // filtre par statut précis (prioritaire)
  const period = searchParams.get("period"); // day|week|month|all (optionnel)
  const search = searchParams.get("search")?.trim().toLowerCase();

  const VALID_STATUSES = [
    "pending", "postponed", "unreachable",
    "appointment", "test_drive", "quote_sent",
    "sold", "not_interested",
  ];

  // Filtre temporel optionnel (pour cohérence avec la page Stats)
  let sinceFilter: any = undefined;
  if (period && period !== "all") {
    const since = new Date();
    if (period === "day") since.setHours(0, 0, 0, 0);
    else if (period === "week") since.setDate(since.getDate() - 7);
    else if (period === "month") since.setDate(since.getDate() - 30);
    sinceFilter = { updatedAt: { gte: since } };
  }

  // Définition centrale de "urgent" :
  //   statut = pending ET ( flag DB isUrgent OU au moins un missed call < 1h )
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const urgentCondition = {
    status: "pending",
    OR: [
      { isUrgent: true },
      { callEvents: { some: { type: "missed", createdAt: { gte: oneHourAgo } } } },
    ],
  };

  // Construire le filtre principal
  // NB: "todo" (À faire) exclut les urgents pour éviter le double comptage
  // avec le filtre "urgent". Les urgents sont comptés/affichés uniquement dans leur propre bloc.
  let baseFilter: any = undefined;
  if (statusExact && VALID_STATUSES.includes(statusExact)) {
    // Filtre par statut précis (prend le pas sur filter)
    baseFilter = { status: statusExact };
  } else if (filter === "urgent") {
    baseFilter = urgentCondition;
  } else if (filter === "todo") {
    // pending + postponed + unreachable, mais SANS les urgents
    baseFilter = {
      AND: [
        { status: { in: ["pending", "postponed", "unreachable"] } },
        { NOT: urgentCondition },
      ],
    };
  } else if (filter === "in_progress") {
    baseFilter = { status: { in: ["appointment", "test_drive", "quote_sent"] } };
  } else if (filter === "done") {
    baseFilter = { status: { in: ["sold", "not_interested"] } };
  }

  const prospects = await prisma.prospect.findMany({
    where: {
      userId,
      ...(baseFilter ?? {}),
      ...(sinceFilter ?? {}),
      ...(search
        ? {
            OR: [
              { phone: { contains: search } },
              { name: { contains: search } },
              { vehicleInterest: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      callEvents: { orderBy: { createdAt: "desc" } },
    },
    orderBy: [{ isUrgent: "desc" }, { updatedAt: "desc" }],
  });

  // Pour le filtre "urgent", trier par date du dernier missed call décroissant
  // (le plus récent en premier). callEvents est déjà ordonné desc par createdAt.
  if (filter === "urgent") {
    prospects.sort((a, b) => {
      const aLast = a.callEvents.find((e) => e.type === "missed")?.createdAt.getTime() ?? 0;
      const bLast = b.callEvents.find((e) => e.type === "missed")?.createdAt.getTime() ?? 0;
      return bLast - aLast;
    });
  }

  // Transformer pour le frontend
  const result = prospects.map((p) => ({
    id: p.id,
    phone: p.phone,
    // Qualifié = au moins un champ de la fiche est renseigné
    // (indépendant des événements d'appel Twilio)
    isKnown:
      !!(p.name && p.name.trim()) ||
      !!(p.vehicleInterest && p.vehicleInterest.trim()) ||
      p.vehiclePrice !== null ||
      p.budget !== null ||
      !!(p.notes && p.notes.trim()) ||
      p.appointmentAt !== null,
    name: p.name,
    vehicleInterest: p.vehicleInterest,
    vehiclePrice: p.vehiclePrice,
    budget: p.budget,
    notes: p.notes,
    status: p.status,
    // Urgent dynamique : flag DB OU dernier missed < 1h (uniquement si pending)
    isUrgent:
      p.status === "pending" &&
      (p.isUrgent ||
        p.callEvents.some((e) => e.type === "missed" && e.createdAt >= oneHourAgo)),
    appointmentAt: p.appointmentAt?.toISOString() ?? null,
    lastActivityAt: p.callEvents[0]?.createdAt.toISOString() ?? p.updatedAt.toISOString(),
    callEvents: p.callEvents.map((e) => ({
      id: e.id,
      at: e.createdAt.toISOString(),
      type: e.type,
      durationSec: e.durationSec,
      ringSec: e.ringSec,
    })),
  }));

  // Compteurs par groupe (filtres principaux)
  // NB: todo exclut les urgents pour éviter le double comptage
  const counts = {
    urgent: await prisma.prospect.count({ where: { userId, ...urgentCondition } }),
    todo: await prisma.prospect.count({
      where: {
        userId,
        AND: [
          { status: { in: ["pending", "postponed", "unreachable"] } },
          { NOT: urgentCondition },
        ],
      },
    }),
    in_progress: await prisma.prospect.count({ where: { userId, status: { in: ["appointment", "test_drive", "quote_sent"] } } }),
    done: await prisma.prospect.count({ where: { userId, status: { in: ["sold", "not_interested"] } } }),
    all: await prisma.prospect.count({ where: { userId } }),
  };

  // Compteurs par statut précis (pour les sous-filtres)
  const statusRows = await prisma.prospect.groupBy({
    by: ["status"],
    where: { userId },
    _count: { _all: true },
  });
  const byStatus: Record<string, number> = {
    pending: 0, postponed: 0, unreachable: 0,
    appointment: 0, test_drive: 0, quote_sent: 0,
    sold: 0, not_interested: 0,
  };
  for (const row of statusRows) {
    byStatus[row.status] = row._count._all;
  }

  return NextResponse.json({ prospects: result, counts, byStatus });
}
