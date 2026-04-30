// Helpers pour le tracking des liens courts (boostervo.fr/go1, /go2, …).
// Côté serveur : parse user-agent + lecture/écriture du cookie d'attribution.

export const CLICK_COOKIE_NAME = "bvo_clk";
export const CLICK_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 jours

type ParsedUA = {
  device: "mobile" | "desktop" | "tablet";
  browser: string;
  os: string;
};

// Parser minimaliste — pas de dépendance externe pour rester léger.
// Couvre les cas les plus fréquents (iOS/Android/Windows/macOS, Chrome/Safari/Firefox/Edge).
export function parseUserAgent(ua: string | null | undefined): ParsedUA {
  const s = (ua || "").toLowerCase();

  let os = "Inconnu";
  if (/iphone|ipad|ipod/.test(s)) os = "iOS";
  else if (/android/.test(s)) os = "Android";
  else if (/windows/.test(s)) os = "Windows";
  else if (/mac os x|macintosh/.test(s)) os = "macOS";
  else if (/linux/.test(s)) os = "Linux";

  let browser = "Inconnu";
  if (/edg\//.test(s)) browser = "Edge";
  else if (/chrome\//.test(s) && !/edg\//.test(s)) browser = "Chrome";
  else if (/firefox\//.test(s)) browser = "Firefox";
  else if (/safari\//.test(s) && !/chrome\//.test(s)) browser = "Safari";
  else if (/opera|opr\//.test(s)) browser = "Opera";

  let device: ParsedUA["device"] = "desktop";
  if (/ipad|tablet/.test(s)) device = "tablet";
  else if (/mobile|iphone|ipod|android.*mobile/.test(s)) device = "mobile";

  return { device, browser, os };
}

// Récupère l'IP réelle derrière Traefik (X-Forwarded-For peut contenir une liste).
export function extractIp(headers: Headers): string | null {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") || null;
}

// Génère un identifiant unique pour le cookie (base64url, 16 octets ≈ 22 caractères).
export function generateCookieId(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && (crypto as any).getRandomValues) {
    (crypto as any).getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
