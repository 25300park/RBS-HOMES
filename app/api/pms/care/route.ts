export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const careServiceTypeLabel: Record<string, string> = {
  AIRCON: "Air Conditioning",
  CLEANING: "Cleaning",
  REPAIR: "Repair",
  HANDYMAN: "Handyman",
};

// 신규 케어 요청 등록 시 오너/관리자에게 알림 전송
async function notifyNewCareRequest(
  serviceType: string,
  unitTitle: string,
  tenantName: string,
  landlordId: number | null,
  senderId: number
) {
  const admins = await prisma.user.findMany({
    where: { level: 0 },
    select: { id: true },
  });

  const recipientIds = new Set<number>();
  if (landlordId) recipientIds.add(landlordId);
  admins.forEach((a) => recipientIds.add(a.id));
  recipientIds.delete(senderId);

  const title = "New Care Service Request";
  const content = `${tenantName} requested ${
    careServiceTypeLabel[serviceType] ?? serviceType
  } for ${unitTitle}.`;

  for (const recipientId of Array.from(recipientIds)) {
    const message = await prisma.message.create({
      data: {
        senderId,
        recipientId,
        title,
        content,
        type: 1,
      },
    });

    await prisma.notification.create({
      data: { messageId: message.id, userId: recipientId, type: 1 },
    });
  }
}

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

    // level 4/5는 본인 계약의 케어만 조회
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

    const careRequests = await prisma.careServiceRequest.findMany({
      where,
      include: {
        contract: {
          select: {
            id: true,
            unit: { select: { title: true, fullAddress: true } },
            tenant: { select: { id: true, name: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ careRequests });
  } catch (error) {
    console.error("[GET /api/pms/care]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const level = Number(session.user.level ?? 1);

    if (level !== 5) {
      return NextResponse.json({ error: "Forbidden: tenant only" }, { status: 403 });
    }

    const body = await req.json();
    const { contractId, serviceType, preferredDate, description } = body;

    if (!contractId || !serviceType || !preferredDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 본인 계약인지 검증
    const lease = await prisma.leaseContract.findUnique({
      where: { id: Number(contractId) },
      select: {
        tenantId: true,
        landlordId: true,
        unit: { select: { title: true } },
      },
    });

    if (!lease || lease.tenantId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const careRequest = await prisma.careServiceRequest.create({
      data: {
        contractId: Number(contractId),
        serviceType,
        preferredDate: new Date(preferredDate),
        description: description ?? null,
      },
    });

    await notifyNewCareRequest(
      serviceType,
      lease.unit.title,
      session.user.name ?? "A tenant",
      lease.landlordId,
      userId
    );

    return NextResponse.json({ careRequest }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/pms/care]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
