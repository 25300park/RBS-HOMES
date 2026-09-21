export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Banknote,
  CheckCircle2,
  Clock,
  Building2,
  FileText,
  ShieldCheck,
  Calendar,
  DollarSign,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { PaymentStatus } from "@prisma/client";
import { getLandlordPayments } from "@/lib/landlord/get-landlord-payments";
import LogoutButton from "../components/logout-button";
import BottomNav from "../components/bottom-nav";
import { DashboardSubnav } from "@/components/dashboard/dashboard-subnav";

const paymentStatusConfig: Record<PaymentStatus, { text: string; cls: string }> = {
  PENDING: { text: "● Pending", cls: "bg-amber-50 text-amber-700 border border-amber-200/80" },
  AWAITING_APPROVAL: { text: "● Under Review", cls: "bg-blue-50 text-blue-700 border border-blue-200/80" },
  PAID: { text: "✓ Settled (Paid)", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200/80" },
  OVERDUE: { text: "⚠ Overdue", cls: "bg-rose-50 text-rose-700 border border-rose-200/80" },
};

export default async function LandlordPaymentsPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) redirect("/");

  const userId = Number(session.user.id);
  const payments = await getLandlordPayments(userId);

  const totalCollected = payments
    .filter((p) => p.status === PaymentStatus.PAID)
    .reduce((sum, p) => sum + Number(p.amountDue), 0);

  const pendingCollection = payments
    .filter((p) => p.status === PaymentStatus.PENDING)
    .reduce((sum, p) => sum + Number(p.amountDue), 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Global GNB Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 h-18 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/assets/images/rbs-logo.png"
              alt="RBS Homes"
              className="h-9 sm:h-8 w-auto object-contain"
            />
          </Link>

          <nav className="flex md:hidden items-center bg-zinc-100/80 p-1.5 rounded-xl border border-zinc-200/60 text-xs font-bold text-zinc-600">
            <Link href="/dashboard/landlord" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg shadow-sm transition-all">
              Owner
            </Link>
            <Link href="/dashboard/tenant" className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg transition-colors">
              Tenant
            </Link>
            <Link href="/dashboard/agent" className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg transition-colors">
              Agent
            </Link>
            <Link href="/dashboard/buyer" className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg transition-colors">
              Buyer
            </Link>
          </nav>

          <div className="flex items-center gap-4 sm:gap-3">
            <Link
              href="/dashboard/landlord/leases"
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-sm sm:text-xs px-4 py-2.5 rounded-xl transition-all"
            >
              <span>Manage Leases</span>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-8 md:pb-24">
        {/* Desktop Sub Navigation Tab Bar */}
        <DashboardSubnav role="landlord" />

        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/dashboard/landlord"
            className="inline-flex items-center gap-1.5 text-sm sm:text-xs font-bold text-zinc-500 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Owner Portal</span>
          </Link>
        </div>

        {/* Title Header */}
        <div className="bg-white rounded-2xl p-7 sm:p-6 shadow-sm border border-zinc-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-700 text-xs font-extrabold px-2.5 py-1 rounded-md border border-blue-200/60">
                Owner Asset Ledger
              </span>
            </div>
            <h1 className="text-2xl sm:text-xl font-black text-zinc-900 tracking-tight mt-1.5">
              Rental Income & Payment Collection
            </h1>
            <p className="text-sm sm:text-xs text-zinc-500 font-medium mt-0.5">
              Real-time tracking of monthly tenant disbursements, remittance receipts, and tax records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/account/messages?recipient=concierge&topic=remittance"
              className="px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-all text-center flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Remittance Statement</span>
            </Link>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-1 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-500 block mb-1">Total Rent Collected</span>
              <span className="text-2xl font-black text-zinc-900">₱{totalCollected.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">● Escrow Verified</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-500 block mb-1">Pending Remittances</span>
              <span className="text-2xl font-black text-blue-600">₱{pendingCollection.toLocaleString()}</span>
              <span className="text-[10px] text-zinc-400 font-bold block mt-0.5">Expected by 25th</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-500 block mb-1">Collection Efficiency</span>
              <span className="text-2xl font-black text-indigo-900">100%</span>
              <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">0 Days Average Delay</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Collection Records Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/80 overflow-hidden">
          <div className="p-6 sm:p-5 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-zinc-900">Remittance Ledger</h3>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">Complete record of tenant payments and owner disbursements</p>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Banknote className="w-10 h-10 text-zinc-300 mx-auto" />
              <p className="text-sm font-bold text-zinc-700">No payment records found.</p>
              <p className="text-xs text-zinc-400">Payment records will appear once leases are active.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/70 text-[11px] font-extrabold text-zinc-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Unit & Tenant</th>
                    <th className="py-3.5 px-5">Due Date</th>
                    <th className="py-3.5 px-5 text-right">Amount (PHP)</th>
                    <th className="py-3.5 px-5 text-center">Status</th>
                    <th className="py-3.5 px-5 text-right">Receipt / Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-sm sm:text-xs">
                  {payments.map((p) => {
                    const cfg = paymentStatusConfig[p.status];
                    return (
                      <tr key={p.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-4 px-5">
                          <span className="font-extrabold text-zinc-900 block">{p.contract.unit.title}</span>
                          <span className="text-[11px] text-zinc-500 font-medium">Tenant: {p.contract.tenant?.name ?? "Assigned Resident"}</span>
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
                          <span className={`text-[11px] px-2.5 py-1 rounded-md font-bold inline-block whitespace-nowrap ${cfg.cls}`}>
                            {cfg.text}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer">
                            <span>Remittance PDF</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
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

