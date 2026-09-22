export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { getLandlordLeaseData } from "@/lib/landlord/get-landlord-leases";
import {
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
  Clock,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import { PaymentStatus } from "@prisma/client";
import LogoutButton from "./components/logout-button";
import BottomNav from "./components/bottom-nav";
import RoleAccessPlaceholder from "@/components/dashboard/role-access-placeholder";
import { ConciergeMessageWidget } from "@/components/dashboard/concierge-message-widget";
import { LandlordCareApprovalCard } from "./components/landlord-care-approval-card";
import { LandlordRevenueChart } from "./components/landlord-revenue-chart";
import { DashboardSubnav } from "@/components/dashboard/dashboard-subnav";

function getUserRoleInfo(level: number) {
  if (level === 2 || level === 3 || level === 20 || level === 30) {
    return { name: "Agent / Broker", url: "/dashboard/agent" };
  }
  if (level === 5) {
    return { name: "Tenant", url: "/dashboard/tenant" };
  }
  if (level === 4 || level === 40) {
    return { name: "Property Owner", url: "/dashboard/landlord" };
  }
  return { name: "Buyer", url: "/dashboard/buyer" };
}

export default async function LandlordDashboardPage() {
  let session: any = await getServerSession(authOptions as any);
  const currentUserId = session?.user?.id ? Number(session.user.id) : 187;
  const userLevel = Number(session?.user?.level ?? 2);
  const isOwner = userLevel === 0 || userLevel === 4 || userLevel === 40;
  const isStaff = userLevel === 0 || userLevel === 20 || userLevel === 30;
  const userRoleInfo = getUserRoleInfo(userLevel);

  // If user is not an owner/admin and has no landlord leases
  const userLandlordLeaseCount = await prisma.leaseContract.count({
    where: { landlordId: currentUserId },
  });

  const hasOwnerAccess = isOwner || userLandlordLeaseCount > 0;

  const userId = currentUserId;
  const { leases, expiringLeases, allCareRequests, paymentSummary } = hasOwnerAccess
    ? await getLandlordLeaseData(userId)
    : { leases: [], expiringLeases: [], allCareRequests: [], paymentSummary: {} as any };

  const p = (s: PaymentStatus) => paymentSummary[s] ?? 0;
  const totalPaid = p(PaymentStatus.PAID);
  const totalPending = p(PaymentStatus.PENDING);
  const totalAwaiting = p(PaymentStatus.AWAITING_APPROVAL);
  const totalOverdue = p(PaymentStatus.OVERDUE);
  const totalUnits = leases.length;
  const occupancyRate = totalUnits > 0 ? Math.round(((totalUnits - totalOverdue) / totalUnits) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* ── Global GNB Header (Same as Main Page) ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 h-[72px] sm:h-16 flex items-center justify-between">
          
          {/* Brand Logo - Official RBS Logo */}
          <Link href="/" className="flex items-center">
            <img
              src="/assets/images/rbs-logo.png"
              alt="RBS Homes"
              className="h-9 sm:h-8 w-auto object-contain"
            />
          </Link>

          {/* Center: Dashboard Switcher Links */}
          <nav className="flex md:hidden items-center bg-zinc-100/80 p-1.5 rounded-xl border border-zinc-200/60 text-xs font-bold text-zinc-600">
            {isStaff && (
              <Link
                href="/dashboard/staff"
                className="hover:text-blue-600 px-3 py-1.5 rounded-lg transition-colors"
              >
                Staff
              </Link>
            )}
            <Link
              href="/dashboard/landlord"
              className="bg-blue-600 text-white px-4 py-1.5 rounded-lg shadow-sm transition-all"
            >
              Owner
            </Link>
            <Link
              href="/dashboard/tenant"
              className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg transition-colors"
            >
              Tenant
            </Link>
            <Link
              href="/dashboard/agent"
              className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg transition-colors"
            >
              Agent
            </Link>
          </nav>

          {/* Right: Quick Actions & Profile */}
          <div className="flex items-center gap-4 sm:gap-3">
            <Link
              href="/account/unit/registration/step-one"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all active:scale-98"
            >
              <Building2 className="w-4 h-4" />
              <span>+ Post Property</span>
            </Link>
            <LogoutButton />
          </div>

        </div>
      </header>

      {/* ── Main Dashboard Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-8 md:pb-24">
        {!hasOwnerAccess ? (
          <RoleAccessPlaceholder
            targetRole="owner"
            userRoleName={userRoleInfo.name}
            activeDashboardUrl={userRoleInfo.url}
          />
        ) : (
        <div className="space-y-6">
          {/* Desktop Sub Navigation Tab Bar */}
          <DashboardSubnav role="landlord" />

          {/* Overdue Payments Alert */}
          {totalOverdue > 0 && (
            <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-5 sm:p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-rose-700">
                    {totalOverdue} Overdue Payment{totalOverdue > 1 ? "s" : ""}
                  </h3>
                  <p className="text-xs text-rose-600/80 font-medium">Tenant payments past due — review and follow up.</p>
                </div>
              </div>
              <Link
                href="/dashboard/landlord/payments"
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shrink-0 transition-all shadow-sm"
              >
                Review
              </Link>
            </div>
          )}

          {/* Main Bento Grid (5 cols / 7 cols) */}
          <div className="grid grid-cols-12 lg:grid-cols-1 gap-6 items-start">

          {/* Left Column (5 cols on lg) */}
          <div className="col-span-5 lg:col-span-1 space-y-6">

            {/* RBS Dedicated Asset Manager Widget */}
            <ConciergeMessageWidget
              userRole="landlord"
              managerName="Sarah Jenkins"
              managerRole="RBS Landlord Asset Manager"
            />

            {/* Repair Cost Approvals Card */}
            <LandlordCareApprovalCard />

            {/* Card 1: 12-Month Uniform Rental Revenue Schedule Chart */}
            <LandlordRevenueChart
              totalPaidCount={totalPaid || 5}
              monthlyRent={45000}
            />

            {/* Card 2: By Property Unit (28. Overflow fixed with min-w-0 & truncate) */}
            <div className="bg-white rounded-2xl p-6 sm:p-5 shadow-sm border border-zinc-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-zinc-900">By Property Unit</h3>
                <Link href="/dashboard/landlord/leases" className="text-xs font-bold text-blue-600 hover:underline">
                  See all
                </Link>
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: leases[0]?.unit.title || "Two Serendra 1BR #1204",
                    sub: "BGC, Taguig · Active Lease",
                    price: "₱45,000",
                    bg: "bg-blue-600 text-white",
                    icon: Building2,
                  },
                  {
                    name: leases[1]?.unit.title || "The Rise Makati Studio #0811",
                    sub: "San Antonio, Makati · Paid",
                    price: "₱32,000",
                    bg: "bg-emerald-600 text-white",
                    icon: ShieldCheck,
                  },
                  {
                    name: leases[2]?.unit.title || "Grand Hyatt Residences 2BR",
                    sub: "North BGC · Expiring Soon",
                    price: "₱95,000",
                    bg: "bg-amber-500 text-white",
                    icon: Clock,
                  },
                  {
                    name: "Park Triangle Corporate Plaza",
                    sub: "Commercial Office · Active",
                    price: "₱68,000",
                    bg: "bg-indigo-600 text-white",
                    icon: Briefcase,
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-100 transition-all">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0 shadow-sm`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm sm:text-xs font-bold text-zinc-900 truncate">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-zinc-500 font-medium truncate">{item.sub}</p>
                        </div>
                      </div>
                      <span className="text-sm sm:text-xs font-extrabold text-blue-600 shrink-0">
                        {item.price}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column (7 cols on lg) */}
          <div className="col-span-7 lg:col-span-1 space-y-6">

            {/* Row 1: Progress Statistics + Action Banner Card */}
            <div className="grid grid-cols-12 md:grid-cols-1 gap-6">

              {/* Progress statistics Card */}
              <div className="col-span-6 md:col-span-1 bg-white rounded-2xl p-6 sm:p-5 shadow-sm border border-zinc-200/80 flex flex-col justify-between space-y-5">
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900">Lease Performance</h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl sm:text-3xl font-black text-blue-600">{occupancyRate}%</span>
                    <span className="text-xs font-semibold text-zinc-500">Occupancy rate</span>
                  </div>

                  <div className="w-full h-2.5 rounded-full overflow-hidden bg-zinc-100 flex mt-4">
                    <div className="bg-blue-600 h-full" style={{ width: "55%" }} />
                    <div className="bg-emerald-500 h-full" style={{ width: "30%" }} />
                    <div className="bg-amber-500 h-full" style={{ width: "15%" }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-400 font-bold mt-1.5">
                    <span>55% Paid</span>
                    <span>30% Active</span>
                    <span>15% Pending</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-100">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-base font-black text-zinc-900">{totalAwaiting || 2}</span>
                    <span className="text-[10px] font-semibold text-zinc-500">In review</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-base font-black text-zinc-900">{totalPaid || 5}</span>
                    <span className="text-[10px] font-semibold text-zinc-500">Completed</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-base font-black text-zinc-900">{expiringLeases.length || 1}</span>
                    <span className="text-[10px] font-semibold text-zinc-500">Upcoming</span>
                  </div>
                </div>
              </div>

              {/* Action Banner Card */}
              <div className="col-span-6 md:col-span-1 bg-white rounded-2xl p-6 sm:p-5 shadow-sm border border-zinc-200/80 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-emerald-50 text-emerald-600 font-bold text-[10px] px-2.5 py-0.5 rounded-md border border-emerald-200/60">
                      RBS Care Pro
                    </span>
                    <span className="bg-blue-50 text-blue-600 font-bold text-[10px] px-2.5 py-0.5 rounded-md border border-blue-200/60">
                      Asset Protection
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-base font-extrabold text-zinc-900 leading-snug">
                    Property care made easy
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    Approve repairs, review tenant requests, and track regular maintenance schedules seamlessly.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-zinc-500 block mb-1">Active Tenants</span>
                      <div className="flex -space-x-2">
                        {["default-avatar.png", "default-avatar.png", "default-avatar.png"].map((img, i) => (
                          <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-zinc-200 overflow-hidden">
                            <Image src={`/assets/images/${img}`} alt="Tenant" width={28} height={28} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-semibold text-zinc-500 block mb-1">Resolution</span>
                      <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                        92% On Time
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/tenant/care"
                    className="w-full bg-[#1d4ed8] hover:bg-blue-700 text-white font-bold text-sm sm:text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-98 transition-all"
                  >
                    <span>Manage Care Requests</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

            </div>

            {/* Row 2: My Schedule & Timeline (29. Ample padding and reduced border radius) */}
            <div className="bg-white rounded-2xl p-6 sm:p-5 shadow-sm border border-zinc-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-base font-extrabold text-zinc-900">My Schedule & Leases</h3>
                <div className="flex items-center gap-1">
                  <button className="w-8 h-8 rounded-full border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-600">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-zinc-800 px-2">Today</span>
                  <button className="w-8 h-8 rounded-full border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-600">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-1 gap-4">
                
                {/* Schedule Item 1 */}
                <div className="bg-[#f8fafc] border border-zinc-200/80 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:shadow-sm transition-shadow">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-zinc-500 block">10:30 — 12:00</span>
                    <h4 className="text-sm sm:text-xs font-bold text-zinc-900 leading-snug">
                      Aircon Deep Clean & Inspection
                    </h4>
                    <span className="inline-block bg-blue-50 text-blue-700 font-bold text-[10px] px-2 py-0.5 rounded-md mt-1">
                      Two Serendra
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-200/60">
                    <div className="w-6 h-6 rounded-full bg-zinc-300 overflow-hidden">
                      <Image src="/assets/images/default-avatar.png" alt="Tech" width={24} height={24} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-zinc-900 leading-tight truncate">Kristin Watson</p>
                      <p className="text-[9px] text-zinc-500 truncate">RBS Care Tech</p>
                    </div>
                  </div>
                </div>

                {/* Schedule Item 2 (Active highlighted) */}
                <div className="bg-[#1d4ed8] text-white rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-md shadow-blue-600/25 relative overflow-hidden">
                  <div className="space-y-1 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-blue-100">13:00 — 14:00</span>
                      <span className="bg-[#fbbf24] text-zinc-900 font-black text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-ping" />
                        Now
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-xs font-bold text-white leading-snug">
                      Rental Contract Renewal & Review
                    </h4>
                    <span className="inline-block bg-white/20 text-white font-bold text-[10px] px-2 py-0.5 rounded-md mt-1 backdrop-blur-xs">
                      The Rise Makati
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-white/20 relative z-10">
                    <div className="w-6 h-6 rounded-full bg-white/30 overflow-hidden">
                      <Image src="/assets/images/default-avatar.png" alt="Tenant" width={24} height={24} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-white leading-tight truncate">Cody Fisher</p>
                      <p className="text-[9px] text-blue-100 truncate">Verified Tenant</p>
                    </div>
                  </div>
                </div>

                {/* Schedule Item 3 */}
                <div className="bg-[#f8fafc] border border-zinc-200/80 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:shadow-sm transition-shadow">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-zinc-500 block">16:00 — 17:00</span>
                    <h4 className="text-sm sm:text-xs font-bold text-zinc-900 leading-snug">
                      New Tenant Move-in Handover
                    </h4>
                    <span className="inline-block bg-emerald-100 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded-md mt-1">
                      Grand Hyatt
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-200/60">
                    <div className="w-6 h-6 rounded-full bg-zinc-300 overflow-hidden">
                      <Image src="/assets/images/default-avatar.png" alt="Agent" width={24} height={24} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-zinc-900 leading-tight truncate">Jacob Jones</p>
                      <p className="text-[9px] text-zinc-500 truncate">Property Manager</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
        </div>
        )}

      </main>
      <BottomNav />
    </div>
  );
}
