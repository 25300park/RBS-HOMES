export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import {
  Building2,
  Users,
  Wrench,
  Truck,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  MessageSquare,
  AlertTriangle,
  Plus,
  RefreshCw,
  Layers,
  Calendar,
  DollarSign,
} from "lucide-react";
import prisma from "@/lib/prisma";
import LogoutButton from "@/app/dashboard/tenant/components/logout-button";
import BottomNav from "@/app/dashboard/tenant/components/bottom-nav";
import { ConciergeMessageWidget } from "@/components/dashboard/concierge-message-widget";
import RoleAccessPlaceholder from "@/components/dashboard/role-access-placeholder";
import { DashboardSubnav } from "@/components/dashboard/dashboard-subnav";
import PropertyUnitsTable from "@/app/dashboard/agent/components/property-units-table";
import StaffPortfolioTable, { ManagedPortfolioItem } from "./components/staff-portfolio-table";
import StaffManagement from "./components/staff-management";

function getUserRoleInfo(level: number) {
  if (level === 0 || level === 20 || level === 30) {
    return { name: "Mr. Homes Staff", url: "/dashboard/staff" };
  }
  if (level === 2 || level === 3) {
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

export default async function StaffDashboardPage() {
  const session: any = await getServerSession(authOptions as any);
  const userLevel = Number(session?.user?.level ?? 1);
  const currentUserId = session?.user?.id ? Number(session.user.id) : 177;
  const isStaff = userLevel === 0 || userLevel === 20 || userLevel === 30;
  const isSuperAdmin = Boolean(session?.user?.isSuperAdmin);
  const userRoleInfo = getUserRoleInfo(userLevel);

  const staffName = session?.user?.name || "Grace (Senior Dedicated Manager)";

  const unitWhere = isSuperAdmin
    ? {}
    : {
        OR: [
          { agentId: currentUserId },
          { adminId: currentUserId },
        ],
      };

  // 1번: leaseContract/careServiceRequest 쿼리용 스코프 — unitWhere를 관계 경유로 재사용
  const leaseUnitScope = { unit: unitWhere };
  const careContractScope = { contract: { unit: unitWhere } };
  const ACTIVE_CARE_STATUSES = [
    "PENDING",
    "PENDING_OWNER_APPROVAL",
    "SCHEDULED",
    "IN_PROGRESS",
    "AWAITING_TENANT_CONFIRMATION",
  ] as const;

  // 총괄매니저 전용: Agent/Broker → Staff 승격 대상 목록
  const promotionCandidates = isSuperAdmin
    ? await prisma.user.findMany({
        where: { level: { in: [2, 3] } },
        select: { id: true, name: true, email: true, level: true },
        orderBy: { name: "asc" },
      })
    : [];

  // 1. Fetch Units uploaded or managed by staff (Same as Agent) — 총괄매니저는 전체 열람
  let unitsRaw = await prisma.unit.findMany({
    where: unitWhere,
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

  // Fallback: If 0 units, load top inventory for staff management
  if (unitsRaw.length === 0) {
    unitsRaw = await prisma.unit.findMany({
      take: 5,
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

  // 2. Multi-Tenant & Multi-Landlord Managed Portfolio Items — 실제 LeaseContract 조회로 대체
  const activeLeases = await prisma.leaseContract.findMany({
    where: { status: "ACTIVE", ...leaseUnitScope },
    include: {
      unit: { include: { condo: true, loiDocuments: true } },
      tenant: true,
      landlord: true,
      careRequests: true,
      paymentSchedules: true,
      contractUpload: true,
    },
    orderBy: { startDate: "desc" },
  });

  const formatContractDate = (d: Date) =>
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;

  const managedPortfolioItems: ManagedPortfolioItem[] = activeLeases.map((lease) => {
    const latestPayment = [...lease.paymentSchedules].sort(
      (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    )[0];

    return {
      id: String(lease.id),
      unitTitle: lease.unit.title,
      condoName: lease.unit.condo?.condoName ?? "—",
      unitNumber: "—", // Unit 모델에 전용 필드 없음 — 가짜 값 생성 금지
      tenantName: lease.tenant?.name ?? "—",
      tenantPhone: lease.tenant?.phone ?? "—",
      landlordName: lease.landlord?.name ?? "—",
      landlordPhone: lease.landlord?.phone ?? "—",
      monthlyRent: Number(lease.monthlyRent),
      rentPaymentStatus: latestPayment ? latestPayment.status : "—",
      duesStatus: "—", // 관리비(dues) 모델 자체가 스키마에 없음 — 계산 시도하지 않음
      contractPeriod: `${formatContractDate(lease.startDate)} ~ ${formatContractDate(lease.endDate)}`,
      activeCareCount: lease.careRequests.filter((c) =>
        (ACTIVE_CARE_STATUSES as readonly string[]).includes(c.status)
      ).length,
      hasContractDoc: !!lease.contractUpload,
      hasLoiDoc: lease.unit.loiDocuments.length > 0,
    };
  });

  // 3. Metrics 카드 — Care & Repair Queue count, Monthly Rent Roll sum (mock 제거)
  const activeCareRequestsCount = await prisma.careServiceRequest.count({
    where: {
      status: { in: [...ACTIVE_CARE_STATUSES] },
      ...careContractScope,
    },
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const monthlyRentRollAgg = await prisma.paymentSchedule.aggregate({
    _sum: { amountDue: true },
    where: {
      status: "PAID",
      dueDate: { gte: monthStart, lte: monthEnd },
      contract: leaseUnitScope,
    },
  });
  const monthlyRentRoll = Number(monthlyRentRollAgg._sum.amountDue ?? 0);

  // 4. SECTION 2 Action Queue — 실제 CareServiceRequest 조회로 대체 (Tax OR 카드는 대응 모델 없어 완전 삭제)
  const actionQueueRequests = await prisma.careServiceRequest.findMany({
    where: {
      status: { in: ["PENDING", "PENDING_OWNER_APPROVAL"] },
      ...careContractScope,
    },
    include: {
      contract: {
        include: { unit: true, tenant: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Global GNB */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 h-16 sm:h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/assets/images/rbs-logo.png" alt="RBS Homes" className="h-9 sm:h-8 w-auto object-contain" />
          </Link>

          <nav className="flex md:hidden items-center bg-zinc-100/80 p-1.5 rounded-xl border border-zinc-200/60 text-xs font-bold text-zinc-600">
            <Link href="/dashboard/staff" className="bg-blue-600 text-white px-3.5 py-1.5 rounded-lg shadow-sm">Staff</Link>
            <Link href="/dashboard/landlord" className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg">Owner</Link>
            <Link href="/dashboard/tenant" className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg">Tenant</Link>
            <Link href="/dashboard/agent" className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg">Agent</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/contracts"
              className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Contracts Vault</span>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-8 lg:px-6 sm:px-4 py-8 space-y-8 pb-8 md:pb-24">
        {!isStaff ? (
          <RoleAccessPlaceholder
            targetRole="staff"
            userRoleName={userRoleInfo.name}
            activeDashboardUrl={userRoleInfo.url}
          />
        ) : (
        <>
        {/* Desktop Sub Navigation Tab Bar */}
        <DashboardSubnav role="staff" />

        {/* Top Staff Master Operations Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold px-3 py-1 rounded-full">
                Mr. Homes Property Operations & Listing Management
              </span>
            </div>
            <h1 className="text-3xl sm:text-xl font-black tracking-tight mt-2">
              Welcome, {staffName}
            </h1>
            <p className="text-sm sm:text-xs text-blue-200/90 mt-1 max-w-2xl">
              Comprehensive operational hub for multi-tenant lease oversight, maintenance dispatch, legal vault documentation, and direct property listing inventory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href="#action-queue"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm sm:text-xs font-black px-4 py-2.5 rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-slate-950" />
              <span>Tenant Inquiries</span>
            </a>
            <Link
              href="/dashboard/contracts"
              className="bg-white/15 hover:bg-white/25 border border-white/30 hover:border-white/50 text-white text-sm sm:text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 active:scale-95 group"
            >
              <FileText className="w-4 h-4 text-blue-300 group-hover:scale-110 transition-transform" />
              <span>Contracts Vault</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <Link
              href="/account/unit/registration/step-one"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm sm:text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Property</span>
            </Link>
          </div>
        </div>

        {/* 4 Key Operations Metrics Grid */}
        <div className="grid grid-cols-4 lg:grid-cols-2 sm:grid-cols-1 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-500 block mb-1">Managed Leases</span>
              <span className="text-2xl font-black text-zinc-900">{managedPortfolioItems.length} Units</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">● Multi-Tenant Portfolio</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-500 block mb-1">Care & Repair Queue</span>
              <span className="text-2xl font-black text-amber-600">{activeCareRequestsCount} Active</span>
              <span className="text-[10px] text-amber-700 font-bold block mt-0.5">Across Managed Units</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
              <Wrench className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-500 block mb-1">My Uploaded Listings</span>
              <span className="text-2xl font-black text-indigo-900">{units.length} Properties</span>
              <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">Staff Direct Broker Inventory</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-500 block mb-1">Monthly Rent Roll</span>
              <span className="text-2xl font-black text-purple-900">₱{monthlyRentRoll.toLocaleString()}</span>
              <span className="text-[10px] text-purple-600 font-bold block mt-0.5">Paid This Month</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* ── SECTION 1: Multi-Tenant & Multi-Landlord Portfolio Table ── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-lg font-black text-zinc-900">
                1. Multi-Tenant & Landlord Operations Hub
              </h2>
              <p className="text-xs text-zinc-500">
                Manage contracts, rent collection, repair tickets, and document uploads for all assigned properties
              </p>
            </div>
          </div>

          <StaffPortfolioTable items={managedPortfolioItems} />
        </section>

        {/* ── SUPER ADMIN ONLY: Agent/Broker → Staff Promotion ── */}
        {isSuperAdmin && (
          <section className="space-y-3">
            <StaffManagement candidates={promotionCandidates} />
          </section>
        )}

        {/* ── SECTION 2: 1st-Tier Action Queue & Coordinator Concierge ── */}
        <div id="action-queue" className="grid grid-cols-12 lg:grid-cols-1 gap-6 items-start scroll-mt-24">
          {/* Left Column (7 cols): Active Action Queue */}
          <div className="col-span-7 lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-zinc-200/80 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900">2. 1st-Tier Tenant Action Queue</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Direct requests received from residents requiring coordinator action</p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-amber-100 text-amber-800">
                  {actionQueueRequests.length} Actions Required
                </span>
              </div>

              {actionQueueRequests.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-400">
                  No pending care requests requiring action right now.
                </div>
              ) : (
                actionQueueRequests.map((req) => (
                  <div key={req.id} className="border border-amber-200/80 bg-amber-50/40 rounded-2xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-2xs shrink-0">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-zinc-900 text-xs sm:text-sm block">
                            {req.contract.unit.title} · {req.serviceType}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-medium">
                            Tenant: {req.contract.tenant?.name ?? "—"} · Estimated Cost: {req.price ? `₱${Number(req.price).toLocaleString()}` : "—"}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 whitespace-nowrap">
                        {req.status === "PENDING_OWNER_APPROVAL" ? "Awaiting Owner Auth" : "Awaiting Review"}
                      </span>
                    </div>

                    {req.description && (
                      <p className="text-xs text-zinc-700 bg-white/90 p-2.5 rounded-xl border border-zinc-200/60 leading-relaxed">
                        {req.description}
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Link
                        href="/dashboard/contracts"
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-white transition-colors"
                      >
                        View Quotation in Vault
                      </Link>
                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                      >
                        <span>Forward to Owner for Authorization →</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Mr. Homes Dedicated Manager Desk */}
          <div className="col-span-5 lg:col-span-1 space-y-6">
            <ConciergeMessageWidget
              userRole="agent"
              managerName={staffName}
              managerRole="Mr. Homes Senior Dedicated Manager"
            />
          </div>
        </div>

        {/* ── SECTION 3: My Uploaded Property Inventory (Same as Agent / Broker) ── */}
        <section className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-lg font-black text-zinc-900">
                3. Staff Uploaded Property Inventory & Listings
              </h2>
              <p className="text-xs text-zinc-500">
                Directly manage and update properties uploaded by you, change statuses, and track viewing inquiries.
              </p>
            </div>

            <Link
              href="/account/unit/registration/step-one"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm self-start sm:self-auto transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Listing</span>
            </Link>
          </div>

          <PropertyUnitsTable initialUnits={units as any} />
        </section>

        </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
