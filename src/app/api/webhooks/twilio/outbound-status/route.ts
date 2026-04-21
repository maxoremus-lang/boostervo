import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

/**
 * POST /api/webhooks/twilio/outbound-status
 * Query: ?prospectId=...&userId=...
 *
 * Appelé par Twilio via l'attribut "action" du <Dial> de voice-app/route.ts
 * après la tentative d'appel du prospect. DialCallStatus = completed,
 * no-answer, busy, failed, canceled.
 *
 * Log un CallEvent sur le prospect + renvoie un TwiML vide (raccroche propre).
 */
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const prospectId = url.searchParams.get("prospectId");
    const userId = url.searchParams.get("userId");

    const body = await req.formData();
    const callSid = body.get("CallSid") as string | null;
    const dialStatus = body.get("DialCallStatus") as string | null;
    const duration = body.get("DialCallDuration") as string | null;
    const toPhone = body.get("To") as string | null;

    if (!prospectId || !userId || !dialStatus) {
      return twimlResponse();
    }

    // Vérifie que le prospect appartient bien au user (sécurité simple)
    const prospect = await prisma.prospect.findFirst({
      where: { id: prospectId, userId },
      select: { id: true },
    });
    if (!prospect) return twimlResponse();

    const durationSec = duration ? parseInt(duration) : 0;
    const isAnswered = dialStatus === "completed" && durationSec > 0;
    const isMissed = !isAnswered; // no-answer, busy, failed, canceled, ou completed sans durée

    await prisma.callEvent.create({
      data: {
        type: isAnswered ? "answered" : "missed",
        callSid: callSid || undefined,
        durationSec: durationSec || undefined,
        // Pour un outbound : from = numéro Twilio, to = prospect
        fromPhone: null,
        toPhone: toPhone || undefined,
        prospectId: prospect.id,
      },
    });

    // Si le prospect était "unreachable" ou "postponed" et qu'on a enfin répondu,
    // on revient à "pending" pour que le flux métier reprenne normalement.
    if (isAnswered) {
      await prisma.prospect.update({
        where: { id: prospect.id },
        data: { isUrgent: false },
      });
    }

    return twimlResponse();
  } catch (error) {
    console.error("[outbound-status] Error:", error);
    return twimlResponse();
  }
}

function twimlResponse() {
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
    { headers: { "Content-Type": "text/xml" } },
  );
}
