import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { prisma } from "../../../../../lib/prisma";

/**
 * POST /api/webhooks/twilio/voice-app
 *
 * Webhook appelé par Twilio quand un client WebRTC (Twilio Voice SDK)
 * initie un appel sortant via Device.connect({ params: { To, prospectId } }).
 *
 * Retourne du TwiML qui compose le numéro du prospect, depuis le numéro
 * Twilio du négociant, et configure les callbacks de statut.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const toParam = body.get("To") as string;               // numéro prospect (passé par le client)
    const prospectId = body.get("prospectId") as string;    // passé par le client
    const fromRaw = body.get("From") as string;             // Twilio envoie "client:<identity>"
    const identity = fromRaw?.startsWith("client:") ? fromRaw.slice("client:".length) : fromRaw;

    if (!toParam || !identity) {
      const errTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response><Say language="fr-FR">Paramètres d'appel manquants.</Say><Hangup/></Response>`;
      return new NextResponse(errTwiml, {
        status: 400,
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Le négociant doit avoir un numéro Twilio (callerId)
    // identity = user.id (cf. /api/twilio/token)
    const user = await prisma.user.findUnique({
      where: { id: identity },
      select: { id: true, twilioNumber: true },
    });
    if (!user?.twilioNumber) {
      const errTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response><Say language="fr-FR">Numéro d'appelant non configuré.</Say><Hangup/></Response>`;
      return new NextResponse(errTwiml, {
        status: 400,
        headers: { "Content-Type": "text/xml" },
      });
    }

    // URL de callback statut : conserve prospectId et userId pour logger le CallEvent
    const baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL;
    if (!baseUrl) {
      console.error("[voice-app] APP_URL/NEXTAUTH_URL manquant");
      const errTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response><Say language="fr-FR">Erreur serveur.</Say><Hangup/></Response>`;
      return new NextResponse(errTwiml, {
        status: 500,
        headers: { "Content-Type": "text/xml" },
      });
    }

    const statusQS = new URLSearchParams();
    if (prospectId) statusQS.set("prospectId", prospectId);
    statusQS.set("userId", user.id);
    const actionUrl = `${baseUrl}/api/webhooks/twilio/outbound-status?${statusQS.toString()}`;

    // TwiML : Dial le prospect depuis le numéro Twilio du négo, timeout 25s.
    // callerId = numéro Twilio (le perso négo reste caché).
    // action = reçoit DialCallStatus (answered, no-answer, busy, failed) après la tentative.
    const twiml = new twilio.twiml.VoiceResponse();
    const dial = twiml.dial({
      callerId: user.twilioNumber,
      timeout: 25,
      action: actionUrl,
      method: "POST",
      answerOnBridge: true,
    });
    dial.number(toParam);

    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("[voice-app] Erreur:", error);
    const errTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response><Say language="fr-FR">Une erreur est survenue.</Say><Hangup/></Response>`;
    return new NextResponse(errTwiml, {
      status: 500,
      headers: { "Content-Type": "text/xml" },
    });
  }
}
