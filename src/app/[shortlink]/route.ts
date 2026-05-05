import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import {
  CLICK_COOKIE_NAME,
  CLICK_COOKIE_MAX_AGE_SEC,
  parseUserAgent,
  extractIp,
  generateCookieId,
} from "../../lib/linkTracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /<slug> — log le clic, pose un cookie d'attribution, redirige vers
// la destination configurée. Slugs valides : a-z, 0-9, _ et -, max 50 chars.
// Tout slug inconnu renvoie 404 (le static routing prend la priorité sur les
// routes existantes type /cgv, /app, /api, etc.).
export async function GET(
  req: NextRequest,
  { params }: { params: { shortlink: string } }
) {
  const slug = (params.shortlink || "").toLowerCase();

  if (!/^[a-z0-9_-]{1,50}$/.test(slug)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const link = await prisma.linkConfig.findUnique({ where: { slug } });
  if (!link || !link.active) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const ip = extractIp(req.headers);
  const ua = req.headers.get("user-agent");
  const referer = req.headers.get("referer");
  const { device, browser, os } = parseUserAgent(ua);
  const cookieId = generateCookieId();

  try {
    await prisma.linkClick.create({
      data: {
        cookieId,
        linkConfigId: link.id,
        ip: ip || null,
        userAgent: ua || null,
        referer: referer || null,
        device,
        browser,
        os,
      },
    });
  } catch (err) {
    console.error("[shortlink] log click failed:", err);
    // On poursuit la redirection même si la DB est down — le visiteur a la priorité.
  }

  // Derrière Traefik, req.nextUrl.origin renvoie l'URL interne (localhost:3000).
  // On reconstruit l'origin public via X-Forwarded-Host / X-Forwarded-Proto
  // pour que Location pointe vers boostervo.fr et pas localhost.
  const fwdProto = req.headers.get("x-forwarded-proto");
  const fwdHost = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const publicOrigin = fwdHost
    ? `${fwdProto || "https"}://${fwdHost}`
    : req.nextUrl.origin;
  const dest = link.destination.startsWith("/")
    ? new URL(link.destination, publicOrigin)
    : new URL(link.destination);

  const response = NextResponse.redirect(dest, 302);
  // First-touch attribution : on ne pose le cookie que s'il n'existe pas déjà.
  // Cas d'usage : un visiteur arrive via /go1 (cookie posé) puis clique sur
  // /manuel-app sur la page signup ; on doit conserver l'attribution /go1
  // pour que la conversion soit créditée à la campagne SMS d'origine.
  // Le LinkClick reste loggé dans tous les cas pour le compteur de clics.
  const existingCookie = req.cookies.get(CLICK_COOKIE_NAME)?.value;
  if (!existingCookie) {
    // sameSite=lax + httpOnly. Pas de secure pour rester cohérent avec le cookie
    // NextAuth (Traefik termine le TLS et l'app voit du HTTP en interne).
    response.cookies.set({
      name: CLICK_COOKIE_NAME,
      value: cookieId,
      maxAge: CLICK_COOKIE_MAX_AGE_SEC,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  }
  return response;
}
