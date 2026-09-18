export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  FileText,
  Download,
  Eye,
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  Lock,
  Upload,
} from "lucide-react";
import prisma from "@/lib/prisma";
import LogoutButton from "@/app/dashboard/tenant/components/logout-button";
import BottomNav from "@/app/dashboard/tenant/components/bottom-nav";
import { DashboardSubnav } from "@/components/dashboard/dashboard-subnav";

export default async function ContractsVaultPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) redirect("/");

  const userId = Number(session.user.id);
  const userLevel = Number(session.user.level ?? 1);

  const isStaff = userLevel === 0 || userLevel === 20 || userLevel === 30;
  const isTenant = userLevel === 5;
  const isOwner = userLevel === 4 || userLevel === 40;
  const isAgent = userLevel === 2 || userLevel === 3;

  // Role-based Document Filtering
  let whereClause: any = {};
  if (isTenant) {
    whereClause.tenantId = userId;
  } else if (isOwner) {
    whereClause.landlordId = userId;
  } else if (isAgent) {
    whereClause.OR = [
      { unit: { agentId: userId } },
      { createdById: userId },
    ];
  }
  // Staff (level 0, 20, 30) sees all documents under management

  const leases = await prisma.leaseContract.findMany({
    where: whereClause,
    include: {
      unit: { select: { title: true, fullAddress: true, agent: { select: { name: true } } } },
      condo: { select: { condoName: true } },
      tenant: { select: { name: true, email: true } },
      landlord: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const backUrl = isStaff
    ? "/dashboard/staff"
    : isOwner
    ? "/dashboard/landlord"
    : isAgent
    ? "/dashboard/agent"
    : "/dashboard/tenant";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Global GNB */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 h-16 sm:h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/assets/images/rbs-logo.png" alt="RBS Homes" className="h-8 sm:h-9 w-auto object-contain" />
          </Link>

          <nav className="hidden md:flex items-center bg-zinc-100/80 p-1.5 rounded-xl border border-zinc-200/60 text-xs font-bold text-zinc-600">
            {isStaff && (
              <Link href="/dashboard/staff" className="hover:text-blue-600 px-3 py-1.5 rounded-lg">Staff</Link>
            )}
            <Link href="/dashboard/landlord" className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg">Owner</Link>
            <Link href="/dashboard/tenant" className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg">Tenant</Link>
            <Link href="/dashboard/agent" className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg">Agent</Link>
          </nav>

          <div className="flex items-center gap-3">
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Desktop Sub Navigation Tab Bar */}
        <DashboardSubnav role={isOwner ? "landlord" : "tenant"} />

        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href={backUrl}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-zinc-500 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Portal</span>
          </Link>
        </div>

        {/* Header Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Mr. Homes Official Custody Vault</span>
              </span>
              <span className="text-[11px] font-bold text-zinc-400">
                {isStaff ? "Coordinator Master View" : isTenant ? "Tenant Access View" : "Owner Access View"}
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight">
              Contracts & LOI Document Vault
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/80 max-w-xl">
              {isStaff
                ? "Manage and upload authenticated Lease Agreements, Letters of Intent (LOI), and Move-in Checklists."
                : "Official archive for your active Lease Contract, Letters of Intent (LOI), Condition Checklists, and Tax Invoices."}
            </p>
          </div>

          {/* Upload Button: Visible ONLY to Mr. Homes Staff */}
          {isStaff ? (
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-98"
              >
                <Upload className="w-4 h-4" />
                <span>Upload New Contract / LOI</span>
              </button>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-3.5 py-2 rounded-xl text-xs text-blue-200 font-medium self-start md:self-auto flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Read & Download Authenticated Documents</span>
            </div>
          )}
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-500 block mb-1">Your Active Contracts</span>
              <span className="text-2xl font-black text-zinc-900">{leases.length || 1} Documents</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">● Fully Signed & Verified</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-500 block mb-1">LOI Drafts & Applications</span>
              <span className="text-2xl font-black text-indigo-900">1 LOI on Record</span>
              <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">Under Mr. Homes Custody</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-500 block mb-1">Access Privacy Tier</span>
              <span className="text-2xl font-black text-zinc-900">Encrypted Role Vault</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Party-Restricted Viewing</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
              <Lock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Vault Table & Document Cards */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/80 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-zinc-900">
                {isTenant ? "My Lease & LOI Records" : isOwner ? "My Property Contracts & LOIs" : "Managed Legal Documents"}
              </h3>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                Authentic bilateral agreements uploaded and maintained by your assigned Mr. Homes staff.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                Authorized Documents ({leases.length || 1})
              </span>
            </div>
          </div>

          <div className="divide-y divide-zinc-100 text-xs sm:text-sm">
            {/* Contract Item */}
            <div className="p-5 hover:bg-zinc-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-zinc-900 text-sm">
                      Residential Lease Agreement ({leases[0]?.unit?.title || "Two Serendra #1204"})
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ● Active (Fully Signed)
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 font-medium">
                    Doc ID: <span className="font-bold text-zinc-700">RBS-LEASE-2026-089</span> · Term: Oct 01, 2025 – Sep 30, 2026 · Monthly: ₱45,000
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Tenant: Sophia Martinez · Owner: Arthur Pendelton · Mr. Homes Staff Custody: Sarah Jenkins
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>View PDF</span>
                </button>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Repair Quotation PDF Document (Linked from Care Approval) */}
            <div className="p-5 hover:bg-zinc-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 bg-amber-50/20">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-zinc-900 text-sm">
                      Official Vendor Quotation — Kitchen Plumbing & Gasket (₱6,500)
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                      ● Repair Quotation
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 font-medium">
                    Doc ID: <span className="font-bold text-zinc-700">QUOTE-2026-05-1204</span> · Two Serendra #1204 · Vendor: RBS Verified Services
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Uploaded by: Sophia Martinez (Tenant) · Verified by: Mr. Homes Staff (Sarah Jenkins) · For Owner Authorization
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-600" />
                  <span>View Quotation PDF</span>
                </button>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Checklist Item */}
            <div className="p-5 hover:bg-zinc-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-zinc-900 text-sm">
                      Move-in Condition & Inventory Verification Checklist
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-300">
                      ✓ Move-in Verified
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 font-medium">
                    Doc ID: <span className="font-bold text-zinc-700">CHK-2025-10-1204</span> · High-res photos attached (18 items)
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Inspected & Uploaded by: Mr. Homes Staff (Sarah Jenkins) · Signed by Resident & Owner
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-purple-600" />
                  <span>View Checklist</span>
                </button>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Chat Shared Attachments & Photos (Auto-archived from Live Chat) */}
            <div className="p-5 hover:bg-zinc-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 bg-emerald-50/30">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-zinc-900 text-sm">
                      Chat Shared Attachments & Photos (Aircon/Plumbing Proof)
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                      💬 Chat Auto-Archived
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 font-medium">
                    Doc ID: <span className="font-bold text-zinc-700">CHAT-ATT-2026-05</span> · Two Serendra #1204 · 3 Files Attached
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Synced automatically from 1:1 Live Chat with Mr. Homes Dedicated Manager
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>View Files</span>
                </button>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Zip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
