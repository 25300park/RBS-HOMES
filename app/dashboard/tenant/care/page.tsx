export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Wrench,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { ContractStatus } from "@prisma/client";
import CareRequestForm from "./components/care-request-form";
import CareCompletionForm from "./components/care-completion-form";
import { getLandlordCareRequests } from "@/lib/landlord/get-landlord-care-requests";
import ApproveCareButton from "../../landlord/components/approve-care-button";
import LogoutButton from "../components/logout-button";
import BottomNav from "../components/bottom-nav";
import { DashboardSubnav } from "@/components/dashboard/dashboard-subnav";

const careStatusLabel: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "● Received", cls: "bg-amber-50 text-amber-700 border border-amber-200/80" },
  PENDING_OWNER_APPROVAL: { label: "● Awaiting Owner Approval", cls: "bg-blue-50 text-blue-700 border border-blue-200/80" },
  SCHEDULED: { label: "● Scheduled", cls: "bg-indigo-50 text-indigo-700 border border-indigo-200/80" },
  IN_PROGRESS: { label: "● In Progress", cls: "bg-purple-50 text-purple-700 border border-purple-200/80" },
  AWAITING_TENANT_CONFIRMATION: { label: "● Awaiting Your Confirmation", cls: "bg-amber-100 text-amber-900 border border-amber-300" },
  PENDING_STAFF_REVIEW: { label: "● Under Staff Review", cls: "bg-sky-50 text-sky-700 border border-sky-200/80" },
  COMPLETED: { label: "✓ Completed", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200/80" },
  CANCELLED: { label: "Cancelled", cls: "bg-zinc-100 text-zinc-600" },
};

export default async function CareRequestPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) redirect("/");

  const userId = Number(session.user.id);
  const level = Number(session.user.level ?? 1);

  // Landlord View
  if (level === 4 || level === 40) {
    const careRequests = await getLandlordCareRequests(userId);
    return (
      <div className="min-h-screen bg-[#f8fafc] text-zinc-900 font-sans">
        {/* Global GNB */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-2xs">
          <div className="max-w-7xl mx-auto px-6 h-[72px] sm:h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <img src="/assets/images/rbs-logo.png" alt="RBS Homes" className="h-9 sm:h-8 w-auto object-contain" />
            </Link>
            <nav className="flex md:hidden items-center bg-zinc-100/80 p-1.5 rounded-xl border border-zinc-200/60 text-xs font-bold text-zinc-600">
              <Link href="/dashboard/landlord" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg shadow-sm">Owner</Link>
              <Link href="/dashboard/tenant" className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg">Tenant</Link>
              <Link href="/dashboard/agent" className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg">Agent</Link>
              <Link href="/dashboard/buyer" className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg">Buyer</Link>
            </nav>
            <div className="flex items-center gap-3">
              <LogoutButton />
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-8 md:pb-24">
          <Link href="/dashboard/landlord" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-zinc-500 hover:text-blue-600 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Owner Portal</span>
          </Link>

          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-zinc-200/80">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900">Care & Repair Requests</h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">Tenant maintenance inquiries and repair quotations across your properties.</p>
          </div>

          {careRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-zinc-200">
              <Wrench className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-zinc-700">No active maintenance requests.</p>
              <p className="text-xs text-zinc-400 mt-1">When tenants submit repair requests, they will appear here for approval.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/80 divide-y divide-zinc-100 overflow-hidden">
              {careRequests.map((c) => {
                const cfg = careStatusLabel[c.status] || { label: c.status, cls: "bg-zinc-100 text-zinc-700" };
                return (
                  <div key={c.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="font-extrabold text-zinc-900 text-sm flex items-center gap-1.5">
                        {c.serviceType} · {c.contract.unit.title}
                        {c.isUrgent && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-red-100 text-red-700 border border-red-300">
                            🔴 Urgent
                          </span>
                        )}
                      </span>
                      <p className="text-xs text-zinc-500 mt-0.5">Preferred date: {new Date(c.preferredDate).toLocaleDateString("en-US")}</p>
                      {c.description && <p className="text-xs text-zinc-700 mt-1 bg-zinc-50 p-2 rounded-lg">{c.description}</p>}
                      {c.reportImageUrl && (
                        <a href={c.reportImageUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
                          <img
                            src={c.reportImageUrl}
                            alt="Issue photo"
                            className="h-14 w-14 object-cover rounded-lg border border-zinc-200"
                          />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] px-2.5 py-1 rounded-md font-bold ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                      {c.status === "PENDING_OWNER_APPROVAL" && <ApproveCareButton careId={c.id} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
        <BottomNav />
      </div>
    );
  }

  // Tenant View
  const activeLease = await prisma.leaseContract.findFirst({
    where: {
      tenantId: userId,
      status: { in: [ContractStatus.ACTIVE, ContractStatus.EXPIRING_SOON] },
    },
    include: {
      unit: { select: { id: true, title: true, fullAddress: true } },
      condo: { select: { id: true, condoName: true } },
      careRequests: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Global GNB */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 h-[72px] sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/assets/images/rbs-logo.png" alt="RBS Homes" className="h-9 sm:h-8 w-auto object-contain" />
          </Link>

          <nav className="flex md:hidden items-center bg-zinc-100/80 p-1.5 rounded-xl border border-zinc-200/60 text-xs font-bold text-zinc-600">
            <Link href="/dashboard/landlord" className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg">Owner</Link>
            <Link href="/dashboard/tenant" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg shadow-sm">Tenant</Link>
            <Link href="/dashboard/agent" className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg">Agent</Link>
            <Link href="/dashboard/buyer" className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg">Buyer</Link>
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/list?sellType=rent"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all"
            >
              <Building2 className="w-4 h-4" />
              <span>Browse Units</span>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
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

        {/* Title & Benefits Header */}
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>2 Complimentary Care Services Remaining</span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black tracking-tight">
              Request Property Care & Repairs
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/90 max-w-2xl leading-relaxed">
              Schedule aircon cleaning, plumbing inspections, electrical fixes, or emergency handyman visits for {activeLease?.unit?.title || "your rented condo"}.
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-1 gap-3 pt-3 border-t border-white/10 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>RBS Verified Technicians</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Guaranteed 24-hr Response</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Zero Deductible for Care Pass</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Component */}
        <CareRequestForm
          contractId={activeLease?.id || 1}
          unitTitle={activeLease?.unit?.title || "Two Serendra #1204"}
          condoName={activeLease?.condo?.condoName || "Two Serendra BGC"}
        />

        {/* Existing Care History List */}
        {activeLease?.careRequests && activeLease.careRequests.length > 0 && (
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-zinc-200/80 space-y-4">
            <h3 className="text-base font-extrabold text-zinc-900">Recent Service History</h3>
            <div className="divide-y divide-zinc-100">
              {activeLease.careRequests.map((req) => {
                const cfg = careStatusLabel[req.status] || { label: req.status, cls: "bg-zinc-100 text-zinc-600" };
                return (
                  <div key={req.id} className="py-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="font-extrabold text-zinc-900 text-xs sm:text-sm block">{req.serviceType} Service</span>
                        <span className="text-[11px] text-zinc-500 font-medium">Scheduled for {new Date(req.preferredDate).toLocaleDateString("en-US")}</span>
                      </div>
                      <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-md ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </div>
                    {req.status === "AWAITING_TENANT_CONFIRMATION" && (
                      <>
                        {req.staffReviewNote && (
                          <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200/60 leading-relaxed">
                            Rejection reason: {req.staffReviewNote}
                          </p>
                        )}
                        <CareCompletionForm careId={req.id} />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
