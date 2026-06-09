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

    const userId = Number(session.user.id);
    const level = Number(session.user.level ?? 1);
    const { searchParams } = new URL(req.url);
    const contractId = searchParams.get("contractId");

    let where: any = {};

    if (contractId) {
      where.contractId = Number(contractId);
    }

    // level 4/5는 본인 계약의 스케줄만 조회
    if (level === 4 || level === 5) {
      const ownLeases = await prisma.leaseContract.findMany({
        where: level === 4 ? { landlordId: userId } : { tenantId: userId },
        select: { id: true },
      });
      const ownLeaseIds = ownLeases.map((l) => l.id);

      if (contractId && !ownLeaseIds.includes(Number(contractId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      where.contractId = { in: ownLeaseIds };
    } else if (level !== 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payments = await prisma.paymentSchedule.findMany({
      where,
      include: {
        contract: {
          select: {
            id: true,
            unitId: true,
            landlordId: true,
            tenantId: true,
            unit: { select: { title: true, fullAddress: true } },
          },
        },
        verifiedBy: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("[GET /api/pms/payments]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
