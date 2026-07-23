import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const level = Number(session.user.level);
  if (![2, 3].includes(level)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { unitId, loiId, content } = await req.json();
  if (!unitId || !loiId || !content) {
    return NextResponse.json(
      { error: "unitId, loiId, and content are required" },
      { status: 400 }
    );
  }

  const loi = await prisma.loiDocument.findUnique({ where: { id: Number(loiId) } });
  if (!loi) {
    return NextResponse.json({ error: "LOI not found" }, { status: 404 });
  }
  if (loi.status !== "SIGNED") {
    return NextResponse.json(
      { error: "LOI 서명이 완료되어야 계약서 작성이 가능합니다" },
      { status: 400 }
    );
  }

  const draft = await prisma.contractDraft.create({
    data: {
      unitId: Number(unitId),
      loiId: Number(loiId),
      landlordBrokerId: Number(session.user.id),
      tenantBrokerId: loi.tenantBrokerId,
      content: String(content),
      status: "UNDER_LANDLORD_REVIEW",
    },
  });

  return NextResponse.json(draft, { status: 201 });
}
