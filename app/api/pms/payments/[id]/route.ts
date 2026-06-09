export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// 임차인이 영수증 URL 업로드 → status AWAITING_APPROVAL
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
    const paymentId = Number(params.id);

    const payment = await prisma.paymentSchedule.findUnique({
      where: { id: paymentId },
      include: { contract: { select: { tenantId: true } } },
    });

    if (!payment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // level 5(임차인): 본인 계약의 스케줄만, level 0(admin): 전체 가능
    if (level !== 0 && !(level === 5 && payment.contract.tenantId === userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { receiptImageUrl, receiptNotes } = body;

    if (!receiptImageUrl) {
      return NextResponse.json({ error: "receiptImageUrl is required" }, { status: 400 });
    }

    const updated = await prisma.paymentSchedule.update({
      where: { id: paymentId },
      data: {
        receiptImageUrl,
        receiptNotes: receiptNotes ?? null,
        status: "AWAITING_APPROVAL",
      },
    });

    return NextResponse.json({ payment: updated });
  } catch (error) {
    console.error("[PATCH /api/pms/payments/[id]]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
