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

  const { unitId, landlordId, content } = await req.json();
  if (!unitId || !landlordId || !content) {
    return NextResponse.json(
      { error: "unitId, landlordId, and content are required" },
      { status: 400 }
    );
  }

  const loi = await prisma.loiDocument.create({
    data: {
      unitId: Number(unitId),
      landlordId: Number(landlordId),
      tenantBrokerId: Number(session.user.id),
      content: String(content),
      status: "UNDER_LANDLORD_REVIEW",
    },
  });

  return NextResponse.json(loi, { status: 201 });
}
