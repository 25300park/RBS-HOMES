export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const level = Number(session.user.level ?? 1);
    const leaseId = Number(params.id);

    const lease = await prisma.leaseContract.findUnique({
      where: { id: leaseId },
      include: {
        unit: { select: { id: true, title: true, address2: true, address3: true, fullAddress: true } },
        condo: { select: { id: true, condoName: true } },
        landlord: { select: { id: true, name: true, email: true, phone: true } },
        tenant: { select: { id: true, name: true, email: true, phone: true } },
        createdBy: { select: { id: true, name: true } },
        paymentSchedules: { orderBy: { dueDate: "asc" } },
        careRequests: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!lease) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 접근 권한: admin(0)은 전체, landlord(4)는 본인 소유, tenant(5)는 본인 계약
    if (
      level !== 0 &&
      !(level === 4 && lease.landlordId === userId) &&
      !(level === 5 && lease.tenantId === userId)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ lease });
  } catch (error) {
    console.error("[GET /api/pms/leases/[id]]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

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

    const lease = await prisma.leaseContract.update({
      where: { id: leaseId },
      data: {
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
        ...(monthlyRent !== undefined && { monthlyRent: Number(monthlyRent) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
        ...(paymentType !== undefined && { paymentType }),
      },
    });

    return NextResponse.json({ lease });
  } catch (error) {
    console.error("[PATCH /api/pms/leases/[id]]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
