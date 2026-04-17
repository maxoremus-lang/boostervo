import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

/**
 * POST /api/webhooks/twilio/status
 *
 * Appelé par Twilio après chaque appel (ou tentative).
 * Crée un CallEvent et gère la logique prospect (création, urgence).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const callSid = body.get("CallSid") as string;
    const callStatus = body.get("CallStatus") as string; // completed, no-answer, busy, failed, canceled
    const from = body.get("From") as string;             // Numéro de l'appelant
    const to = body.get("To") as string;                 // Numéro Twilio
    const duration = body.get("CallDuration") as string;

    console.log(`[Twilio Status] SID:${callSid} from:${from} to:${to} status:${callStatus} duration:${duration}`);

    if (!from || !to || !callStatus) {
      return NextResponse.json({ ok: false, error: "missing params" }, { status: 400 });
    }

    // Déterminer le type d'événement
    const isMissed = ["no-answer", "busy", "failed"].includes(callStatus);
    const isAnswered = callStatus === "completed";

    // Si ni manqué ni décroché (ex: "ringing", "initiated"), on ignore
    if (!isMissed && !isAnswered) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    // Trouver le négociant
    const user = await prisma.user.findFirst({
      where: { twilioNumber: to.replace(/\s/g, "") },
    });

    if (!user) {
      console.warn(`[Twilio Status] No user for number ${to}`);
      return NextResponse.json({ ok: false, error: "unknown number" }, { status: 404 });
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
      // Compter les appels manqués sans réponse intermédiaire
      const missedCount = prospect.callEvents.filter((e) => e.type === "missed").length + 1;

      await prisma.prospect.update({
        where: { id: prospect.id },
        data: {
          // Remettre en "pending" si c'était "postponed" et que le prospect rappelle
          status: prospect.status === "postponed" ? "pending" : prospect.status,
          // Urgent si ≥2 appels manqués
          isUrgent: missedCount >= 2,
        },
      });
    }

    if (isAnswered && prospect.status === "pending") {
      // L'appel a été décroché — on ne change pas le statut automatiquement
      // Le négociant remplira la fiche manuellement dans l'appli
      // Mais on enlève l'urgence si l'appel est pris
      await prisma.prospect.update({
        where: { id: prospect.id },
        data: { isUrgent: false },
      });
    }

    return NextResponse.json({ ok: true, prospectId: prospect.id, type: isMissed ? "missed" : "answered" });
  } catch (error) {
    console.error("[Twilio Status] Error:", error);
    return NextResponse.json({ ok: false, error: "internal error" }, { status: 500 });
  }
}
