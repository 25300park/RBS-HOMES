export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getLandlordLeaseData } from "@/lib/landlord/get-landlord-leases";
import { AlertTriangle, Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { PaymentStatus } from "@prisma/client";
import LogoutButton from "./components/logout-button";
import BottomNav from "./components/bottom-nav";

export default async function LandlordDashboardPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) redirect("/");

  const userId = Number(session.user.id);

  const { leases, expiringLeases, allCareRequests, paymentSummary } =
    await getLandlordLeaseData(userId);

  const p = (s: PaymentStatus) => paymentSummary[s] ?? 0;

  return (
    <div className="bg-zinc-50 min-h-screen text-zinc-800 pb-28 md:pb-20">
      <main className="max-w-[1140px] mx-auto px-4 py-6 sm:py-8 space-y-6">

        {/* Welcome card */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-zinc-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
              Hello, {session.user.name ?? "Landlord"}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Check your active units, rental payments, and care requests.
            </p>
          </div>
          <div className="flex items-center justify-between sm:justify-end space-x-2">
            <span className="bg-[#0E5246]/10 text-[#0E5246] text-xs font-bold px-3 py-1.5 rounded-full border border-[#0E5246]/20">
              Landlord Level 4
            </span>
            <LogoutButton />
          </div>
        </div>

        {/* Mobile filter tabs (anchor links) */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar pb-1 text-xs font-bold md:hidden">
          {[
            { label: "Overview", href: "#payments" },
            { label: "Payments", href: "#payments" },
            { label: "Leases", href: "#leases" },
            { label: "Care Service", href: "#care" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="px-3.5 py-1.5 rounded-md whitespace-nowrap bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100 transition-all"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Expiring leases banner */}
        {expiringLeases.length > 0 && (
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 sm:p-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-zinc-900 text-sm">
                Lease Expiring Soon — {expiringLeases.length} unit{expiringLeases.length > 1 ? "s" : ""}
              </p>
              <ul className="mt-1 space-y-0.5">
                {expiringLeases.map((l) => (
                  <li key={l.id} className="text-xs text-zinc-600">
                    {l.unit.title} · Expires:{" "}
                    {new Date(l.endDate).toLocaleDateString("en-US")} (within 60 days)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Payment summary */}
        <section id="payments" className="bg-white border border-zinc-200 shadow-2xs rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <span className="text-xs font-bold text-[#0E5246] uppercase tracking-widest">Payments</span>
              <h2 className="text-base sm:text-lg font-extrabold text-zinc-900">This Month Payment Status</h2>
            </div>
            <Link
              href="/dashboard/landlord/payments"
              className="text-xs font-bold text-[#0E5246] hover:underline shrink-0"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500 font-medium block">Pending</span>
                <span className="text-xl font-black text-zinc-800 mt-1 block">{p(PaymentStatus.PENDING)}</span>
              </div>
              <Clock className="w-7 h-7 text-zinc-400 opacity-60" />
            </div>
            <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-600 font-medium block">Awaiting</span>
                <span className="text-xl font-black text-amber-700 mt-1 block">{p(PaymentStatus.AWAITING_APPROVAL)}</span>
              </div>
              <AlertCircle className="w-7 h-7 text-amber-500 opacity-80" />
            </div>
            <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-600 font-medium block">Paid</span>
                <span className="text-xl font-black text-[#0E5246] mt-1 block">{p(PaymentStatus.PAID)}</span>
              </div>
              <CheckCircle2 className="w-7 h-7 text-[#0E5246] opacity-80" />
            </div>
            <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-600 font-medium block">Overdue</span>
                <span className="text-xl font-black text-rose-700 mt-1 block">{p(PaymentStatus.OVERDUE)}</span>
              </div>
              <XCircle className="w-7 h-7 text-rose-500 opacity-80" />
            </div>
          </div>
        </section>

        {/* Active leases + Care 2-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section id="leases" className="bg-white border border-zinc-200 shadow-2xs rounded-xl p-5 sm:p-6 space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <span className="text-xs font-bold text-[#0E5246] uppercase tracking-widest">Leases</span>
                <h2 className="text-base sm:text-lg font-extrabold text-zinc-900">Active Leases</h2>
              </div>
              <Link
                href="/dashboard/landlord/leases"
                className="text-xs font-bold text-[#0E5246] hover:underline shrink-0"
              >
                View All →
              </Link>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 sm:p-5 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-[#0E5246] text-white flex items-center justify-center font-black text-xl shrink-0">
                {leases.length}
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-sm">Active Leases: {leases.length}</h3>
                <p className="text-xs text-zinc-500">Currently generating monthly rental revenue.</p>
              </div>
            </div>
          </section>

          <section id="care" className="bg-white border border-zinc-200 shadow-2xs rounded-xl p-5 sm:p-6 space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <span className="text-xs font-bold text-[#0E5246] uppercase tracking-widest">Care Service</span>
                <h2 className="text-base sm:text-lg font-extrabold text-zinc-900">Unit Maintenance</h2>
              </div>
              <Link
                href="/dashboard/tenant/care"
                className="text-xs font-bold text-[#0E5246] hover:underline shrink-0"
              >
                View All →
              </Link>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 sm:p-5 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-black text-xl shrink-0">
                {allCareRequests.length}
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-sm">Active Requests: {allCareRequests.length}</h3>
                <p className="text-xs text-zinc-500">Maintenance & repair requests requiring your attention.</p>
              </div>
            </div>
          </section>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
