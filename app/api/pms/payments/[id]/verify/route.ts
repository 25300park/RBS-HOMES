export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// level 0: 전체 승인 가능, level 20/30: 본인 담당 매물(unit.agentId/adminId)의 납부만 승인 가능
export async function POST(
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
    if (level !== 0 && level !== 20 && level !== 30) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const verifiedById = userId;
    const paymentId = Number(params.id);

    const payment = await prisma.paymentSchedule.findUnique({
      where: { id: paymentId },
      include: {
        contract: { select: { unit: { select: { agentId: true, adminId: true } } } },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (level === 20 || level === 30) {
      const { agentId, adminId } = payment.contract.unit;
      if (agentId !== userId && adminId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (payment.status === "PAID") {
      return NextResponse.json({ error: "Already verified" }, { status: 400 });
    }

    const updated = await prisma.paymentSchedule.update({
      where: { id: paymentId },
      data: {
        status: "PAID",
        verifiedAt: new Date(),
        verifiedById,
      },
    });

    return NextResponse.json({ payment: updated });
  } catch (error) {
    console.error("[POST /api/pms/payments/[id]/verify]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
