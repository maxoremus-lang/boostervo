import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Pages publiques de l'appli (pas besoin d'auth)
  if (pathname === "/app/login") return NextResponse.next();

  // Fichiers statiques PWA (servis depuis public/app/) — ne pas protéger
  if (
    pathname === "/app/sw.js" ||
    pathname === "/app/manifest.json" ||
    /^\/app\/icon-.*\.(png|svg|ico)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Toutes les autres pages /app/* nécessitent une session
  if (pathname.startsWith("/app")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      // Notre authOptions force ce nom de cookie (pas de préfixe __Secure-)
      // pour fonctionner derrière Traefik. Sans ça, getToken() cherche
      // __Secure-next-auth.session-token en HTTPS et ne trouve jamais le cookie.
      cookieName: "next-auth.session-token",
    });
    if (!token) {
      // Utiliser le host de la requête (ou NEXTAUTH_URL) pour le redirect
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "boostervo.fr";
      const proto = req.headers.get("x-forwarded-proto") || "https";
      const baseUrl = `${proto}://${host}`;
      const loginUrl = new URL("/app/login", baseUrl);
      loginUrl.searchParams.set("callbackUrl", `${baseUrl}${pathname}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Les webhooks Twilio sont publics (authentifiés par signature Twilio)
  // Les API /api/* sont protégées côté handler par getServerSession

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
