import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { sendPushToUser } from "../../../../../lib/webPush";

/**
 * POST /api/webhooks/twilio/voice
 *
 * Appelé par Twilio quand quelqu'un compose un numéro BoosterVO.
 * Retourne du TwiML pour transférer l'appel vers le négociant.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const to = body.get("To") as string;       // Numéro Twilio appelé
    const from = body.get("From") as string;    // Numéro de l'appelant
    const callSid = body.get("CallSid") as string;

    if (!to || !from) {
      return new NextResponse("<Response><Say>Erreur de configuration.</Say></Response>", {
        status: 400,
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Trouver le négociant qui possède ce numéro Twilio
    const user = await prisma.user.findFirst({
      where: { twilioNumber: to.replace(/\s/g, "") },
    });

    if (!user || !user.forwardPhone) {
      // Numéro non assigné — message d'erreur
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-FR">Désolé, ce numéro n'est pas encore configuré. Veuillez réessayer plus tard.</Say>
</Response>`;
      return new NextResponse(twiml, {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Push notif "appel entrant" envoyée en parallèle du Dial pour que le
    // négociant voie le contexte (nom prospect, fiche en 1 tap) AVANT de décrocher.
    // Fire-and-forget : on n'attend pas, Twilio doit recevoir le TwiML rapidement.
    if (user.soundEnabled !== false) {
      const normalizedPhone = from.replace(/\s/g, "");
      const prospect = await prisma.prospect.findFirst({
        where: { userId: user.id, phone: normalizedPhone },
      });
      // Titre = source de l'appel, toujours visible en gros sur la notif.
      // Identifie immédiatement un prospect leboncoin tracké par BoosterVO,
      // même au tout 1er appel quand on n'a pas encore le nom du prospect.
      const title = "Appel entrant — BVO-leboncoin";
      // Corps = numéro + nom si on l'a déjà (rappel d'un prospect existant qualifié).
      const body = prospect?.name
        ? `${prospect.name} · ${normalizedPhone}`
        : normalizedPhone;
      const url = prospect ? `/app/rappels/${prospect.id}` : "/app/rappels";
      sendPushToUser(user.id, {
        title,
        body,
        url,
        // tag unique par appel (callSid) pour ne pas écraser la notif missed précédente
        tag: `incoming-${callSid ?? Date.now()}`,
      }).catch((e) => console.warn("[Twilio Voice] push error", e));
    }

    // TwiML : transférer vers le téléphone du négociant
    // action= reçoit DialCallStatus (no-answer, busy, completed) après la tentative
    const baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL;
    if (!baseUrl) {
      console.error("[Twilio Voice] APP_URL/NEXTAUTH_URL non configuré");
      return new NextResponse("<Response><Say>Erreur de configuration serveur.</Say></Response>", {
        status: 500,
        headers: { "Content-Type": "text/xml" },
      });
    }
    const actionUrl = new URL("/api/webhooks/twilio/status", baseUrl);
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${to}" timeout="20" action="${actionUrl.toString()}" method="POST">
    ${user.forwardPhone}
  </Dial>
</Response>`;

    return new NextResponse(twiml, {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("[Twilio Voice] Error:", error);
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-FR">Une erreur est survenue. Veuillez réessayer.</Say>
</Response>`;
    return new NextResponse(twiml, {
      status: 500,
      headers: { "Content-Type": "text/xml" },
    });
  }
}
