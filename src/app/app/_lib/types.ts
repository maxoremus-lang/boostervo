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
  durationSec?: number;
  ringSec?: number;
};

export type Prospect = {
  id: string;
  phone: string;               // caller phone (source de vérité)
  isKnown: boolean;            // false = NON QUALIFIÉ, true = QUALIFIÉ (≥1 appel décroché OU nom saisi sur la fiche)
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
  dealership: string;
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
  byDay: { day: string; count: number; isToday?: boolean }[];
  teamRanking?: { name: string; count: number; isCurrentUser?: boolean }[];
};
