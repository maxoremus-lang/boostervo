import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

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

    // URL de callback pour recevoir le statut de l'appel
    const statusUrl = new URL("/api/webhooks/twilio/status", req.url);

    // TwiML : transférer vers le téléphone du négociant
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${to}" timeout="25" action="${statusUrl.toString()}">
    <Number statusCallbackEvent="ringing answered completed"
            statusCallback="${statusUrl.toString()}"
            statusCallbackMethod="POST">
      ${user.forwardPhone}
    </Number>
  </Dial>
</Response>`;

    console.log(`[Twilio Voice] ${from} → ${to} (forwarding to ${user.forwardPhone}), SID: ${callSid}`);

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
