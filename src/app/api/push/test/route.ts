import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { sendPushToUser } from "../../../../lib/webPush";

/**
 * POST /api/push/test
 * Envoie une notification de test au user connecté (sur tous ses devices abonnés).
 * Réponse: { delivered: number }
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  const delivered = await sendPushToUser(userId, {
    title: "Test BoosterVO",
    body: "Si vous voyez cette notification, c'est que tout fonctionne !",
    url: "/app/rappels",
    tag: "test-push",
  });

  return NextResponse.json({ delivered });
}
