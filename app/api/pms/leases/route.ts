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

    const userId = Number(session.user.id);
    const level = Number(session.user.level ?? 1);

    let where: any = {};

    if (level === 4) {
      // Landlord: 본인 소유 유닛의 계약
      where = { landlordId: userId };
    } else if (level === 5) {
      // Tenant: 본인이 임차인인 계약
      where = { tenantId: userId };
    } else if (level === 0) {
      // Admin: 전체 (where 조건 없음)
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const leases = await prisma.leaseContract.findMany({
      where,
      include: {
        unit: { select: { id: true, title: true, address2: true, address3: true, fullAddress: true } },
        condo: { select: { id: true, condoName: true } },
        landlord: { select: { id: true, name: true, email: true, phone: true } },
        tenant: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ leases });
  } catch (error) {
    console.error("[GET /api/pms/leases]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions as any);

    const authHeader = req.headers.get("authorization");
    const isSyncRequest =
      !!authHeader &&
      !!process.env.RBS_SYNC_SECRET &&
      authHeader === `Bearer ${process.env.RBS_SYNC_SECRET}`;

    if (!session?.user?.id && !isSyncRequest) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session?.user?.id) {
      const level = Number(session.user.level ?? 1);
      if (level !== 0) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const createdById = session?.user?.id ? Number(session.user.id) : null;
    const body = await req.json();
    const {
      unitId,
      condoId,
      landlordId,
      tenantId,
      startDate,
      endDate,
      monthlyRent,
      paymentType,
      notes,
      crmDealId,
    } = body;

    if (!unitId || !startDate || !endDate || !monthlyRent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }

    // 납부 스케줄 생성: 계약 기간 동안 매월 1건
    const paymentDates: Date[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      paymentDates.push(new Date(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const [lease] = await prisma.$transaction([
      prisma.leaseContract.create({
        data: {
          unitId: Number(unitId),
          condoId: condoId ? Number(condoId) : null,
          landlordId: landlordId ? Number(landlordId) : null,
          tenantId: tenantId ? Number(tenantId) : null,
          startDate: start,
          endDate: end,
          monthlyRent: Number(monthlyRent),
          paymentType: paymentType ?? "MONTHLY_TRANSFER",
          status: ContractStatus.ACTIVE,
          notes: notes ?? null,
          crmDealId: crmDealId ?? null,
          createdById,
          paymentSchedules: {
            createMany: {
              data: paymentDates.map((d) => ({
                dueDate: d,
                amountDue: Number(monthlyRent),
              })),
            },
          },
        },
        include: {
          paymentSchedules: true,
        },
      }),
      prisma.unit.update({
        where: { id: Number(unitId) },
        data: { status: 2 },
      }),
    ]);

    return NextResponse.json({ leaseId: lease.id, ...lease }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/pms/leases]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
