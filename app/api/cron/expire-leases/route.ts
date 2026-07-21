export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ContractStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const isSyncRequest =
      !!authHeader &&
      !!process.env.RBS_SYNC_SECRET &&
      authHeader === `Bearer ${process.env.RBS_SYNC_SECRET}`;

    if (!isSyncRequest) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysLater = new Date(now);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    // 1. EXPIRING_SOON: ACTIVE && now <= endDate <= now+30d
    const { count: expiringSoonCount } = await prisma.leaseContract.updateMany({
      where: { status: ContractStatus.ACTIVE, endDate: { gte: now, lte: thirtyDaysLater } },
      data: { status: ContractStatus.EXPIRING_SOON },
    });

    // 2. EXPIRED: ACTIVE or EXPIRING_SOON && endDate < now
    const expiredLeases = await prisma.leaseContract.findMany({
      where: {
        status: { in: [ContractStatus.ACTIVE, ContractStatus.EXPIRING_SOON] },
        endDate: { lt: now },
      },
      select: { id: true, unitId: true },
    });

    const results = await Promise.all(
      expiredLeases.map(async (lease) => {
        // W2-b 재노출 가드: Unit.status === 2이고 다른 ACTIVE 계약 없을 때만 재노출
        const unit = await prisma.unit.findUnique({
          where: { id: lease.unitId },
          select: { status: true },
        });

        const shouldRestoreUnit =
          unit?.status === 2 &&
          (await prisma.leaseContract.count({
            where: { unitId: lease.unitId, status: ContractStatus.ACTIVE, id: { not: lease.id } },
          })) === 0;

        if (shouldRestoreUnit) {
          await prisma.$transaction([
            prisma.leaseContract.update({
              where: { id: lease.id },
              data: { status: ContractStatus.EXPIRED },
            }),
            prisma.unit.update({
              where: { id: lease.unitId },
              data: { status: 0 },
            }),
          ]);
          return true;
        } else {
          await prisma.leaseContract.update({
            where: { id: lease.id },
            data: { status: ContractStatus.EXPIRED },
          });
          return false;
        }
      })
    );

    const reExposedCount = results.filter(Boolean).length;

    return NextResponse.json({
      expiringSoonCount,
      expiredCount: expiredLeases.length,
      reExposedCount,
    });
  } catch (error) {
    console.error("[POST /api/cron/expire-leases]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
