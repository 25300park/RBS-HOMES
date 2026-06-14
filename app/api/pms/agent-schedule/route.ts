export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const level = Number(session.user.level ?? 1);
    if (level !== 2) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const agentId = Number(session.user.id);
    const body = await req.json();
    const { title, date, unitId, memo } = body;

    if (!title || !date) {
      return NextResponse.json({ error: "title and date are required" }, { status: 400 });
    }

    const schedule = await prisma.agentSchedule.create({
      data: {
        agentId,
        title,
        date: new Date(date),
        unitId: unitId ? Number(unitId) : undefined,
        memo: memo || undefined,
      },
    });

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("[POST /api/pms/agent-schedule]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
