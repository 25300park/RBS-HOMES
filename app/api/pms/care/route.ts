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

// 신규 케어 요청 등록 시: Mr. Homes 소속 전담 매니저/직원 및 총괄 관리팀에게 1차 전달
async function notifyNewCareRequest(
  serviceType: string,
  unitTitle: string,
  tenantName: string,
  listingAgentId: number | null,
  senderId: number
) {
  // 1. Mr. Homes 본사 총괄 관리자 및 소속 전담 매니저 (Level 0, Level 20/30)
  const mrhomesStaff = await prisma.user.findMany({
    where: { level: { in: [0, 20, 30] } },
    select: { id: true },
  });

  const recipientIds = new Set<number>();
  mrhomesStaff.forEach((s) => recipientIds.add(s.id));
  
  // 2. 매물 등록 외부 에이전트(A agent) 참고 수신
  if (listingAgentId) recipientIds.add(listingAgentId);
  recipientIds.delete(senderId);

  const title = `[RBS Care Request] ${tenantName} - ${careServiceTypeLabel[serviceType] ?? serviceType}`;
  const content = `[Mr. Homes Property Care Workflow]\nUnit: ${unitTitle}\nTenant: ${tenantName}\nService: ${
    careServiceTypeLabel[serviceType] ?? serviceType
  }\n\n* Operational Guide: Mr. Homes assigned staff coordinates between Tenant, Listing Agent, and Property Owner before finalizing schedule.`;

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
    const { contractId, serviceType, preferredDate, description, isUrgent, reportImageUrl } = body;

    if (!contractId || !serviceType || !preferredDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 본인 계약인지 검증 및 담당 에이전트/브로커 조회
    const lease = await prisma.leaseContract.findUnique({
      where: { id: Number(contractId) },
      select: {
        tenantId: true,
        landlordId: true,
        createdById: true,
        unit: { select: { title: true, agentId: true, adminId: true } },
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
        isUrgent: Boolean(isUrgent),
        reportImageUrl: reportImageUrl ?? null,
      },
    });

    const assignedAgentId = lease.unit.agentId || lease.createdById || lease.unit.adminId || null;

    await notifyNewCareRequest(
      serviceType,
      lease.unit.title,
      session.user.name ?? "A tenant",
      assignedAgentId,
      userId
    );

    return NextResponse.json({ careRequest }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/pms/care]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
