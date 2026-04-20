import webpush from "web-push";
import { prisma } from "./prisma";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || "mailto:contact@boostervo.fr";

let configured = false;

function ensureConfigured() {
  if (configured) return true;
  if (!publicKey || !privateKey) {
    console.warn("[webPush] VAPID keys missing — push désactivé");
    return false;
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export type PushPayload = {
  title: string;
  body: string;
  /** URL vers laquelle ouvrir au clic (ex: /app/rappels/xxx) */
  url?: string;
  /** Tag pour regrouper les notifs (une par prospect) */
  tag?: string;
};

/**
 * Envoie une notification push à tous les devices enregistrés d'un user.
 * Les subscriptions expirées (410 Gone, 404) sont supprimées automatiquement.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  if (!ensureConfigured()) return 0;

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subs.length === 0) return 0;

  const body = JSON.stringify(payload);
  let delivered = 0;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body,
        );
        delivered++;
        // Tag la subscription comme utilisée (utile pour nettoyage futur)
        await prisma.pushSubscription.update({
          where: { id: sub.id },
          data: { lastUsedAt: new Date() },
        }).catch(() => {});
      } catch (err: any) {
        const status = err?.statusCode;
        // 404 / 410 = subscription révoquée → suppression
        if (status === 404 || status === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
          console.log(`[webPush] subscription ${sub.id} supprimée (statusCode ${status})`);
        } else {
          console.warn(`[webPush] échec envoi à ${sub.endpoint.slice(0, 50)}… statusCode=${status}`, err?.body);
        }
      }
    }),
  );

  return delivered;
}
