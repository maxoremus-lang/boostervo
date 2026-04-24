import type { Prospect, User, Stats } from "./types";

export const currentUser: User = {
  id: "u1",
  name: "Jean Martin",
  email: "jean.martin@concession-lyon.fr",
  dealership: "Concession Lyon Est",
  twilioNumber: "+33 1 59 16 87 72",
};

// Helper : date relative
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export const prospects: Prospect[] = [
  {
    id: "p1",
    phone: "+33 6 14 28 35 77",
    isKnown: false,
    status: "pending",
    isUrgent: true,
    lastActivityAt: minutesAgo(134),
    callEvents: [
      { id: "c1", at: minutesAgo(18), type: "missed", ringSec: 18 },
      { id: "c2", at: minutesAgo(54), type: "missed", ringSec: 22 },
      { id: "c3", at: minutesAgo(16 * 60), type: "missed", ringSec: 15 },
    ],
  },
  {
    id: "p2",
    phone: "+33 6 28 44 91 02",
    isKnown: true,
    name: "Sophie Leroy",
    vehicleInterest: "Peugeot 3008 GT 2021",
    vehiclePrice: 24990,
    budget: 25000,
    notes: "Budget 25K€, financement possible. Veut essayer la GT en boîte auto.",
    status: "pending",
    isUrgent: true,
    lastActivityAt: minutesAgo(108),
    callEvents: [
      { id: "c5", at: minutesAgo(108), type: "missed", ringSec: 20 },
      { id: "c6", at: minutesAgo(180), type: "missed", ringSec: 18 },
    ],
  },
  {
    id: "p3",
    phone: "+33 6 22 85 12 44",
    isKnown: false,
    status: "pending",
    isUrgent: false,
    lastActivityAt: minutesAgo(35),
    callEvents: [
      { id: "c7", at: minutesAgo(35), type: "missed", ringSec: 19 },
    ],
  },
  {
    id: "p4",
    phone: "+33 6 33 52 17 88",
    isKnown: true,
    name: "Marc Dubois",
    vehicleInterest: "Citroën C3",
    vehiclePrice: 14500,
    status: "pending",
    isUrgent: false,
    lastActivityAt: minutesAgo(12),
    callEvents: [
      { id: "c8", at: minutesAgo(12), type: "missed", ringSec: 21 },
    ],
  },
  {
    id: "p5",
    phone: "+33 7 82 14 67 03",
    isKnown: false,
    status: "pending",
    isUrgent: false,
    lastActivityAt: minutesAgo(48),
    callEvents: [
      { id: "c9", at: minutesAgo(48), type: "missed", ringSec: 14 },
    ],
  },
  {
    id: "p6",
    phone: "+33 6 55 71 20 11",
    isKnown: true,
    name: "Karim Benali",
    vehicleInterest: "Renault Captur",
    vehiclePrice: 17900,
    status: "unreachable",
    isUrgent: false,
    lastActivityAt: minutesAgo(120),
    callEvents: [
      { id: "c10", at: minutesAgo(120), type: "missed", ringSec: 25 },
    ],
  },
  {
    id: "p7",
    phone: "+33 6 12 48 55 09",
    isKnown: true,
    name: "Élise Moreau",
    vehicleInterest: "Dacia Sandero",
    vehiclePrice: 11200,
    status: "appointment",
    isUrgent: false,
    lastActivityAt: minutesAgo(240),
    callEvents: [
      { id: "c11", at: minutesAgo(245), type: "answered", durationSec: 178 },
    ],
  },
  {
    id: "p8",
    phone: "+33 6 78 90 23 45",
    isKnown: true,
    name: "Thomas Girard",
    vehicleInterest: "VW Golf",
    vehiclePrice: 18500,
    status: "quote_sent",
    isUrgent: false,
    lastActivityAt: minutesAgo(360),
    callEvents: [
      { id: "c12", at: minutesAgo(365), type: "answered", durationSec: 312 },
    ],
  },
  {
    id: "p9",
    phone: "+33 6 41 66 78 22",
    isKnown: true,
    name: "Pascale Durand",
    vehicleInterest: "Toyota Yaris",
    vehiclePrice: 13400,
    status: "test_drive",
    isUrgent: false,
    lastActivityAt: minutesAgo(480),
    callEvents: [
      { id: "c13", at: minutesAgo(485), type: "answered", durationSec: 195 },
    ],
  },
  {
    id: "p10",
    phone: "+33 6 99 88 77 66",
    isKnown: true,
    name: "Patrick Roche",
    vehicleInterest: "BMW Série 1",
    vehiclePrice: 22500,
    status: "postponed",
    isUrgent: false,
    lastActivityAt: minutesAgo(90),
    callEvents: [
      { id: "c14", at: minutesAgo(90), type: "missed", ringSec: 16 },
    ],
  },
  {
    id: "p11",
    phone: "+33 6 47 23 91 56",
    isKnown: true,
    name: "Julien Fabre",
    vehicleInterest: "Peugeot 208",
    vehiclePrice: 12900,
    status: "sold",
    isUrgent: false,
    lastActivityAt: minutesAgo(1440),
    callEvents: [
      { id: "c15", at: minutesAgo(1445), type: "answered", durationSec: 420 },
    ],
  },
];

export const stats: Stats = {
  period: "week",
  marginRecovered: 12450,
  salesCount: 4,
  conversionRate: 15,
  callbacksDone: 27,
  callbackRate: 89,
  avgDelayMin: 12,
  appointmentsCount: 9,
  trends: {
    marginRecovered: 18,
    salesCount: 1,
    conversionRate: 3,
    callbacksDone: 12,
    callbackRate: 4,
    avgDelayMin: -3,
  },
  byDay: [
    { day: "L", count: 12 },
    { day: "M", count: 20 },
    { day: "M", count: 17 },
    { day: "J", count: 25 },
    { day: "V", count: 30, isToday: true },
    { day: "S", count: 5 },
    { day: "D", count: 2 },
  ],
  teamRanking: [
    { name: "Laura P.", count: 34 },
    { name: "Jean M.", count: 27, isCurrentUser: true },
    { name: "Hervé T.", count: 22 },
  ],
};

// Helpers
export function getProspect(id: string): Prospect | undefined {
  return prospects.find((p) => p.id === id);
}

export function formatRelativeTime(iso: string): string {
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  const diffD = Math.round(diffH / 24);
  return `il y a ${diffD}j`;
}

/** Clé "YYYY-MM-DD" du jour Paris — sert à comparer "même jour" indépendamment de la TZ serveur. */
function parisDayKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);
}

// Formatte "il y a 3j · 26 avr. 26" — relatif + date absolue (tout en heure de Paris)
// Pour aujourd'hui on affiche juste le relatif.
export function formatRelativeWithDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const relative = formatRelativeTime(iso);

  if (parisDayKey(d) === parisDayKey(now)) return relative;

  // Format "26 avr. 26" en TZ Paris
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "numeric", month: "short", year: "2-digit",
  }).formatToParts(d);
  const day = parts.find(p => p.type === "day")?.value ?? "";
  const month = (parts.find(p => p.type === "month")?.value ?? "").replace(".", "");
  const year = parts.find(p => p.type === "year")?.value ?? "";
  return `${relative} · ${day} ${month}. ${year}`;
}

export function missedCallsCount(p: Prospect): number {
  // Seuls les appels entrants manqués comptent : un outbound-missed (tentative sortante
  // sans réponse) n'est pas un "appel manqué" au sens prospect → nous.
  return p.callEvents.filter((e) => e.type === "missed" && e.direction !== "outbound").length;
}
