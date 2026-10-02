export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET 제거됨 (호출부 없음). PATCH는 RBS_SYNC_SECRET을 쓰지 않는 순수 세션 기반 admin 전용 API라 그대로 유지.
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const level = Number(session.user.level ?? 1);
    if (level !== 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const leaseId = Number(params.id);
    const body = await req.json();
    const { status, notes, monthlyRent, endDate, paymentType } = body;

    const existing = await prisma.leaseContract.findUnique({ where: { id: leaseId } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const leaseUpdateData = {
      ...(status !== undefined && { status }),
      ...(notes !== undefined && { notes }),
      ...(monthlyRent !== undefined && { monthlyRent: Number(monthlyRent) }),
      ...(endDate !== undefined && { endDate: new Date(endDate) }),
      ...(paymentType !== undefined && { paymentType }),
    };

    const isTerminating = status === "EXPIRED" || status === "TERMINATED";

    let lease;

    if (isTerminating) {
      // 재노출 가드: Unit.status가 정확히 2(Contracted)일 때만 판단
      const unit = await prisma.unit.findUnique({
        where: { id: existing.unitId },
        select: { status: true },
      });

      const shouldRestoreUnit =
        unit?.status === 2 &&
        (await prisma.leaseContract.count({
          where: { unitId: existing.unitId, status: "ACTIVE", id: { not: leaseId } },
        })) === 0;

      if (shouldRestoreUnit) {
        [lease] = await prisma.$transaction([
          prisma.leaseContract.update({ where: { id: leaseId }, data: leaseUpdateData }),
          prisma.unit.update({ where: { id: existing.unitId }, data: { status: 0 } }),
        ]);
      } else {
        lease = await prisma.leaseContract.update({ where: { id: leaseId }, data: leaseUpdateData });
      }
    } else {
      lease = await prisma.leaseContract.update({ where: { id: leaseId }, data: leaseUpdateData });
    }

    return NextResponse.json({ lease });
  } catch (error) {
    console.error("[PATCH /api/pms/leases/[id]]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
