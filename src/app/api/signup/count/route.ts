import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

const TOTAL_SLOTS = 50;
// Offset social-proof : démarre le compteur à 4 même quand la DB est quasi vide.
// Ajuster via env SIGNUP_COUNT_OFFSET sans redéployer.
const BASELINE_OFFSET = Number(process.env.SIGNUP_COUNT_OFFSET ?? 3);

export async function GET() {
  try {
    const real = await prisma.user.count({ where: { role: "negotiant" } });
    const taken = Math.min(real + BASELINE_OFFSET, TOTAL_SLOTS);
    return NextResponse.json({ taken, total: TOTAL_SLOTS });
  } catch (e) {
    return NextResponse.json({ taken: BASELINE_OFFSET, total: TOTAL_SLOTS });
  }
}
