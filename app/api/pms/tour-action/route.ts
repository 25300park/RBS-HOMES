export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const AGENT_LEVELS = [2, 3];

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const level = Number(session.user.level ?? 1);
    if (!AGENT_LEVELS.includes(level)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const agentId = Number(session.user.id);

    const body = await req.json();
    const { scheduleId, action } = body as {
      scheduleId: number;
      action: "approve" | "reject";
    };

    if (!scheduleId || !action) {
      return NextResponse.json({ error: "Missing scheduleId or action" }, { status: 400 });
    }

    // 해당 Schedule 조회 (unitId 포함)
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    // 이미 처리된 투어 요청인지 확인 (status 0만 처리 가능)
    if (schedule.status !== 0) {
      return NextResponse.json({ error: "Already processed" }, { status: 409 });
    }

    // 이 투어가 에이전트 담당 매물에 속하는지 확인
    const unit = await prisma.unit.findFirst({
      where: { id: schedule.unitId, agentId },
      select: { id: true, title: true },
    });

    if (!unit) {
      return NextResponse.json({ error: "Forbidden: not your listing" }, { status: 403 });
    }

    if (action === "reject") {
      await prisma.schedule.update({
        where: { id: scheduleId },
        data: { status: 3, lastUpdate: new Date() },
      });

      return NextResponse.json({ success: true, action: "rejected" });
    }

    if (action === "approve") {
      const confirmedDate = schedule.requestDate ?? schedule.date ?? new Date();
      const applicantName = schedule.username ?? schedule.email ?? "Unknown";
      const scheduleTitle = `Tour: ${unit.title} · ${applicantName}`;

      await prisma.$transaction([
        // Schedule 확정 (status=2, date=requestDate)
        prisma.schedule.update({
          where: { id: scheduleId },
          data: {
            status: 2,
            date: confirmedDate,
            lastUpdate: new Date(),
          },
        }),
        // AgentSchedule 자동 생성
        prisma.agentSchedule.create({
          data: {
            agentId,
            unitId: unit.id,
            title: scheduleTitle,
            date: confirmedDate,
            sourceScheduleId: scheduleId,
          },
        }),
      ]);

      return NextResponse.json({ success: true, action: "approved" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[POST /api/pms/tour-action]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
