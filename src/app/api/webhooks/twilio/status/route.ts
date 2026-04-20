import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

/**
 * POST /api/webhooks/twilio/status
 *
 * Appelé par Twilio via l'attribut "action" du <Dial> après la tentative d'appel.
 * Reçoit DialCallStatus (completed, no-answer, busy, failed, canceled).
 * DOIT retourner du TwiML (pas du JSON).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const callSid = body.get("CallSid") as string;
    // DialCallStatus = résultat du leg de renvoi vers le mobile du négociant.
    // Seule cette valeur doit produire un événement. Les webhooks du
    // statusCallback parent (avec CallStatus seul) sont ignorés pour éviter
    // de logger un faux "answered" quand le parent call se termine.
    const dialStatus = body.get("DialCallStatus") as string;
    const from = body.get("From") as string;
    const to = body.get("To") as string;
    const duration = body.get("DialCallDuration") as string;

    if (!dialStatus) {
      console.log(`[Twilio Status] SID:${callSid} ignoré (pas de DialCallStatus — statusCallback parent)`);
      return twimlResponse();
    }

    const callStatus = dialStatus;
    console.log(`[Twilio Status] SID:${callSid} from:${from} to:${to} dialStatus:${dialStatus} duration:${duration}`);

    if (!from || !to) {
      return twimlResponse();
    }

    // Déterminer le type d'événement
    // Heuristique : si "completed" mais durée ≤ 5s, c'est probablement la messagerie vocale
    const durationSec = duration ? parseInt(duration) : 0;
    const isVoicemail = callStatus === "completed" && durationSec > 0 && durationSec <= 5;
    const isMissed = ["no-answer", "busy", "failed", "canceled"].includes(callStatus) || isVoicemail;
    const isAnswered = callStatus === "completed" && !isVoicemail;

    if (isVoicemail) {
      console.log(`[Twilio Status] 📞 Voicemail detected (duration ${durationSec}s ≤ 5s) — treating as missed`);
    }

    // Si ni manqué ni décroché, on ignore
    if (!isMissed && !isAnswered) {
      return twimlResponse();
    }

    // Trouver le négociant
    const user = await prisma.user.findFirst({
      where: { twilioNumber: to.replace(/\s/g, "") },
    });

    if (!user) {
      console.warn(`[Twilio Status] No user for number ${to}`);
      return twimlResponse();
    }

    // Trouver ou créer le prospect
    const normalizedPhone = from.replace(/\s/g, "");
    let prospect = await prisma.prospect.findUnique({
      where: { phone_userId: { phone: normalizedPhone, userId: user.id } },
      include: { callEvents: true },
    });

    if (!prospect) {
      prospect = await prisma.prospect.create({
        data: {
          phone: normalizedPhone,
          userId: user.id,
          status: "pending",
          isUrgent: false,
        },
        include: { callEvents: true },
      });
    }

    // Créer l'événement d'appel
    await prisma.callEvent.create({
      data: {
        type: isMissed ? "missed" : "answered",
        callSid: callSid || undefined,
        durationSec: duration ? parseInt(duration) : undefined,
        fromPhone: normalizedPhone,
        toPhone: to.replace(/\s/g, ""),
        prospectId: prospect.id,
      },
    });

    // Logique de mise à jour du prospect
    if (isMissed) {
      const missedCount = prospect.callEvents.filter((e) => e.type === "missed").length + 1;
      await prisma.prospect.update({
        where: { id: prospect.id },
        data: {
          status: prospect.status === "postponed" ? "pending" : prospect.status,
          isUrgent: missedCount >= 2,
        },
      });
      console.log(`[Twilio Status] ❌ MISSED CALL from ${normalizedPhone} — missed count: ${missedCount}, urgent: ${missedCount >= 2}`);
    }

    if (isAnswered) {
      if (prospect.status === "pending") {
        await prisma.prospect.update({
          where: { id: prospect.id },
          data: { isUrgent: false },
        });
      }
      console.log(`[Twilio Status] ✅ ANSWERED from ${normalizedPhone} — duration: ${duration}s`);
    }

    return twimlResponse();
  } catch (error) {
    console.error("[Twilio Status] Error:", error);
    return twimlResponse();
  }
}

/** Retourner une réponse TwiML vide (raccroche l'appel proprement) */
function twimlResponse() {
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
    { headers: { "Content-Type": "text/xml" } }
  );
}
