export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, ArrowLeft } from "lucide-react";
import { PaymentStatus } from "@prisma/client";
import { getLandlordLeaseData } from "@/lib/landlord/get-landlord-leases";

const paymentStatusConfig: Record<PaymentStatus, { text: string; cls: string }> = {
  PENDING: { text: "Pending", cls: "bg-gray-100 text-gray-600" },
  AWAITING_APPROVAL: { text: "Awaiting Approval", cls: "bg-orange-100 text-orange-600" },
  PAID: { text: "Paid", cls: "bg-green-100 text-green-700" },
  OVERDUE: { text: "Overdue", cls: "bg-red-100 text-red-600" },
};

const leaseBadgeLabel: Record<PaymentStatus, string> = {
  ...Object.fromEntries(
    Object.entries(paymentStatusConfig).map(([k, v]) => [k, v.text])
  ),
  PENDING: "Payment Due",
} as Record<PaymentStatus, string>;

export default async function LandlordLeasesPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) redirect("/");

  const userId = Number(session.user.id);
  const { leases } = await getLandlordLeaseData(userId);

  return (
    <div className="max-w-[1140px] mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/landlord"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-orange-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-800">Active Leases</h1>
      </div>

      {leases.length === 0 ? (
        <div className="flex items-center justify-center h-24 border border-dashed border-gray-200 rounded-lg text-sm text-gray-400">
          No active leases.
        </div>
      ) : (
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden bg-white">
          {leases.map((l) => {
            const thisMonthPayment = l.paymentSchedules[0];
            const paymentCfg = thisMonthPayment
              ? paymentStatusConfig[thisMonthPayment.status]
              : null;
            return (
              <div key={l.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate">
                      {l.unit.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{l.unit.fullAddress}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Tenant: {l.tenant?.name ?? "Unassigned"} · Monthly Rent: ₱ {Number(l.monthlyRent).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs text-gray-400">
                      ~ {new Date(l.endDate).toLocaleDateString("en-US")}
                    </span>
                    {paymentCfg && thisMonthPayment && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${paymentCfg.cls}`}>
                        {leaseBadgeLabel[thisMonthPayment.status]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
