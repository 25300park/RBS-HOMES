export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// 케어 서비스 상태 변경 시 관련자에게 알림 생성
const careStatusNotifications: Record<
  string,
  { recipient: "landlord" | "tenant"; title: string; content: (unitTitle: string) => string }
> = {
  "PENDING->PENDING_OWNER_APPROVAL": {
    recipient: "landlord",
    title: "Care Service Approval Needed",
    content: (unitTitle) => `A care service request for ${unitTitle} needs your approval.`,
  },
  "PENDING_OWNER_APPROVAL->SCHEDULED": {
    recipient: "tenant",
    title: "Care Service Scheduled",
    content: (unitTitle) => `Your care service request for ${unitTitle} has been scheduled.`,
  },
  "IN_PROGRESS->AWAITING_TENANT_CONFIRMATION": {
    recipient: "tenant",
    title: "Please Confirm Care Service Completion",
    content: (unitTitle) => `Please confirm the completed care service for ${unitTitle}.`,
  },
  "AWAITING_TENANT_CONFIRMATION->COMPLETED": {
    recipient: "landlord",
    title: "Care Service Completed",
    content: (unitTitle) =>
      `The care service for ${unitTitle} has been confirmed as completed by the tenant.`,
  },
};

async function notifyCareStatusChange(
  existing: {
    status: string;
    contract: { tenantId: number | null; landlordId: number | null; unit: { title: string } };
  },
  newStatus: string,
  actorId: number
) {
  const transition = careStatusNotifications[`${existing.status}->${newStatus}`];
  if (!transition) return;

  const recipientId =
    transition.recipient === "landlord" ? existing.contract.landlordId : existing.contract.tenantId;
  if (!recipientId) return;

  const message = await prisma.message.create({
    data: {
      senderId: actorId,
      recipientId,
      title: transition.title,
      content: transition.content(existing.contract.unit.title),
      type: 1,
    },
  });

  await prisma.notification.create({
    data: {
      messageId: message.id,
      userId: recipientId,
      type: 1,
    },
  });
}

// level 0: 전체 수정 / level 4: 본인 유닛 케어의 PENDING_OWNER_APPROVAL → SCHEDULED 승인만 가능
// level 5: 본인 계약의 케어만, 취소 또는 완료 확인(AWAITING_TENANT_CONFIRMATION → COMPLETED)만 가능
export async function PATCH(
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
    const careId = Number(params.id);

    const existing = await prisma.careServiceRequest.findUnique({
      where: { id: careId },
      include: {
        contract: {
          select: { tenantId: true, landlordId: true, unit: { select: { title: true } } },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();

    if (level === 5) {
      // 임차인: 본인 계약의 케어만
      if (existing.contract.tenantId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (body.status === "CANCELLED") {
        const updated = await prisma.careServiceRequest.update({
          where: { id: careId },
          data: { status: "CANCELLED" },
        });

        return NextResponse.json({ careRequest: updated });
      }

      if (existing.status === "AWAITING_TENANT_CONFIRMATION" && body.status === "COMPLETED") {
        const updated = await prisma.careServiceRequest.update({
          where: { id: careId },
          data: { status: "COMPLETED", completedAt: new Date() },
        });

        await notifyCareStatusChange(existing, "COMPLETED", userId);

        return NextResponse.json({ careRequest: updated });
      }

      return NextResponse.json(
        { error: "Tenant can only cancel a care request or confirm its completion" },
        { status: 403 }
      );
    }

    if (level === 4) {
      // 오너: 본인 유닛의 케어 승인만 가능
      if (existing.contract.landlordId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (existing.status !== "PENDING_OWNER_APPROVAL" || body.status !== "SCHEDULED") {
        return NextResponse.json(
          { error: "Owner can only approve a care request awaiting approval" },
          { status: 403 }
        );
      }

      const updated = await prisma.careServiceRequest.update({
        where: { id: careId },
        data: {
          status: "SCHEDULED",
          scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : new Date(),
        },
      });

      await notifyCareStatusChange(existing, "SCHEDULED", userId);

      return NextResponse.json({ careRequest: updated });
    }

    if (level !== 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 관리자: 전체 필드 수정 가능
    const {
      status,
      scheduledAt,
      completedAt,
      assignedTo,
      price,
      reportImageUrl,
      description,
    } = body;

    const updated = await prisma.careServiceRequest.update({
      where: { id: careId },
      data: {
        ...(status !== undefined && { status }),
        ...(scheduledAt !== undefined && { scheduledAt: new Date(scheduledAt) }),
        ...(completedAt !== undefined && { completedAt: new Date(completedAt) }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(price !== undefined && { price: Number(price) }),
        ...(reportImageUrl !== undefined && { reportImageUrl }),
        ...(description !== undefined && { description }),
      },
    });

    if (status !== undefined && status !== existing.status) {
      await notifyCareStatusChange(existing, status, userId);
    }

    return NextResponse.json({ careRequest: updated });
  } catch (error) {
    console.error("[PATCH /api/pms/care/[id]]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
