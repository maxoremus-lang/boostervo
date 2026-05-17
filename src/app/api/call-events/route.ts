import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

/**
 * GET /api/call-events?direction=inbound&type=answered&period=day|week|month|all
 * Liste chronologique des CallEvents du négociant connecté, enrichis du prospect lié.
 * direction est dérivée de fromPhone : inbound = fromPhone renseigné, outbound = null.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { searchParams } = req.nextUrl;
  const direction = searchParams.get("direction"); // "inbound" | "outbound" | null
  const type = searchParams.get("type"); // "missed" | "answered" | null
  const period = searchParams.get("period"); // day|week|month|all

  let sinceFilter: any = undefined;
  if (period && period !== "all") {
    const since = new Date();
    if (period === "day") since.setHours(0, 0, 0, 0);
    else if (period === "week") since.setDate(since.getDate() - 7);
    else if (period === "month") since.setDate(since.getDate() - 30);
    sinceFilter = { createdAt: { gte: since } };
  }

  const directionFilter =
    direction === "inbound"
      ? { fromPhone: { not: null } }
      : direction === "outbound"
        ? { fromPhone: null }
        : undefined;

  const typeFilter = type === "missed" || type === "answered" ? { type } : undefined;

  const events = await prisma.callEvent.findMany({
    where: {
      prospect: { userId },
      ...(directionFilter ?? {}),
      ...(typeFilter ?? {}),
      ...(sinceFilter ?? {}),
    },
    include: {
      prospect: {
        select: {
          id: true,
          phone: true,
          name: true,
          vehicleInterest: true,
          vehiclePrice: true,
          budget: true,
          notes: true,
          appointmentAt: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = events.map((e) => ({
    id: e.id,
    at: e.createdAt.toISOString(),
    type: e.type,
    direction: (e.fromPhone === null || e.fromPhone === undefined) ? "outbound" : "inbound",
    durationSec: e.durationSec,
    ringSec: e.ringSec,
    prospect: {
      id: e.prospect.id,
      phone: e.prospect.phone,
      name: e.prospect.name,
      vehicleInterest: e.prospect.vehicleInterest,
      vehiclePrice: e.prospect.vehiclePrice,
      status: e.prospect.status,
      isKnown:
        !!(e.prospect.name && e.prospect.name.trim()) ||
        !!(e.prospect.vehicleInterest && e.prospect.vehicleInterest.trim()) ||
        e.prospect.vehiclePrice !== null ||
        e.prospect.budget !== null ||
        !!(e.prospect.notes && e.prospect.notes.trim()) ||
        e.prospect.appointmentAt !== null,
    },
  }));

  return NextResponse.json({ events: result, count: result.length });
}
