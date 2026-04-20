import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

/**
 * POST /api/push/subscription
 * Body: { endpoint, keys: { p256dh, auth } }
 * Enregistre ou met à jour une subscription Web Push pour le user connecté.
 * Idempotent par endpoint.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const body = await req.json().catch(() => null);

  const endpoint: unknown = body?.endpoint;
  const p256dh: unknown = body?.keys?.p256dh;
  const auth: unknown = body?.keys?.auth;

  if (typeof endpoint !== "string" || typeof p256dh !== "string" || typeof auth !== "string") {
    return NextResponse.json({ error: "Subscription invalide" }, { status: 400 });
  }

  const userAgent = req.headers.get("user-agent") || undefined;

  const sub = await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { userId, p256dh, auth, userAgent, lastUsedAt: new Date() },
    create: { userId, endpoint, p256dh, auth, userAgent },
  });

  return NextResponse.json({ ok: true, id: sub.id });
}

/**
 * DELETE /api/push/subscription
 * Body: { endpoint }
 * Supprime la subscription pour ce endpoint (si elle appartient au user connecté).
 */
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const body = await req.json().catch(() => null);
  const endpoint: unknown = body?.endpoint;

  if (typeof endpoint !== "string") {
    return NextResponse.json({ error: "endpoint manquant" }, { status: 400 });
  }

  await prisma.pushSubscription.deleteMany({
    where: { endpoint, userId },
  });

  return NextResponse.json({ ok: true });
}
