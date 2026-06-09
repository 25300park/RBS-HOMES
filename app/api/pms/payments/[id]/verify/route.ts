export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// 관리자(level 0)가 납부 확인 → PAID
export async function POST(
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

    const verifiedById = Number(session.user.id);
    const paymentId = Number(params.id);

    const payment = await prisma.paymentSchedule.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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
