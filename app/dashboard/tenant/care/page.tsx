export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { ContractStatus } from "@prisma/client";
import CareRequestForm from "./components/care-request-form";

export default async function CareRequestPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) redirect("/");

  const userId = Number(session.user.id);

  const activeLease = await prisma.leaseContract.findFirst({
    where: {
      tenantId: userId,
      status: { in: [ContractStatus.ACTIVE, ContractStatus.EXPIRING_SOON] },
    },
    select: { id: true },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC]">
      <div className="max-w-[640px] mx-auto px-4 py-6 pb-24 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/tenant"
            className="flex items-center gap-1 text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        <div>
          <h1 className="text-xl font-bold text-[#F8FAFC]">Request Care Service</h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Let us know what kind of help you need and when.
          </p>
        </div>

        {!activeLease ? (
          <div className="flex items-center justify-center h-24 border border-dashed border-[#334155] rounded-xl text-sm text-[#94A3B8]">
            You don&apos;t have an active lease yet. Please contact us.
          </div>
        ) : (
          <CareRequestForm contractId={activeLease.id} />
        )}
      </div>
    </div>
  );
}
