export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Wrench } from "lucide-react";
import prisma from "@/lib/prisma";
import { ContractStatus } from "@prisma/client";
import CareRequestForm from "./components/care-request-form";
import { getLandlordCareRequests } from "@/lib/landlord/get-landlord-care-requests";
import ApproveCareButton from "../../landlord/components/approve-care-button";

const careStatusLabel: Record<string, string> = {
  PENDING: "Received",
  PENDING_OWNER_APPROVAL: "Awaiting Your Approval",
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  AWAITING_TENANT_CONFIRMATION: "Awaiting Tenant Confirmation",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default async function CareRequestPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) redirect("/");

  const userId = Number(session.user.id);
  const level = Number(session.user.level ?? 1);

  if (level === 4) {
    const careRequests = await getLandlordCareRequests(userId);
    return (
      <div className="max-w-[1140px] mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/landlord"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Wrench className="w-5 h-5 text-purple-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Care Service</h1>
        </div>

        {careRequests.length === 0 ? (
          <div className="flex items-center justify-center h-24 border border-dashed border-gray-200 rounded-lg text-sm text-gray-400">
            No active care service requests.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden bg-white">
            {careRequests.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-800">
                    {c.serviceType} · {c.contract.unit.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Preferred date: {new Date(c.preferredDate).toLocaleDateString("en-US")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-4">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium">
                    {careStatusLabel[c.status] ?? c.status}
                  </span>
                  {c.status === "PENDING_OWNER_APPROVAL" && (
                    <ApproveCareButton careId={c.id} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

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
