export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ContractStatus } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const level = Number(session.user.level ?? 1);
    if (level !== 4) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = Number(session.user.id);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const leases = await prisma.leaseContract.findMany({
      where: {
        landlordId: userId,
        status: ContractStatus.ACTIVE,
      },
      include: {
        unit: { select: { id: true, title: true, address1: true, address2: true } },
        tenant: { select: { id: true, name: true, email: true } },
        paymentSchedules: {
          where: { dueDate: { gte: sixMonthsAgo } },
          orderBy: { dueDate: "desc" },
        },
        careRequests: {
          where: {
            status: {
              in: [
                "PENDING",
                "PENDING_OWNER_APPROVAL",
                "SCHEDULED",
                "IN_PROGRESS",
                "AWAITING_TENANT_CONFIRMATION",
              ],
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { startDate: "desc" },
    });

    const leasesWithSummary = leases.map((lease) => {
      const paymentSummary = lease.paymentSchedules.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return { ...lease, paymentSummary };
    });

    return NextResponse.json({ leases: leasesWithSummary });
  } catch (error) {
    console.error("[GET /api/pms/owner-dashboard]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
