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
  const draftId = Number(params.id);
  const { action, content } = await req.json();

  const draft = await prisma.contractDraft.findUnique({
    where: { id: draftId },
    include: { unit: { select: { adminId: true } } },
  });
  if (!draft) {
    return NextResponse.json({ error: "Contract draft not found" }, { status: 404 });
  }

  // ── UNDER_LANDLORD_REVIEW: unit.adminId(실제 landlord)만 가능 ──
  if (draft.status === "UNDER_LANDLORD_REVIEW") {
    if (callerId !== draft.unit.adminId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (action === "approve") {
      const updated = await prisma.contractDraft.update({
        where: { id: draftId },
        data: {
          ...(content ? { content: String(content) } : {}),
          status: "SENT_TO_TENANT",
        },
      });
      return NextResponse.json(updated);
    }

    if (action === "reject") {
      const updated = await prisma.contractDraft.update({
        where: { id: draftId },
        data: { status: "REJECTED" },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  // ── SENT_TO_TENANT: tenantBrokerId만 가능 ──
  if (draft.status === "SENT_TO_TENANT") {
    if (callerId !== draft.tenantBrokerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (action === "approve") {
      const updated = await prisma.contractDraft.update({
        where: { id: draftId },
        data: { status: "APPROVED" },
      });
      return NextResponse.json(updated);
    }

    if (action === "request_revision") {
      if (!content) {
        return NextResponse.json(
          { error: "content is required for request_revision" },
          { status: 400 }
        );
      }
      const updated = await prisma.contractDraft.update({
        where: { id: draftId },
        data: { content: String(content), status: "REVISION_REQUESTED" },
      });
      return NextResponse.json(updated);
    }

    if (action === "reject") {
      const updated = await prisma.contractDraft.update({
        where: { id: draftId },
        data: { status: "REJECTED" },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  // ── REVISION_REQUESTED: landlordBrokerId만 가능 ──
  if (draft.status === "REVISION_REQUESTED") {
    if (callerId !== draft.landlordBrokerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (action === "resubmit") {
      if (!content) {
        return NextResponse.json(
          { error: "content is required for resubmit" },
          { status: 400 }
        );
      }
      const updated = await prisma.contractDraft.update({
        where: { id: draftId },
        data: { content: String(content), status: "SENT_TO_TENANT" },
      });
      return NextResponse.json(updated);
    }

    if (action === "reject") {
      const updated = await prisma.contractDraft.update({
        where: { id: draftId },
        data: { status: "REJECTED" },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  // ── APPROVED / FINALIZED / REJECTED: 더 이상 액션 불가 ──
  return NextResponse.json(
    { error: "Action not allowed in current contract draft status" },
    { status: 409 }
  );
}
