export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getTenantPaymentHistory } from "@/lib/tenant/get-tenant-payment-history";

export default async function TenantPaymentsPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) redirect("/");

  const userId = Number(session.user.id);
  const payments = await getTenantPaymentHistory(userId);

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC]">
      <div className="max-w-[640px] mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Back link */}
        <div>
          <Link
            href="/dashboard/tenant"
            className="flex items-center gap-1 text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        <h1 className="text-xl font-bold text-[#F8FAFC]">Payment History</h1>

        {payments.length === 0 ? (
          <div className="flex items-center justify-center h-20 border border-dashed border-[#334155] rounded-xl text-sm text-[#94A3B8]">
            No payment history yet.
          </div>
        ) : (
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#94A3B8] text-xs border-b border-[#334155]">
                  <th className="text-left px-4 py-2 font-medium">Month</th>
                  <th className="text-right px-4 py-2 font-medium">Amount</th>
                  <th className="text-center px-4 py-2 font-medium">Status</th>
                  <th className="text-right px-4 py-2 font-medium">Date Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-[#F8FAFC]">
                      {new Date(p.dueDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[#F8FAFC]">
                      ₱ {Number(p.amountDue).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <PaymentStatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right text-[#94A3B8]">
                      {p.verifiedAt ? new Date(p.verifiedAt).toLocaleDateString("en-US") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-[#F59E0B]/15 text-[#F59E0B]",
    AWAITING_APPROVAL: "bg-[#3B82F6]/15 text-[#3B82F6]",
    PAID: "bg-[#10B981]/15 text-[#10B981]",
    OVERDUE: "bg-[#EF4444]/15 text-[#EF4444]",
  };
  const label: Record<string, string> = {
    PENDING: "Pending",
    AWAITING_APPROVAL: "Pending Approval",
    PAID: "Paid",
    OVERDUE: "Overdue",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] ?? "bg-[#334155] text-[#94A3B8]"}`}>
      {label[status] ?? status}
    </span>
  );
}
