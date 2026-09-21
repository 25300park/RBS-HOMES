import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const callerId = Number(session.user.id);
  const draftId = Number(params.id);

  const draft = await prisma.contractDraft.findUnique({
    where: { id: draftId },
    include: { unit: { select: { adminId: true } } },
  });
  if (!draft) {
    return NextResponse.json({ error: "Contract draft not found" }, { status: 404 });
  }

  const isAuthorized =
    callerId === draft.landlordBrokerId ||
    callerId === draft.tenantBrokerId ||
    callerId === draft.unit.adminId;
  if (!isAuthorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const email = req.nextUrl.searchParams.get("email")?.trim();
  if (!email) {
    return NextResponse.json({ error: "email query param is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  });

  return NextResponse.json({ user: user ?? null });
}
