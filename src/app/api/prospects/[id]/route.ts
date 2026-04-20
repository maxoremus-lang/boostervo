import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

/**
 * GET /api/prospects/[id]
 * Détail d'un prospect avec historique d'appels.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const prospect = await prisma.prospect.findFirst({
    where: { id: params.id, userId },
    include: { callEvents: { orderBy: { createdAt: "desc" } } },
  });

  if (!prospect) {
    return NextResponse.json({ error: "Prospect introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    id: prospect.id,
    phone: prospect.phone,
    // Qualifié = au moins un champ de la fiche est renseigné
    // (indépendant des événements d'appel Twilio)
    isKnown:
      !!(prospect.name && prospect.name.trim()) ||
      !!(prospect.vehicleInterest && prospect.vehicleInterest.trim()) ||
      prospect.vehiclePrice !== null ||
      prospect.budget !== null ||
      !!(prospect.notes && prospect.notes.trim()) ||
      prospect.appointmentAt !== null,
    name: prospect.name,
    vehicleInterest: prospect.vehicleInterest,
    vehiclePrice: prospect.vehiclePrice,
    budget: prospect.budget,
    notes: prospect.notes,
    status: prospect.status,
    isUrgent: prospect.isUrgent,
    appointmentAt: prospect.appointmentAt?.toISOString() ?? null,
    postponedUntil: prospect.postponedUntil?.toISOString() ?? null,
    lastActivityAt: prospect.callEvents[0]?.createdAt.toISOString() ?? prospect.updatedAt.toISOString(),
    callEvents: prospect.callEvents.map((e) => ({
      id: e.id,
      at: e.createdAt.toISOString(),
      type: e.type,
      durationSec: e.durationSec,
      ringSec: e.ringSec,
    })),
  });
}

/**
 * PATCH /api/prospects/[id]
 * Mettre à jour la fiche d'un prospect (après rappel).
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const body = await req.json();

  // Vérifier que le prospect appartient au négociant
  const existing = await prisma.prospect.findFirst({
    where: { id: params.id, userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Prospect introuvable" }, { status: 404 });
  }

  // Champs autorisés à mettre à jour
  const data: any = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.vehicleInterest !== undefined) data.vehicleInterest = body.vehicleInterest;
  if (body.vehiclePrice !== undefined) data.vehiclePrice = body.vehiclePrice ? parseFloat(body.vehiclePrice) : null;
  if (body.budget !== undefined) data.budget = body.budget ? parseFloat(body.budget) : null;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.status !== undefined) data.status = body.status;
  if (body.appointmentAt !== undefined) data.appointmentAt = body.appointmentAt ? new Date(body.appointmentAt) : null;
  if (body.postponedUntil !== undefined) data.postponedUntil = body.postponedUntil ? new Date(body.postponedUntil) : null;

  // Si le statut passe à un état "traité", enlever l'urgence
  const doneStatuses = ["appointment", "test_drive", "quote_sent", "sold", "not_interested"];
  if (data.status && doneStatuses.includes(data.status)) {
    data.isUrgent = false;
  }

  const updated = await prisma.prospect.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ ok: true, prospect: updated });
}
