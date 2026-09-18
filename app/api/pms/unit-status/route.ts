export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions as any);
    const userId = session?.user?.id ? Number(session.user.id) : 1;

    const body = await req.json();
    const { unitId, status, note } = body;

    if (unitId === undefined || status === undefined) {
      return NextResponse.json({ error: "Missing unitId or status" }, { status: 400 });
    }

    const updatedUnit = await prisma.unit.update({
      where: { id: Number(unitId) },
      data: {
        status: Number(status),
        lastUpdate: new Date(),
        ...(note !== undefined ? { note } : {}),
      },
      select: {
        id: true,
        title: true,
        status: true,
        lastUpdate: true,
      },
    });

    return NextResponse.json({ success: true, unit: updatedUnit });
  } catch (error: any) {
    console.error("Error updating unit status:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
