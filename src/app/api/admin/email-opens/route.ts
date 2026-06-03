import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Non autorisé" }, { status: 401 }) };
  }
  if ((session.user as { role?: string }).role !== "admin") {
    return { error: NextResponse.json({ error: "Accès interdit" }, { status: 403 }) };
  }
  return { session };
}

// GET /api/admin/email-opens
// Ouvertures d'emails agrégées par campagne : total d'ouvertures, destinataires
// uniques ayant ouvert, première et dernière ouverture.
export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const rows = await prisma.emailOpen.findMany({
    select: { campaign: true, recipient: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  type Agg = {
    campaign: string;
    opens: number;
    recipients: Set<string>;
    anon: number;
    firstAt: string;
    lastAt: string;
  };
  const map = new Map<string, Agg>();

  for (const r of rows) {
    let a = map.get(r.campaign);
    const iso = new Date(r.createdAt).toISOString();
    if (!a) {
      a = {
        campaign: r.campaign,
        opens: 0,
        recipients: new Set(),
        anon: 0,
        firstAt: iso,
        lastAt: iso,
      };
      map.set(r.campaign, a);
    }
    a.opens++;
    if (r.recipient) a.recipients.add(r.recipient.toLowerCase());
    else a.anon++;
    if (iso < a.firstAt) a.firstAt = iso;
    if (iso > a.lastAt) a.lastAt = iso;
  }

  const campaigns = Array.from(map.values())
    .map((a) => ({
      campaign: a.campaign,
      opens: a.opens,
      uniqueRecipients: a.recipients.size + a.anon,
      firstAt: a.firstAt,
      lastAt: a.lastAt,
    }))
    .sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1));

  const totalOpens = rows.length;

  return NextResponse.json({ totalOpens, campaigns });
}
