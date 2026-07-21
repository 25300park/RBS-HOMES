export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Banknote, ArrowLeft } from "lucide-react";
import { PaymentStatus } from "@prisma/client";
import { getLandlordPayments } from "@/lib/landlord/get-landlord-payments";

const paymentStatusConfig: Record<PaymentStatus, { text: string; cls: string }> = {
  PENDING: { text: "Pending", cls: "bg-gray-100 text-gray-600" },
  AWAITING_APPROVAL: { text: "Awaiting Approval", cls: "bg-orange-100 text-orange-600" },
  PAID: { text: "Paid", cls: "bg-green-100 text-green-700" },
  OVERDUE: { text: "Overdue", cls: "bg-red-100 text-red-600" },
};

export default async function LandlordPaymentsPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) redirect("/");

  const userId = Number(session.user.id);
  const payments = await getLandlordPayments(userId);

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
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <Banknote className="w-5 h-5 text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-800">Payments</h1>
      </div>

      {payments.length === 0 ? (
        <div className="flex items-center justify-center h-24 border border-dashed border-gray-200 rounded-lg text-sm text-gray-400">
          No payment records found.
        </div>
      ) : (
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden bg-white">
          {payments.map((p) => {
            const cfg = paymentStatusConfig[p.status];
            return (
              <div key={p.id} className="px-4 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">
                    {p.contract.unit.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {p.contract.unit.fullAddress}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tenant: {p.contract.tenant?.name ?? "Unassigned"} · Due:{" "}
                    {new Date(p.dueDate).toLocaleDateString("en-US")}
                  </p>
                  {p.receiptImageUrl && (
                    <Link
                      href={p.receiptImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:text-blue-700 mt-1 inline-block"
                    >
                      영수증 보기 →
                    </Link>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <p className="text-sm font-bold text-gray-800">
                    ₱ {Number(p.amountDue).toLocaleString()}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>
                    {cfg.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
