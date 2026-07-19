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
    if (![2, 3].includes(level)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const agentId = Number(session.user.id);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfTomorrow = new Date(startOfToday);
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 2); // today 00:00 ~ tomorrow 23:59:59

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

    const [schedules, tourRequests, pendingTourCount, upcomingSchedules] = await Promise.all([
      // MY SCHEDULE: 오늘 이후 전체
      prisma.agentSchedule.findMany({
        where: { agentId, date: { gte: startOfToday } },
        orderBy: { date: "asc" },
        take: 10,
        include: { unit: { select: { id: true, title: true } } },
      }),
      // TOUR REQUESTS: 취소(3) 제외 전체
      unitIds.length === 0
        ? Promise.resolve([])
        : prisma.schedule.findMany({
            where: { unitId: { in: unitIds }, status: { not: 3 } },
            orderBy: { regdate: "desc" },
            take: 20,
          }),
      // 지금 할 일: 대기 중인 투어 요청 수 (status=0)
      unitIds.length === 0
        ? Promise.resolve(0)
        : prisma.schedule.count({
            where: { unitId: { in: unitIds }, status: 0 },
          }),
      // 지금 할 일: 오늘·내일 AgentSchedule
      prisma.agentSchedule.findMany({
        where: { agentId, date: { gte: startOfToday, lt: endOfTomorrow } },
        orderBy: { date: "asc" },
        include: { unit: { select: { id: true, title: true } } },
      }),
    ]);

    return NextResponse.json({
      units,
      schedules,
      tourRequests,
      todoSummary: {
        pendingTourCount,
        upcomingSchedules,
      },
    });
  } catch (error) {
    console.error("[GET /api/pms/agent-dashboard]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
