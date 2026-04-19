import type { CallbackStatus } from "../_lib/types";

const styles: Record<CallbackStatus | "urgent" | "new" | "known", string> = {
  pending: "bg-orange-100 text-orange-700",
  postponed: "bg-blue-100 text-blue-700",
  unreachable: "bg-amber-100 text-amber-800",
  appointment: "bg-violet-100 text-violet-700",
  test_drive: "bg-violet-100 text-violet-700",
  quote_sent: "bg-violet-100 text-violet-700",
  not_interested: "bg-gray-100 text-gray-600",
  sold: "bg-emerald-100 text-emerald-800",
  urgent: "bg-red-100 text-red-700",
  new: "bg-purple-100 text-purple-700",
  known: "bg-indigo-100 text-indigo-700",
};

const labels: Record<CallbackStatus, string> = {
  pending: "À faire",
  postponed: "Reporté",
  unreachable: "Injoignable",
  appointment: "RDV pris",
  test_drive: "Essai effectué",
  quote_sent: "Devis envoyé",
  not_interested: "Pas intéressé",
  sold: "Vendu",
};

export function StatusBadge({ status }: { status: CallbackStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export function UrgentBadge() {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${styles.urgent}`}>
      Urgent
    </span>
  );
}

export function NewBadge() {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${styles.new}`}>
      INCONNU
    </span>
  );
}

export function KnownBadge() {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${styles.known}`}>
      QUALIFIÉ
    </span>
  );
}
