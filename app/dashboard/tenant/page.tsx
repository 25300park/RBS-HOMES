export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  Wrench,
  DollarSign,
  Sparkles,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import { ContractStatus } from "@prisma/client";
import LogoutButton from "./components/logout-button";
import BottomNav from "./components/bottom-nav";
import RoleAccessPlaceholder from "@/components/dashboard/role-access-placeholder";
import { ConciergeMessageWidget } from "@/components/dashboard/concierge-message-widget";
import { TenantDashboardClient } from "./components/tenant-dashboard-client";
import { PaymentScheduleChart } from "@/components/dashboard/payment-schedule-chart";
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

export default async function TenantDashboardPage() {
  let session: any = await getServerSession(authOptions as any);
  const currentUserId = session?.user?.id ? Number(session.user.id) : 187;
  const userLevel = Number(session?.user?.level ?? 2);
  const isTenant = userLevel === 0 || userLevel === 5;
  const isStaff = userLevel === 0 || userLevel === 20 || userLevel === 30;
  const userRoleInfo = getUserRoleInfo(userLevel);

  const userId = currentUserId;
  const now = new Date();
  const sixtyDaysLater = new Date(now);
  sixtyDaysLater.setDate(now.getDate() + 60);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const activeLease = await prisma.leaseContract.findFirst({
    where: {
      tenantId: userId,
      status: { in: [ContractStatus.ACTIVE, ContractStatus.EXPIRING_SOON] },
    },
    include: {
      unit: { select: { id: true, title: true, fullAddress: true, condoId: true, price: true } },
      condo: { select: { id: true, condoName: true } },
    },
    orderBy: { startDate: "desc" },
  });

  const hasTenantAccess = isTenant || !!activeLease;
  const condoId = activeLease?.unit?.condoId ?? activeLease?.condoId;
  const monthlyRent = Number(activeLease?.monthlyRent || activeLease?.unit?.price || 35000);

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
              className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg transition-colors"
            >
              Owner
            </Link>
            <Link
              href="/dashboard/tenant"
              className="bg-blue-600 text-white px-4 py-1.5 rounded-lg shadow-sm transition-all"
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

      {/* ── Main Dashboard Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-8 md:pb-24">
        {!hasTenantAccess ? (
          <RoleAccessPlaceholder
            targetRole="tenant"
            userRoleName={userRoleInfo.name}
            activeDashboardUrl={userRoleInfo.url}
          />
        ) : (
        <div className="space-y-6">
          {/* Desktop Sub Navigation Tab Bar */}
          <DashboardSubnav role="tenant" />

          {/* Action Bar for Gatepass & Tax OR */}
          <TenantDashboardClient
            unitTitle={activeLease?.unit?.title || "Two Serendra #1204"}
            condoName={activeLease?.condo?.condoName || "Two Serendra BGC"}
            monthlyRent={monthlyRent}
          />

          {/* Main Bento Grid */}
          <div className="grid grid-cols-12 lg:grid-cols-1 gap-6 items-start">

            {/* Left Column (5 cols on lg) */}
            <div className="col-span-5 lg:col-span-1 space-y-6">

              {/* RBS Concierge Assigned Manager Widget */}
              <ConciergeMessageWidget
                userRole="tenant"
                managerName="Mark Richardson"
                managerRole="RBS Dedicated Tenant Concierge"
              />

              {/* Card 1: 12-Month Uniform Rent Payment Schedule */}
              <PaymentScheduleChart
                title="Rent Payment"
                subtitle="12-Month Lease Payment Status"
                totalPaidCount={5}
                monthlyRent={monthlyRent}
                userType="tenant"
              />

            {/* Card 2: My Lease Information */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-zinc-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-zinc-900">Lease Breakdown</h3>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                  activeLease ? "text-emerald-600 bg-emerald-50 border border-emerald-200/60" : "text-zinc-500 bg-zinc-100"
                }`}>
                  {activeLease ? "Active" : "No Contract"}
                </span>
              </div>

              {activeLease ? (
                <div className="space-y-3">
                  {[
                    {
                      name: activeLease?.unit?.title || "Two Serendra 1BR #1204",
                      sub: activeLease?.unit?.fullAddress || "Fort Bonifacio, Taguig City",
                      value: `₱${monthlyRent.toLocaleString()}/mo`,
                      bg: "bg-blue-600 text-white",
                      icon: Building2,
                    },
                    {
                      name: "Security Deposit",
                      sub: "2 Months Deposit Held in Escrow",
                      value: `₱${(monthlyRent * 2).toLocaleString()}`,
                      bg: "bg-emerald-600 text-white",
                      icon: ShieldCheck,
                    },
                    {
                      name: "Next Payment Due",
                      sub: "Direct Bank Transfer / GCash",
                      value: "Aug 25, 2026",
                      bg: "bg-amber-500 text-white",
                      icon: Clock,
                    },
                    {
                      name: "Free Care Service",
                      sub: "Aircon Cleaning & Handyman",
                      value: "2 Left",
                      bg: "bg-indigo-600 text-white",
                      icon: Wrench,
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
                            <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate">
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-zinc-500 font-medium truncate">{item.sub}</p>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-extrabold text-blue-600 shrink-0">
                          {item.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center bg-[#f8fafc] rounded-xl border border-dashed border-zinc-200">
                  <ShieldCheck className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm font-bold text-zinc-700">No Active Lease Contract</p>
                  <p className="text-[11px] text-zinc-500 mt-1">Browse verified rentals to find and lease your next home.</p>
                  <Link
                    href="/unit/rent"
                    className="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                  >
                    Browse Rentals →
                  </Link>
                </div>
              )}
            </div>

          </div>

          {/* Right Column (7 cols on lg) */}
          <div className="col-span-7 lg:col-span-1 space-y-6">

            {/* Row 1: Care Statistics + Rent Action Banner Card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

              {/* Progress statistics Card */}
              <div className="md:col-span-6 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-zinc-200/80 flex flex-col justify-between space-y-5">
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900">Lease Health</h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl sm:text-4xl font-black text-blue-600">100%</span>
                    <span className="text-xs font-semibold text-zinc-500">Payment on time</span>
                  </div>

                  <div className="w-full h-2.5 rounded-full overflow-hidden bg-zinc-100 flex mt-4">
                    <div className="bg-blue-600 h-full" style={{ width: "70%" }} />
                    <div className="bg-emerald-500 h-full" style={{ width: "20%" }} />
                    <div className="bg-amber-500 h-full" style={{ width: "10%" }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-400 font-bold mt-1.5">
                    <span>70% Term Passed</span>
                    <span>20% Left</span>
                    <span>10% Renewal</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-100">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-base font-black text-zinc-900">4.9</span>
                    <span className="text-[10px] font-semibold text-zinc-500">Tenant Score</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-base font-black text-zinc-900">6</span>
                    <span className="text-[10px] font-semibold text-zinc-500">Completed</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-base font-black text-zinc-900">2</span>
                    <span className="text-[10px] font-semibold text-zinc-500">Scheduled</span>
                  </div>
                </div>
              </div>

              {/* Action Banner Card */}
              <div className="md:col-span-6 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-zinc-200/80 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-emerald-50 text-emerald-600 font-bold text-[10px] px-2.5 py-0.5 rounded-md border border-emerald-200/60">
                      Auto Pay Ready
                    </span>
                    <span className="bg-blue-50 text-blue-600 font-bold text-[10px] px-2.5 py-0.5 rounded-md border border-blue-200/60">
                      RBS Concierge
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 leading-snug">
                    Seamless Living with RBS
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    Schedule free repairs, check condo notice boards, or settle monthly rent instantly.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-zinc-500 block mb-1">Next Billing</span>
                      <span className="text-xs font-bold text-zinc-900">₱{monthlyRent.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-semibold text-zinc-500 block mb-1">Status</span>
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                        ● Good Standing
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/dashboard/tenant/payments"
                      className="w-full bg-[#1d4ed8] hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-98 transition-all text-center"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay Rent</span>
                    </Link>
                    <Link
                      href="/dashboard/tenant/care"
                      className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all text-center"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Request Care</span>
                    </Link>
                  </div>
                </div>
              </div>

            </div>

            {/* Row 2: My Schedule & Requests (33. Spacing & Reduced Radius) */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-zinc-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-extrabold text-zinc-900">My Schedule & Requests</h3>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Schedule Card 1 */}
                <div className="bg-[#f8fafc] border border-zinc-200/80 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:shadow-sm transition-shadow">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-zinc-500 block">10:30 — 12:00</span>
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900 leading-snug">
                      Aircon Filter Maintenance
                    </h4>
                    <span className="inline-block bg-blue-50 text-blue-700 font-bold text-[10px] px-2 py-0.5 rounded-md mt-1">
                      Free Care Service
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-200/60">
                    <div className="w-6 h-6 rounded-full bg-zinc-300 overflow-hidden">
                      <Image src="/assets/images/default-avatar.png" alt="Tech" width={24} height={24} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-zinc-900 leading-tight truncate">Kristin Watson</p>
                      <p className="text-[9px] text-zinc-500 truncate">RBS Care Specialist</p>
                    </div>
                  </div>
                </div>

                {/* Schedule Card 2 (Active highlighted) */}
                <div className="bg-[#1d4ed8] text-white rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-md shadow-blue-600/25 relative overflow-hidden">
                  <div className="space-y-1 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-blue-100">13:00 — 14:00</span>
                      <span className="bg-[#fbbf24] text-zinc-900 font-black text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-ping" />
                        Now
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                      Water Leakage & Faucet Repair
                    </h4>
                    <span className="inline-block bg-white/20 text-white font-bold text-[10px] px-2 py-0.5 rounded-md mt-1 backdrop-blur-xs">
                      In Progress
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/20 relative z-10">
                    <div className="w-6 h-6 rounded-full bg-white/30 overflow-hidden">
                      <Image src="/assets/images/default-avatar.png" alt="Plumber" width={24} height={24} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-white leading-tight truncate">Cody Fisher</p>
                      <p className="text-[9px] text-blue-100 truncate">Certified Plumber</p>
                    </div>
                  </div>
                </div>

                {/* Schedule Card 3 */}
                <div className="bg-[#f8fafc] border border-zinc-200/80 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:shadow-sm transition-shadow">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-zinc-500 block">16:00 — 17:00</span>
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900 leading-snug">
                      Condo Admin Move-in Permit
                    </h4>
                    <span className="inline-block bg-emerald-100 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded-md mt-1">
                      Two Serendra
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-200/60">
                    <div className="w-6 h-6 rounded-full bg-zinc-300 overflow-hidden">
                      <Image src="/assets/images/default-avatar.png" alt="Admin" width={24} height={24} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-zinc-900 leading-tight truncate">Jacob Jones</p>
                      <p className="text-[9px] text-zinc-500 truncate">Property Concierge</p>
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
