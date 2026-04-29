import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

const TOTAL_SLOTS = 50;

export async function GET() {
  try {
    const taken = await prisma.user.count({ where: { role: "negotiant" } });
    return NextResponse.json({ taken, total: TOTAL_SLOTS });
  } catch (e) {
    return NextResponse.json({ taken: 0, total: TOTAL_SLOTS });
  }
}
