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
    const { unitId, documentType, documentName, fileUrl, expiryDate } = body;

    if (!unitId || !fileUrl) {
      return NextResponse.json({ error: "Missing unitId or fileUrl" }, { status: 400 });
    }

    const targetUnitId = Number(unitId);

    if (documentType === "loi") {
      const loi = await prisma.loiDocument.create({
        data: {
          unitId: targetUnitId,
          landlordId: userId,
          tenantBrokerId: userId,
          content: documentName || "Uploaded LOI Document",
          status: "SIGNED",
          signedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, loi });
    } else {
      // Contract copy
      let draft = await prisma.contractDraft.findFirst({
        where: { unitId: targetUnitId },
      });

      if (!draft) {
        // Find or create loi for contractDraft requirement
        let loi = await prisma.loiDocument.findFirst({
          where: { unitId: targetUnitId },
        });
        if (!loi) {
          loi = await prisma.loiDocument.create({
            data: {
              unitId: targetUnitId,
              landlordId: userId,
              tenantBrokerId: userId,
              content: "Auto-generated for contract upload",
              status: "SIGNED",
            },
          });
        }

        draft = await prisma.contractDraft.create({
          data: {
            unitId: targetUnitId,
            loiId: loi.id,
            landlordBrokerId: userId,
            content: documentName || "Contract Copy",
            status: "FINALIZED",
          },
        });
      }

      const upload = await prisma.contractUpload.create({
        data: {
          unitId: targetUnitId,
          contractDraftId: draft.id,
          pdfUrl: fileUrl,
          uploadedById: userId,
        },
      });

      // If expiry date provided, update status or note
      if (expiryDate) {
        await prisma.unit.update({
          where: { id: targetUnitId },
          data: {
            status: 2, // Contracted
            note: `Lease Expiry: ${expiryDate}`,
          },
        });
      }

      return NextResponse.json({ success: true, upload });
    }
  } catch (error: any) {
    console.error("Error saving document:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
