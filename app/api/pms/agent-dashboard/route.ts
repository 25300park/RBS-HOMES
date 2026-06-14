export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
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
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const units = await prisma.unit.findMany({
      where: { agentId },
      select: {
        id: true,
        title: true,
        type: true,
        sellType: true,
        status: true,
        price: true,
        address1: true,
        address2: true,
        regdate: true,
        viewCount: true,
      },
      orderBy: { regdate: "desc" },
    });

    const unitIds = units.map((u) => u.id);

    const [schedules, tourRequests] = await Promise.all([
      prisma.agentSchedule.findMany({
        where: { agentId, date: { gte: startOfToday } },
        orderBy: { date: "asc" },
        take: 10,
        include: { unit: { select: { id: true, title: true } } },
      }),
      unitIds.length === 0
        ? Promise.resolve([])
        : prisma.schedule.findMany({
            where: { unitId: { in: unitIds }, status: { not: 3 } },
            orderBy: { date: "desc" },
            take: 10,
          }),
    ]);

    return NextResponse.json({ units, schedules, tourRequests });
  } catch (error) {
    console.error("[GET /api/pms/agent-dashboard]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
