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

  // Construire le filtre principal
  let baseFilter: any = undefined;
  if (statusExact && VALID_STATUSES.includes(statusExact)) {
    // Filtre par statut précis (prend le pas sur filter)
    baseFilter = { status: statusExact };
  } else if (filter === "urgent") {
    baseFilter = { isUrgent: true, status: "pending" };
  } else if (filter === "todo") {
    baseFilter = { status: { in: ["pending", "postponed", "unreachable"] } };
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

  // Transformer pour le frontend
  const result = prospects.map((p) => ({
    id: p.id,
    phone: p.phone,
    isKnown: !!(p.name && p.name.trim()),
    name: p.name,
    vehicleInterest: p.vehicleInterest,
    vehiclePrice: p.vehiclePrice,
    budget: p.budget,
    notes: p.notes,
    status: p.status,
    isUrgent: p.isUrgent,
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

  // Compteurs pour les filtres
  const counts = {
    urgent: await prisma.prospect.count({ where: { userId, isUrgent: true, status: "pending" } }),
    todo: await prisma.prospect.count({ where: { userId, status: { in: ["pending", "postponed", "unreachable"] } } }),
    in_progress: await prisma.prospect.count({ where: { userId, status: { in: ["appointment", "test_drive", "quote_sent"] } } }),
    done: await prisma.prospect.count({ where: { userId, status: { in: ["sold", "not_interested"] } } }),
    all: await prisma.prospect.count({ where: { userId } }),
  };

  return NextResponse.json({ prospects: result, counts });
}
