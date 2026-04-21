import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import twilio from "twilio";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

/**
 * POST /api/twilio/token
 *
 * Retourne un Twilio Access Token valable 1h pour le user connecté.
 * Le token autorise UNIQUEMENT les appels sortants via la TwiML App
 * configurée (TWILIO_TWIML_APP_SID). Pas d'appel entrant via WebRTC.
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  // Vérifie les credentials Twilio requis
  const {
    TWILIO_ACCOUNT_SID: accountSid,
    TWILIO_API_KEY_SID: apiKeySid,
    TWILIO_API_KEY_SECRET: apiKeySecret,
    TWILIO_TWIML_APP_SID: twimlAppSid,
  } = process.env;

  if (!accountSid || !apiKeySid || !apiKeySecret || !twimlAppSid) {
    console.error("[twilio/token] credentials manquants en env");
    return NextResponse.json(
      { error: "Configuration Twilio incomplète côté serveur" },
      { status: 500 },
    );
  }

  // Vérifie que le user a bien un numéro Twilio assigné (sinon callerId impossible)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twilioNumber: true },
  });
  if (!user?.twilioNumber) {
    return NextResponse.json(
      { error: "Aucun numéro Twilio assigné à ce compte" },
      { status: 400 },
    );
  }

  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, {
    identity: userId,
    ttl: 3600,
  });

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: twimlAppSid,
    incomingAllow: false,
  });
  token.addGrant(voiceGrant);

  return NextResponse.json({
    token: token.toJwt(),
    identity: userId,
    expiresInSec: 3600,
  });
}
