export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CareStatus } from "@prisma/client";

// 케어 서비스 상태 변경 시 관련자에게 알림 생성
const careStatusNotifications: Record<
  string,
  { recipient: "landlord" | "tenant" | "staff"; title: string; content: (unitTitle: string) => string }
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
  "SCHEDULED->IN_PROGRESS": {
    recipient: "tenant",
    title: "Work Has Started",
    content: (unitTitle) => `Work on your care request for ${unitTitle} has started.`,
  },
  "AWAITING_TENANT_CONFIRMATION->PENDING_STAFF_REVIEW": {
    recipient: "staff",
    title: "Tenant Submitted Completion Report",
    content: (unitTitle) => `Tenant reported work complete for ${unitTitle} — needs your review.`,
  },
  "PENDING_STAFF_REVIEW->COMPLETED": {
    recipient: "landlord",
    title: "Care Service Completed",
    content: (unitTitle) => `Care service for ${unitTitle} has been completed and verified.`,
  },
  "PENDING_STAFF_REVIEW->AWAITING_TENANT_CONFIRMATION": {
    recipient: "tenant",
    title: "Please Resubmit Completion Report",
    content: (unitTitle) => `Staff requested more info for your ${unitTitle} completion report.`,
  },
};

type CareRequestContext = {
  status: string;
  contract: {
    tenantId: number | null;
    landlordId: number | null;
    unit: { title: string; agentId: number | null; adminId: number | null };
  };
};

// recipient 종류별 수신자 id 목록 결정 — staff는 담당 agent/admin, 둘 다 없으면 총괄매니저 전원
async function resolveRecipientIds(
  recipient: "landlord" | "tenant" | "staff",
  existing: CareRequestContext
): Promise<number[]> {
  if (recipient === "landlord") {
    return existing.contract.landlordId ? [existing.contract.landlordId] : [];
  }
  if (recipient === "tenant") {
    return existing.contract.tenantId ? [existing.contract.tenantId] : [];
  }

  // staff
  const { agentId, adminId } = existing.contract.unit;
  if (agentId) return [agentId];
  if (adminId) return [adminId];

  const superAdmins = await prisma.user.findMany({
    where: { isSuperAdmin: true },
    select: { id: true },
  });
  return superAdmins.map((u) => u.id);
}

async function sendCareNotification(
  recipientIds: number[],
  title: string,
  content: string,
  senderId: number
) {
  for (const recipientId of recipientIds) {
    if (recipientId === senderId) continue;
    const message = await prisma.message.create({
      data: { senderId, recipientId, title, content, type: 1 },
    });
    await prisma.notification.create({
      data: { messageId: message.id, userId: recipientId, type: 1 },
    });
  }
}

async function notifyCareStatusChange(
  existing: CareRequestContext,
  newStatus: string,
  actorId: number
) {
  const transition = careStatusNotifications[`${existing.status}->${newStatus}`];
  if (!transition) return;

  const recipientIds = await resolveRecipientIds(transition.recipient, existing);
  if (recipientIds.length === 0) return;

  await sendCareNotification(
    recipientIds,
    transition.title,
    transition.content(existing.contract.unit.title),
    actorId
  );
}

// PENDING_OWNER_APPROVAL→SCHEDULED 승인 시, 승인 안 한 반대쪽(landlord/agent)에게 별도 확정 통보
// (recipient가 승인 주체에 따라 달라져 고정 매핑 테이블로 표현 불가 — 호출부에서 직접 처리)
async function notifyOtherApprovalParty(
  existing: CareRequestContext,
  approvedByRole: "LANDLORD" | "AGENT",
  actorId: number
) {
  const unitTitle = existing.contract.unit.title;
  if (approvedByRole === "LANDLORD") {
    const agentId = existing.contract.unit.agentId;
    if (!agentId || agentId === actorId) return;
    await sendCareNotification(
      [agentId],
      "Care Service Confirmed by Owner",
      `The owner has approved and scheduled the care service for ${unitTitle}.`,
      actorId
    );
  } else {
    const landlordId = existing.contract.landlordId;
    if (!landlordId || landlordId === actorId) return;
    await sendCareNotification(
      [landlordId],
      "Care Service Confirmed by Agent",
      `The assigned agent has approved and scheduled the care service for ${unitTitle}.`,
      actorId
    );
  }
}

// PENDING_OWNER_APPROVAL → SCHEDULED 승인을 경쟁 조건 없이 처리 — updateMany의 where에 현재 상태를
// 걸어 동시에 두 요청(랜드로드/에이전트)이 들어와도 DB 레벨에서 하나만 성공하도록 함
async function tryApproveSchedule(
  careId: number,
  scheduledAtInput: string | undefined,
  approvedByRole: "LANDLORD" | "AGENT",
  approverId: number
) {
  const result = await prisma.careServiceRequest.updateMany({
    where: { id: careId, status: "PENDING_OWNER_APPROVAL" },
    data: {
      status: "SCHEDULED",
      scheduledAt: scheduledAtInput ? new Date(scheduledAtInput) : new Date(),
      approvedByRole,
      approvedByUserId: approverId,
    },
  });

  if (result.count === 0) {
    const current = await prisma.careServiceRequest.findUnique({
      where: { id: careId },
      select: { status: true, approvedByRole: true },
    });

    if (current && current.status !== "PENDING") {
      // PENDING_OWNER_APPROVAL을 지나 이미 SCHEDULED(또는 그 이후)로 넘어간 경우 — 경쟁에서 진 쪽
      return {
        ok: false as const,
        status: 409,
        body: { error: "already_approved", approvedByRole: current.approvedByRole },
      };
    }

    return {
      ok: false as const,
      status: 403,
      body: { error: "Care request is not awaiting owner approval" },
    };
  }

  const updated = await prisma.careServiceRequest.findUnique({ where: { id: careId } });
  return { ok: true as const, updated };
}

// PENDING_STAFF_REVIEW → COMPLETED 승인 시, landlord 알림과 별개로 담당 에이전트에게도 항상 결과 통보
// (OR 승인 게이트가 아니라 둘 다 항상 받아야 하는 결과 통보라 고정 매핑 테이블로 표현 불가)
async function notifyAgentOnCompletion(existing: CareRequestContext, actorId: number) {
  const agentId = existing.contract.unit.agentId;
  if (!agentId || agentId === actorId) return;
  await sendCareNotification(
    [agentId],
    "Care Service Completed",
    `Care service for ${existing.contract.unit.title} has been completed and verified.`,
    actorId
  );
}

// staff 전용 작업 진행 전환(SCHEDULED→IN_PROGRESS, IN_PROGRESS→AWAITING_TENANT_CONFIRMATION,
// PENDING_STAFF_REVIEW→COMPLETED/AWAITING_TENANT_CONFIRMATION)을 경쟁 조건 없이 처리
// — tryApproveSchedule과 동일한 updateMany 패턴, extraData로 staffReviewNote/completedAt 등 추가 필드 지원
async function tryStaffTransition(
  careId: number,
  fromStatus: CareStatus,
  toStatus: CareStatus,
  extraData: { staffReviewNote?: string; completedAt?: Date } = {}
) {
  const result = await prisma.careServiceRequest.updateMany({
    where: { id: careId, status: fromStatus },
    data: { status: toStatus, ...extraData },
  });

  if (result.count === 0) {
    const current = await prisma.careServiceRequest.findUnique({
      where: { id: careId },
      select: { status: true },
    });
    return {
      ok: false as const,
      status: 409,
      body: { error: "already_transitioned", currentStatus: current?.status ?? null },
    };
  }

  const updated = await prisma.careServiceRequest.findUnique({ where: { id: careId } });
  return { ok: true as const, updated };
}

// level 0: 전체 수정 (총괄매니저는 전체, 일반 staff는 본인 담당 매물만 — 진행 전환 2건에 한해 스코프 적용)
// level 0,20,30: SCHEDULED→IN_PROGRESS, IN_PROGRESS→AWAITING_TENANT_CONFIRMATION (작업 시작/완료 처리),
//                PENDING_STAFF_REVIEW→COMPLETED/AWAITING_TENANT_CONFIRMATION (완료보고 최종 승인/반려)
// level 20,30: PENDING → PENDING_OWNER_APPROVAL 에스컬레이션(status, staffMemo만)만 가능
// level 2,3: 본인 담당 매물(unit.agentId)의 케어만, PENDING_OWNER_APPROVAL → SCHEDULED 승인만 가능
// level 4: 본인 유닛 케어의 PENDING_OWNER_APPROVAL → SCHEDULED 승인만 가능
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
          select: {
            tenantId: true,
            landlordId: true,
            unit: { select: { title: true, agentId: true, adminId: true } },
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();

    const isStaffRole = level === 0 || level === 20 || level === 30;
    const isStaffProgressTransition =
      (existing.status === "SCHEDULED" && body.status === "IN_PROGRESS") ||
      (existing.status === "IN_PROGRESS" && body.status === "AWAITING_TENANT_CONFIRMATION");

    if (isStaffRole && isStaffProgressTransition) {
      // staff(총괄매니저는 전체, 일반 staff는 본인 담당 unit.agentId/adminId만): 작업 시작/완료 처리
      const isSuperAdmin = Boolean(session?.user?.isSuperAdmin);
      if (!isSuperAdmin) {
        const { agentId, adminId } = existing.contract.unit;
        if (agentId !== userId && adminId !== userId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }

      const result = await tryStaffTransition(careId, existing.status, body.status);
      if (!result.ok) {
        return NextResponse.json(result.body, { status: result.status });
      }

      await notifyCareStatusChange(existing, body.status, userId);

      return NextResponse.json({ careRequest: result.updated });
    }

    const isStaffReviewDecision =
      existing.status === "PENDING_STAFF_REVIEW" &&
      (body.status === "COMPLETED" || body.status === "AWAITING_TENANT_CONFIRMATION");

    if (isStaffRole && isStaffReviewDecision) {
      // staff(총괄매니저는 전체, 일반 staff는 본인 담당 unit.agentId/adminId만): 완료보고 최종 승인/반려
      const isSuperAdmin = Boolean(session?.user?.isSuperAdmin);
      if (!isSuperAdmin) {
        const { agentId, adminId } = existing.contract.unit;
        if (agentId !== userId && adminId !== userId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }

      const staffReviewNote =
        typeof body.staffReviewNote === "string" ? body.staffReviewNote.trim() : "";

      if (body.status === "AWAITING_TENANT_CONFIRMATION" && !staffReviewNote) {
        return NextResponse.json(
          { error: "staffReviewNote is required when rejecting a completion report" },
          { status: 400 }
        );
      }

      const extraData: { staffReviewNote?: string; completedAt?: Date } = {};
      if (staffReviewNote) extraData.staffReviewNote = staffReviewNote;
      if (body.status === "COMPLETED") extraData.completedAt = new Date();

      const result = await tryStaffTransition(careId, existing.status, body.status, extraData);
      if (!result.ok) {
        return NextResponse.json(result.body, { status: result.status });
      }

      await notifyCareStatusChange(existing, body.status, userId);

      if (body.status === "COMPLETED") {
        await notifyAgentOnCompletion(existing, userId);
      }

      return NextResponse.json({ careRequest: result.updated });
    }

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

      if (existing.status === "AWAITING_TENANT_CONFIRMATION" && body.status === "PENDING_STAFF_REVIEW") {
        const completionNote = typeof body.completionNote === "string" ? body.completionNote.trim() : "";
        if (!completionNote) {
          return NextResponse.json(
            { error: "completionNote is required" },
            { status: 400 }
          );
        }

        const result = await prisma.careServiceRequest.updateMany({
          where: { id: careId, status: "AWAITING_TENANT_CONFIRMATION" },
          data: {
            status: "PENDING_STAFF_REVIEW",
            completionNote,
            ...(body.completionProofUrl ? { completionProofUrl: body.completionProofUrl } : {}),
          },
        });

        if (result.count === 0) {
          const current = await prisma.careServiceRequest.findUnique({
            where: { id: careId },
            select: { status: true },
          });
          return NextResponse.json(
            { error: "already_transitioned", currentStatus: current?.status ?? null },
            { status: 409 }
          );
        }

        const updated = await prisma.careServiceRequest.findUnique({ where: { id: careId } });

        await notifyCareStatusChange(existing, "PENDING_STAFF_REVIEW", userId);

        return NextResponse.json({ careRequest: updated });
      }

      return NextResponse.json(
        { error: "Tenant can only cancel a care request or submit a completion report" },
        { status: 403 }
      );
    }

    if (level === 4) {
      // 오너: 본인 유닛의 케어 승인만 가능
      if (existing.contract.landlordId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (body.status !== "SCHEDULED") {
        return NextResponse.json(
          { error: "Owner can only approve a care request awaiting approval" },
          { status: 403 }
        );
      }

      const result = await tryApproveSchedule(careId, body.scheduledAt, "LANDLORD", userId);
      if (!result.ok) {
        return NextResponse.json(result.body, { status: result.status });
      }

      await notifyCareStatusChange(existing, "SCHEDULED", userId);
      await notifyOtherApprovalParty(existing, "LANDLORD", userId);

      return NextResponse.json({ careRequest: result.updated });
    }

    if (level === 2 || level === 3) {
      // 외부 에이전트/브로커: 본인이 담당(unit.agentId)하는 매물의 케어만, 승인만 가능
      if (existing.contract.unit.agentId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (body.status !== "SCHEDULED") {
        return NextResponse.json(
          { error: "Agent can only approve a care request awaiting approval" },
          { status: 403 }
        );
      }

      const result = await tryApproveSchedule(careId, body.scheduledAt, "AGENT", userId);
      if (!result.ok) {
        return NextResponse.json(result.body, { status: result.status });
      }

      await notifyCareStatusChange(existing, "SCHEDULED", userId);
      await notifyOtherApprovalParty(existing, "AGENT", userId);

      return NextResponse.json({ careRequest: result.updated });
    }

    if (level === 20 || level === 30) {
      // 스태프(프리세일 에이전트/브로커): PENDING → PENDING_OWNER_APPROVAL 에스컬레이션만 허용,
      // level=0 catch-all과 달리 status/staffMemo 최소 필드만 수정 가능
      if (existing.status !== "PENDING" || body.status !== "PENDING_OWNER_APPROVAL") {
        return NextResponse.json(
          { error: "Staff can only escalate a pending care request for owner approval" },
          { status: 403 }
        );
      }

      const updated = await prisma.careServiceRequest.update({
        where: { id: careId },
        data: {
          status: "PENDING_OWNER_APPROVAL",
          ...(body.staffMemo !== undefined && { staffMemo: body.staffMemo }),
        },
      });

      await notifyCareStatusChange(existing, "PENDING_OWNER_APPROVAL", userId);

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
      staffMemo,
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
        ...(staffMemo !== undefined && { staffMemo }),
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
