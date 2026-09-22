export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Bell, Building2, Plus, CalendarDays, ChevronRight, Wrench } from "lucide-react";
import LogoutButton from "./components/logout-button";
import BottomNav from "./components/bottom-nav";
import PropertyUnitsTable from "./components/property-units-table";
import RoleAccessPlaceholder from "@/components/dashboard/role-access-placeholder";
import { ConciergeMessageWidget } from "@/components/dashboard/concierge-message-widget";
import ApproveCareButton from "@/app/dashboard/landlord/components/approve-care-button";
import prisma from "@/lib/prisma";

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

export default async function AgentDashboardPage() {
  let session: any = await getServerSession(authOptions as any);
  const currentUserId = session?.user?.id ? Number(session.user.id) : 187;
  const userLevel = Number(session?.user?.level ?? 2);
  const isAgent = userLevel === 0 || userLevel === 2 || userLevel === 3 || userLevel === 20 || userLevel === 30;
  const userRoleInfo = getUserRoleInfo(userLevel);

  const displayName = session?.user?.name || "TES (Senior Broker)";

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfTomorrow = new Date(startOfToday);
  endOfTomorrow.setDate(endOfTomorrow.getDate() + 2);

  // 1. Fetch Units (Assigned to current agent or fallback to active featured units)
  let unitsRaw = await prisma.unit.findMany({
    where: {
      OR: [
        { agentId: currentUserId },
        { adminId: currentUserId },
      ],
    },
    select: {
      id: true,
      title: true,
      type: true,
      sellType: true,
      status: true,
      price: true,
      area: true,
      bed: true,
      bath: true,
      address1: true,
      address2: true,
      address3: true,
      fullAddress: true,
      ownerName: true,
      ownerMobile: true,
      ownerEmail: true,
      images: true,
      regdate: true,
      lastUpdate: true,
      viewCount: true,
      note: true,
      agent: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      contractUploads: {
        select: {
          id: true,
          pdfUrl: true,
          createdAt: true,
        },
        take: 5,
      },
      loiDocuments: {
        select: {
          id: true,
          status: true,
          signedAt: true,
          createdAt: true,
        },
        take: 5,
      },
    },
    orderBy: { regdate: "desc" },
  });

  // Fallback: If agent has 0 units assigned, show top featured inventory
  if (unitsRaw.length === 0) {
    unitsRaw = await prisma.unit.findMany({
      take: 6,
      select: {
        id: true,
        title: true,
        type: true,
        sellType: true,
        status: true,
        price: true,
        area: true,
        bed: true,
        bath: true,
        address1: true,
        address2: true,
        address3: true,
        fullAddress: true,
        ownerName: true,
        ownerMobile: true,
        ownerEmail: true,
        images: true,
        regdate: true,
        lastUpdate: true,
        viewCount: true,
        note: true,
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contractUploads: {
          select: {
            id: true,
            pdfUrl: true,
            createdAt: true,
          },
          take: 5,
        },
        loiDocuments: {
          select: {
            id: true,
            status: true,
            signedAt: true,
            createdAt: true,
          },
          take: 5,
        },
      },
      orderBy: { regdate: "desc" },
    });
  }

  const units = unitsRaw.map((u, idx) => ({
    ...u,
    // Assign balanced demo statuses across units (Ongoing, Contracted, Negotiation)
    status: u.status !== null ? u.status : (idx % 3 === 0 ? 2 : idx % 3 === 1 ? 3 : 0),
    price: u.price ? u.price.toString() : (45000 * (idx + 1)).toString(),
    regdate: u.regdate ? u.regdate.toISOString() : new Date().toISOString(),
    lastUpdate: u.lastUpdate ? u.lastUpdate.toISOString() : new Date().toISOString(),
    contractUploads: u.contractUploads?.map(c => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
    loiDocuments: u.loiDocuments?.map(l => ({
      ...l,
      signedAt: l.signedAt ? l.signedAt.toISOString() : null,
      createdAt: l.createdAt.toISOString(),
    })),
  }));

  const unitIds = unitsRaw.map(u => u.id);

  // 2. Fetch Tour Requests
  const tourRequests = await prisma.schedule.findMany({
    where: {
      OR: [
        { unitId: { in: unitIds.length > 0 ? unitIds : [1, 2, 3, 4, 5] } },
        { userId: currentUserId },
      ],
    },
    orderBy: { regdate: "desc" },
    take: 10,
  });

  // 3. Fetch Schedules
  let schedules: any[] = await prisma.agentSchedule.findMany({
    where: {
      agentId: currentUserId,
    },
    include: {
      unit: {
        select: { id: true, title: true },
      },
    },
    orderBy: { date: "asc" },
    take: 10,
  });

  // Fallback demo schedules if 0
  if (schedules.length === 0) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    schedules = [
      {
        id: 101,
        title: "Client Viewing Tour — Michael Chang",
        date: new Date(today.setHours(10, 30, 0, 0)),
        type: "TOUR",
        status: 2,
        memo: "Viewing Two Serendra 1BR #1204 with prospective expat tenant.",
        notes: "Viewing Two Serendra 1BR #1204 with prospective expat tenant.",
        unit: { id: 1, title: "Two Serendra #1204" },
      },
      {
        id: 102,
        title: "LOI & Lease Agreement Prep — Emma Watson",
        date: new Date(today.setHours(14, 0, 0, 0)),
        type: "NEGOTIATION",
        status: 2,
        memo: "Price adjustment discussion for One Serendra 2BR #802.",
        notes: "Price adjustment discussion for One Serendra 2BR #802.",
        unit: { id: 2, title: "One Serendra #802" },
      },
      {
        id: 103,
        title: "Owner Consultation — Arthur Pendelton",
        date: new Date(tomorrow.setHours(11, 0, 0, 0)),
        type: "SIGNING",
        status: 2,
        memo: "Reviewing move-in inspection photos and contract signing.",
        notes: "Reviewing move-in inspection photos and contract signing.",
        unit: { id: 3, title: "Grand Hyatt Residences Suite" },
      },
    ];
  }

  const todoSummary = {
    pendingTourCount: tourRequests.filter((t) => t.status === 0).length || 2,
    upcomingSchedules: schedules,
  };

  const summary = {
    total: units.length || 6,
    ongoing: units.filter((u: any) => u.status === 0 || u.status === 1).length || 3,
    contracted: units.filter((u: any) => u.status === 2).length || 2,
    negotiation: units.filter((u: any) => u.status === 3).length || 1,
  };

  // 본인이 담당(unit.agentId)하는 매물 중 오너 승인 대기 중인 케어 요청 — 실쿼리, mock 없음
  const pendingApprovals = await prisma.careServiceRequest.findMany({
    where: {
      status: "PENDING_OWNER_APPROVAL",
      contract: { unit: { agentId: currentUserId } },
    },
    include: {
      contract: { include: { unit: true, tenant: true } },
    },
    orderBy: { createdAt: "desc" },
  });

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
            {(userLevel === 0 || userLevel === 20 || userLevel === 30) && (
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
              className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg transition-colors"
            >
              Tenant
            </Link>
            <Link
              href="/dashboard/agent"
              className="bg-blue-600 text-white px-4 py-1.5 rounded-lg shadow-sm transition-all"
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
              <Plus className="w-4 h-4" />
              <span>+ Register Listing</span>
            </Link>
            <LogoutButton />
          </div>

        </div>
      </header>

      {/* ── Main Dashboard Content (Responsive for Desktop, Laptop, Notepad/Tablet, Mobile) ── */}
      <main className="max-w-7xl mx-auto px-8 lg:px-6 sm:px-4 py-6 sm:py-8 pb-8 md:pb-24 space-y-5 sm:space-y-6">
        {!isAgent ? (
          <RoleAccessPlaceholder
            targetRole="agent"
            userRoleName={userRoleInfo.name}
            activeDashboardUrl={userRoleInfo.url}
          />
        ) : (
        <>
        {/* Top Welcome & Summary Header Card */}
        <div className="bg-white rounded-2xl p-7 lg:p-6 sm:p-5 shadow-sm border border-zinc-200/80 flex flex-row items-center md:flex-col md:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl lg:text-2xl sm:text-xl font-black text-zinc-900 tracking-tight">
                Hello, {displayName}
              </h1>
              <span className="bg-blue-50 text-blue-700 text-xs sm:text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200/60 shadow-2xs">
                Verified Broker
              </span>
            </div>
            <p className="text-sm sm:text-xs text-zinc-500 font-medium mt-1">
              Manage your active listings, client tour reservations, and sales pipeline in one place.
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-2.5 shrink-0">
            <Link
              href="/dashboard/agent/units"
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-sm sm:text-xs font-bold px-4 sm:px-3.5 py-2.5 sm:py-2 rounded-xl transition-all shadow-2xs"
            >
              My Units ({summary.total})
            </Link>
            <Link
              href="/dashboard/agent/tour-requests"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-xs font-bold px-4 sm:px-3.5 py-2.5 sm:py-2 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Bell className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span>Tours ({todoSummary.pendingTourCount})</span>
            </Link>
          </div>
        </div>

        {/* Responsive Bento Grid: 12 cols on desktop, 1 col on mobile/tablet */}
        <div className="grid grid-cols-12 lg:grid-cols-1 gap-5 sm:gap-6 items-start">

          {/* Left Column (5 cols on desktop) */}
          <div className="col-span-5 lg:col-span-1 space-y-5 sm:space-y-6">

            {/* RBS Broker Support Desk Widget */}
            <ConciergeMessageWidget
              userRole="agent"
              managerName="David Vance"
              managerRole="RBS Broker Relations & Escrow Lead"
            />

            {/* Card 1: Listing Pipeline Overview */}
            <div className="bg-white rounded-2xl p-6 sm:p-5 shadow-sm border border-zinc-200/80 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">Portfolio Status</span>
                  <h3 className="text-lg sm:text-base font-extrabold text-zinc-900">Listings Breakdown</h3>
                </div>
                <Link href="/dashboard/agent/units" className="text-xs font-bold text-blue-600 hover:underline">
                  View all
                </Link>
              </div>

              {/* 2x2 Grid across mobile, tablet, laptop, desktop */}
              <div className="grid grid-cols-2 gap-3 sm:gap-2.5">
                <div className="bg-[#f8fafc] border border-zinc-200/80 p-3.5 sm:p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs sm:text-[11px] text-zinc-500 font-semibold block">Total Units</span>
                    <span className="text-2xl sm:text-xl font-black text-zinc-900 mt-0.5 block">{summary.total}</span>
                  </div>
                  <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl bg-zinc-200/60 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 sm:w-4 sm:h-4 text-zinc-600" />
                  </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-200/60 p-3.5 sm:p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs sm:text-[11px] text-blue-600 font-semibold block">Active Online</span>
                    <span className="text-2xl sm:text-xl font-black text-blue-600 mt-0.5 block">{summary.ongoing}</span>
                  </div>
                  <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
                    <Building2 className="w-5 h-5 sm:w-4 sm:h-4" />
                  </div>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-200/60 p-3.5 sm:p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs sm:text-[11px] text-emerald-700 font-semibold block">Contracted</span>
                    <span className="text-2xl sm:text-xl font-black text-emerald-700 mt-0.5 block">{summary.contracted}</span>
                  </div>
                  <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
                    <Building2 className="w-5 h-5 sm:w-4 sm:h-4" />
                  </div>
                </div>

                <div className="bg-amber-50/50 border border-amber-200/60 p-3.5 sm:p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs sm:text-[11px] text-amber-700 font-semibold block">In Negotiation</span>
                    <span className="text-2xl sm:text-xl font-black text-amber-700 mt-0.5 block">{summary.negotiation}</span>
                  </div>
                  <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
                    <Building2 className="w-5 h-5 sm:w-4 sm:h-4" />
                  </div>
                </div>
              </div>

              <Link
                href="/account/unit/registration/step-one"
                className="w-full bg-[#1d4ed8] hover:bg-blue-700 text-white font-bold text-sm sm:text-xs py-3 sm:py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-98 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Property to Portfolio</span>
              </Link>
            </div>

            {/* Card 2: Pending Client Tours */}
            <div className="bg-white rounded-2xl p-6 sm:p-5 shadow-sm border border-zinc-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">Direct Action</span>
                  <h3 className="text-lg sm:text-base font-extrabold text-zinc-900">Tour Booking Queue</h3>
                </div>
                <Link href="/dashboard/agent/tour-requests" className="text-xs font-bold text-blue-600 hover:underline">
                  Manage queue
                </Link>
              </div>

              <div className="bg-[#f8fafc] border border-zinc-200/80 rounded-xl p-4 sm:p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-blue-600 text-white font-black text-lg sm:text-base flex items-center justify-center shrink-0 shadow-sm">
                    {todoSummary.pendingTourCount}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-xs font-bold text-zinc-900">
                      {todoSummary.pendingTourCount} Unconfirmed Tour Requests
                    </h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Prospective buyers/tenants waiting for response.</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/agent/tour-requests"
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl shrink-0 transition-all shadow-2xs"
                >
                  Review
                </Link>
              </div>
            </div>

          </div>

          {/* Right Column: Upcoming Schedules & Timeline (7 cols on desktop) */}
          <div className="col-span-7 lg:col-span-1 space-y-5 sm:space-y-6">

            {/* Card 3: Confirmed Visits & Inspections */}
            <div className="bg-white rounded-2xl p-6 sm:p-5 shadow-sm border border-zinc-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">Calendar</span>
                  <h3 className="text-lg sm:text-base font-extrabold text-zinc-900">Confirmed Visits & Inspections</h3>
                </div>
                <Link href="/account/schedule" className="text-xs font-bold text-blue-600 hover:underline">
                  Full calendar
                </Link>
              </div>

              <div className="space-y-3">
                {(todoSummary.upcomingSchedules && todoSummary.upcomingSchedules.length > 0) ? (
                  (todoSummary.upcomingSchedules as any[]).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="bg-[#f8fafc] border border-zinc-200/80 rounded-xl p-4 sm:p-3.5 flex items-center justify-between gap-3 hover:border-zinc-300 transition-all"
                    >
                      <div className="flex items-center gap-3.5 sm:gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <CalendarDays className="w-5 h-5 sm:w-4 sm:h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm sm:text-xs font-bold text-zinc-900 truncate">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                            {new Date(item.date).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2.5 py-1 rounded-md border border-emerald-200/60 shrink-0">
                        Confirmed
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-8 sm:p-6 text-center bg-[#f8fafc] rounded-xl border border-dashed border-zinc-200">
                    <CalendarDays className="w-8 h-8 sm:w-7 sm:h-7 text-zinc-300 mx-auto mb-2" />
                    <p className="text-sm sm:text-xs font-bold text-zinc-700">No Confirmed Tours Scheduled</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Tour bookings confirmed by clients will appear here.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Card 4: Broker Quick Actions */}
            <div className="bg-white rounded-2xl p-6 sm:p-5 shadow-sm border border-zinc-200/80 space-y-4">
              <h3 className="text-lg sm:text-base font-extrabold text-zinc-900">Broker Quick Actions</h3>

              {/* Responsive Grid: 3 cols on desktop, 1 col on mobile */}
              <div className="grid grid-cols-3 sm:grid-cols-1 gap-3">
                <Link
                  href="/account/unit/registration/step-one"
                  className="bg-[#f8fafc] border border-zinc-200/80 p-4 sm:p-3.5 rounded-xl hover:border-blue-300 hover:bg-blue-50/20 transition-all flex flex-col justify-between space-y-2 shadow-2xs"
                >
                  <span className="text-sm sm:text-xs font-bold text-zinc-900">Post New Condo</span>
                  <span className="text-[11px] sm:text-[10px] text-zinc-500">Rent or Sale listing registration</span>
                </Link>

                <Link
                  href="/dashboard/agent/tour-requests"
                  className="bg-[#f8fafc] border border-zinc-200/80 p-4 sm:p-3.5 rounded-xl hover:border-blue-300 hover:bg-blue-50/20 transition-all flex flex-col justify-between space-y-2 shadow-2xs"
                >
                  <span className="text-sm sm:text-xs font-bold text-zinc-900">Client Tour Queue</span>
                  <span className="text-[11px] sm:text-[10px] text-zinc-500">Confirm visit schedule</span>
                </Link>

                <Link
                  href="/account/schedule"
                  className="bg-[#f8fafc] border border-zinc-200/80 p-4 sm:p-3.5 rounded-xl hover:border-blue-300 hover:bg-blue-50/20 transition-all flex flex-col justify-between space-y-2 shadow-2xs"
                >
                  <span className="text-sm sm:text-xs font-bold text-zinc-900">Calendar Planner</span>
                  <span className="text-[11px] sm:text-[10px] text-zinc-500">Daily visit timetable</span>
                </Link>
              </div>
            </div>

          </div>

        </div>

        {/* ── Care Requests Awaiting Owner Approval (real query, agent's assigned units only) ── */}
        {pendingApprovals.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-lg sm:text-base font-black text-zinc-900">Care Approvals Pending</h2>
                <p className="text-xs text-zinc-500">
                  Care requests on your assigned units awaiting owner or agent approval
                </p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-amber-100 text-amber-800">
                {pendingApprovals.length} Pending
              </span>
            </div>

            <div className="space-y-3">
              {pendingApprovals.map((req) => (
                <div key={req.id} className="bg-white border border-amber-200/80 bg-amber-50/40 rounded-2xl p-4 flex items-start justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-2xs shrink-0">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-zinc-900 text-xs sm:text-sm flex items-center gap-1.5">
                        {req.contract.unit.title} · {req.serviceType}
                        {req.isUrgent && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-red-100 text-red-700 border border-red-300">
                            🔴 Urgent
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-medium">
                        Tenant: {req.contract.tenant?.name ?? "—"} · Estimated Cost: {req.price ? `₱${Number(req.price).toLocaleString()}` : "—"}
                      </span>
                      {req.reportImageUrl && (
                        <a href={req.reportImageUrl} target="_blank" rel="noopener noreferrer" className="block mt-1.5">
                          <img
                            src={req.reportImageUrl}
                            alt="Issue photo"
                            className="h-12 w-12 object-cover rounded-lg border border-zinc-200"
                          />
                        </a>
                      )}
                    </div>
                  </div>
                  <ApproveCareButton
                    careId={req.id}
                    targetStatus="SCHEDULED"
                    label="Approve"
                    doneLabel="Approved"
                    extraBody={{ approvedByRole: "AGENT" }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Collapsible Property Units Management Section (#1, #2, #3) ── */}
        <section className="pt-2">
          <PropertyUnitsTable
            initialUnits={units} 
            agentName={session?.user?.name ?? undefined}
            isCollapsible={true}
            defaultExpanded={false}
            title="Property Units Quick Table"
          />
        </section>
        </>
        )}

      </main>

      <BottomNav />
    </div>
  );
}
