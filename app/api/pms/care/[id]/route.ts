export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// level 0: 전체 수정 / level 5: 취소(CANCELLED)만 가능
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
      include: { contract: { select: { tenantId: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();

    if (level === 5) {
      // 임차인: 본인 계약의 케어만, 취소 상태로만 변경 가능
      if (existing.contract.tenantId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (body.status !== "CANCELLED") {
        return NextResponse.json(
          { error: "Tenant can only cancel a care request" },
          { status: 403 }
        );
      }

      const updated = await prisma.careServiceRequest.update({
        where: { id: careId },
        data: { status: "CANCELLED" },
      });

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

    return NextResponse.json({ careRequest: updated });
  } catch (error) {
    console.error("[PATCH /api/pms/care/[id]]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
