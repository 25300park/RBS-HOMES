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
  const { signatureDataUrl } = await req.json();

  if (!signatureDataUrl) {
    return NextResponse.json({ error: "signatureDataUrl is required" }, { status: 400 });
  }

  const loi = await prisma.loiDocument.findUnique({ where: { id: loiId } });
  if (!loi) {
    return NextResponse.json({ error: "LOI not found" }, { status: 404 });
  }

  if (loi.status !== "TENANT_APPROVED") {
    return NextResponse.json(
      { error: "서명 가능한 상태가 아닙니다" },
      { status: 409 }
    );
  }

  const isLandlordSide =
    callerId === loi.landlordId ||
    (loi.landlordBrokerId !== null && callerId === loi.landlordBrokerId);
  const isTenantSide = callerId === loi.tenantBrokerId;

  if (!isLandlordSide && !isTenantSide) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (isLandlordSide && loi.landlordSignature) {
    return NextResponse.json({ error: "이미 서명했습니다" }, { status: 409 });
  }
  if (isTenantSide && loi.tenantSignature) {
    return NextResponse.json({ error: "이미 서명했습니다" }, { status: 409 });
  }

  const signatureField = isLandlordSide ? "landlordSignature" : "tenantSignature";
  const updatedLandlord = isLandlordSide ? signatureDataUrl : loi.landlordSignature;
  const updatedTenant   = isTenantSide   ? signatureDataUrl : loi.tenantSignature;
  const bothSigned = Boolean(updatedLandlord && updatedTenant);

  const updated = await prisma.loiDocument.update({
    where: { id: loiId },
    data: {
      [signatureField]: signatureDataUrl,
      ...(bothSigned && { status: "SIGNED", signedAt: new Date() }),
    },
  });

  return NextResponse.json(updated);
}
