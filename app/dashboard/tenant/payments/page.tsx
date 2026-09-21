export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  Building2,
  FileText,
  ShieldCheck,
  Calendar,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import { getTenantPaymentHistory } from "@/lib/tenant/get-tenant-payment-history";
import LogoutButton from "@/app/dashboard/tenant/components/logout-button";
import BottomNav from "@/app/dashboard/tenant/components/bottom-nav";
import { DashboardSubnav } from "@/components/dashboard/dashboard-subnav";

export default async function TenantPaymentsPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) redirect("/");

  const userId = Number(session.user.id);
  const payments = await getTenantPaymentHistory(userId);

  const totalPaid = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.amountDue), 0);

  const pendingPayment = payments.find((p) => p.status === "PENDING");

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Global GNB Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 h-16 sm:h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/assets/images/rbs-logo.png"
              alt="RBS Homes"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>

          <nav className="flex md:hidden items-center bg-zinc-100/80 p-1.5 rounded-xl border border-zinc-200/60 text-xs font-bold text-zinc-600">
            <Link href="/dashboard/landlord" className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg transition-colors">
              Owner
            </Link>
            <Link href="/dashboard/tenant" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg shadow-sm transition-all">
              Tenant
            </Link>
            <Link href="/dashboard/agent" className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg transition-colors">
              Agent
            </Link>
            <Link href="/dashboard/buyer" className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg transition-colors">
              Buyer
            </Link>
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/list?sellType=rent"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all active:scale-98"
            >
              <Building2 className="w-4 h-4" />
              <span>Browse Units</span>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-8 md:pb-24">
        {/* Desktop Sub Navigation Tab Bar */}
        <DashboardSubnav role="tenant" />

        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/dashboard/tenant"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-zinc-500 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Tenant Portal</span>
          </Link>
        </div>

        {/* Title Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-zinc-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-700 text-xs font-extrabold px-2.5 py-1 rounded-md border border-blue-200/60">
                Tenant Billing Ledger
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight mt-1.5">
              Rent Payment History & Invoices
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">
              Review monthly rental receipts, next billing due dates, and verified bank transfers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/account/messages?recipient=concierge&topic=billing"
              className="px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-all text-center flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Request Official Receipt</span>
            </Link>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-1 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-500 block mb-1">Total Rent Paid</span>
              <span className="text-2xl font-black text-zinc-900">₱{totalPaid.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">● 5 Months Settled</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-500 block mb-1">Next Payment Due</span>
              <span className="text-2xl font-black text-blue-600">
                {pendingPayment ? `₱${Number(pendingPayment.amountDue).toLocaleString()}` : "₱0"}
              </span>
              <span className="text-[10px] text-zinc-400 font-bold block mt-0.5">Due on 25th of month</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-500 block mb-1">Payment Track Record</span>
              <span className="text-2xl font-black text-indigo-900">100% On-Time</span>
              <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">Tier 1 Verified Resident</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Payment Ledger Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/80 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-zinc-900">Payment Breakdown</h3>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">Official digital receipts verified by RBS Escrow System</p>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <CreditCard className="w-10 h-10 text-zinc-300 mx-auto" />
              <p className="text-sm font-bold text-zinc-700">No payment records found.</p>
              <p className="text-xs text-zinc-400">Payment invoices will be generated once monthly rent cycle starts.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/70 text-[11px] font-extrabold text-zinc-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Billing Month</th>
                    <th className="py-3.5 px-5">Due Date</th>
                    <th className="py-3.5 px-5 text-right">Amount (PHP)</th>
                    <th className="py-3.5 px-5 text-center">Status</th>
                    <th className="py-3.5 px-5 text-right">Receipt / Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs sm:text-sm">
                  {payments.map((p) => {
                    const isPaid = p.status === "PAID";
                    return (
                      <tr key={p.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-4 px-5 font-bold text-zinc-900">
                          {new Date(p.dueDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                          })}
                        </td>
                        <td className="py-4 px-5 text-zinc-600 font-medium">
                          {new Date(p.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-4 px-5 text-right font-black text-zinc-900">
                          ₱{Number(p.amountDue).toLocaleString()}
                        </td>
                        <td className="py-4 px-5 text-center">
                          <PaymentStatusBadge status={p.status} />
                        </td>
                        <td className="py-4 px-5 text-right">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer">
                              <span>Official Receipt</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <Link
                              href="/dashboard/tenant"
                              className="inline-flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-xs transition-all"
                            >
                              <span>Pay Now</span>
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 border border-amber-200/80",
    AWAITING_APPROVAL: "bg-blue-50 text-blue-700 border border-blue-200/80",
    PAID: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
    OVERDUE: "bg-rose-50 text-rose-700 border border-rose-200/80",
  };
  const label: Record<string, string> = {
    PENDING: "● Pending",
    AWAITING_APPROVAL: "● Under Review",
    PAID: "✓ Settled (Paid)",
    OVERDUE: "⚠ Overdue",
  };
  return (
    <span className={`text-[11px] px-2.5 py-1 rounded-md font-bold inline-block whitespace-nowrap ${map[status] ?? "bg-zinc-100 text-zinc-600"}`}>
      {label[status] ?? status}
    </span>
  );
}

