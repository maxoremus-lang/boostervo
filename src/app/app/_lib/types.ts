export type CallbackStatus =
  | "pending"         // À faire
  | "postponed"       // Reporté
  | "unreachable"     // Injoignable
  | "appointment"     // RDV pris
  | "test_drive"      // Essai effectué
  | "quote_sent"      // Devis envoyé
  | "not_interested"  // Pas intéressé
  | "sold";           // Vente conclue

export type CallEvent = {
  id: string;
  at: string;          // ISO datetime
  type: "missed" | "answered";
  // Dérivé de fromPhone côté API. Absent sur les anciens events et sur les mocks locaux
  // → traité comme "inbound" par défaut dans les composants qui l'utilisent.
  direction?: "inbound" | "outbound";
  durationSec?: number;
  ringSec?: number;
};

export type Prospect = {
  id: string;
  phone: string;               // caller phone (source de vérité)
  isKnown: boolean;            // false = NON QUALIFIÉ, true = QUALIFIÉ (au moins un champ de la fiche renseigné : nom, véhicule, prix, budget, notes ou RDV)
  name?: string;               // saisi après rappel
  vehicleInterest?: string;    // ex: "Peugeot 3008 GT 2021"
  vehiclePrice?: number;       // ex: 24990
  budget?: number;             // budget estimé
  notes?: string;
  appointmentAt?: string;      // ISO datetime RDV pris
  status: CallbackStatus;
  isUrgent: boolean;
  callEvents: CallEvent[];     // historique des appels
  lastActivityAt: string;      // ISO datetime
};

export type User = {
  id: string;
  name: string;
  email: string;
  dealership: string | null;
  twilioNumber: string;        // numéro Twilio assigné
};

export type Stats = {
  period: "day" | "week" | "month";
  marginRecovered: number;     // €
  salesCount: number;
  conversionRate: number;      // %
  callbacksDone: number;
  callbackRate: number;        // %
  avgDelayMin: number;
  appointmentsCount: number;
  trends: {
    marginRecovered: number;   // % vs période précédente
    salesCount: number;
    conversionRate: number;
    callbacksDone: number;
    callbackRate: number;
    avgDelayMin: number;
  };
  teamRanking?: { name: string; count: number; isCurrentUser?: boolean }[];
};
