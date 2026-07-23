import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const callerId = Number(session.user.id);
  const loiId = Number(params.id);
  const { action, content } = await req.json();

  const loi = await prisma.loiDocument.findUnique({ where: { id: loiId } });
  if (!loi) {
    return NextResponse.json({ error: "LOI not found" }, { status: 404 });
  }

  // ── UNDER_LANDLORD_REVIEW: landlordId 또는 landlordBrokerId 만 가능 ──
  if (loi.status === "UNDER_LANDLORD_REVIEW") {
    const isLandlordSide =
      callerId === loi.landlordId ||
      (loi.landlordBrokerId !== null && callerId === loi.landlordBrokerId);
    if (!isLandlordSide) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (action === "approve") {
      const updated = await prisma.loiDocument.update({
        where: { id: loiId },
        data: { status: "TENANT_APPROVED" },
      });
      return NextResponse.json(updated);
    }

    if (action === "counter") {
      if (!content) {
        return NextResponse.json(
          { error: "content is required for counter action" },
          { status: 400 }
        );
      }
      const updated = await prisma.loiDocument.update({
        where: { id: loiId },
        data: { content: String(content), status: "COUNTER_OFFERED" },
      });
      return NextResponse.json(updated);
    }

    if (action === "reject") {
      const updated = await prisma.loiDocument.update({
        where: { id: loiId },
        data: { status: "REJECTED" },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  // ── COUNTER_OFFERED: tenantBrokerId 만 가능 ──
  if (loi.status === "COUNTER_OFFERED") {
    if (callerId !== loi.tenantBrokerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (action === "approve") {
      const updated = await prisma.loiDocument.update({
        where: { id: loiId },
        data: { status: "TENANT_APPROVED" },
      });
      return NextResponse.json(updated);
    }

    if (action === "counter") {
      if (!content) {
        return NextResponse.json(
          { error: "content is required for counter action" },
          { status: 400 }
        );
      }
      const updated = await prisma.loiDocument.update({
        where: { id: loiId },
        data: { content: String(content), status: "UNDER_LANDLORD_REVIEW" },
      });
      return NextResponse.json(updated);
    }

    if (action === "reject") {
      const updated = await prisma.loiDocument.update({
        where: { id: loiId },
        data: { status: "REJECTED" },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  // ── TENANT_APPROVED / SIGNED / REJECTED: 더 이상 액션 불가 ──
  return NextResponse.json(
    { error: "Action not allowed in current LOI status" },
    { status: 409 }
  );
}
