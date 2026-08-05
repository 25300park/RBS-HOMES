export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { ContractStatus } from "@prisma/client";
import ReceiptUploadButton from "./components/receipt-upload-button";
import ConfirmCareCompletionButton from "./components/confirm-care-completion-button";
import BottomNav from "./components/bottom-nav";
import LogoutButton from "./components/logout-button";

const careStatusLabel: Record<string, { text: string; cls: string }> = {
  PENDING: { text: "Requested", cls: "bg-[#0E5246]/10 text-[#0E5246]" },
  PENDING_OWNER_APPROVAL: { text: "Awaiting Owner Approval", cls: "bg-[#0E5246]/10 text-[#0E5246]" },
  SCHEDULED: { text: "Scheduled", cls: "bg-[#0E5246]/10 text-[#0E5246]" },
  IN_PROGRESS: { text: "In Progress", cls: "bg-[#0E5246]/15 text-[#0B4339]" },
  AWAITING_TENANT_CONFIRMATION: { text: "Please Confirm", cls: "bg-amber-100 text-amber-700 animate-pulse" },
  COMPLETED: { text: "Completed", cls: "bg-zinc-100 text-zinc-500" },
  CANCELLED: { text: "Cancelled", cls: "bg-red-100 text-red-600" },
};

const careServiceTypeLabel: Record<string, string> = {
  AIRCON: "Aircon Service",
  CLEANING: "Cleaning",
  REPAIR: "Repair",
  HANDYMAN: "Handyman",
};

export default async function TenantDashboardPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) redirect("/");

  const userId = Number(session.user.id);

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
      unit: { select: { id: true, title: true, fullAddress: true, condoId: true } },
      condo: { select: { id: true, condoName: true } },
    },
    orderBy: { startDate: "desc" },
  });

  if (!activeLease) {
    return (
      <div className="bg-zinc-50 min-h-screen text-zinc-800 pb-20 md:pb-28">
        <main className="max-w-[1140px] mx-auto px-4 py-10 space-y-6">
          <WelcomeCard userName={session.user.name} />
          <EmptyState message="You don't have an active lease yet. Please contact us." />
        </main>
        <BottomNav />
      </div>
    );
  }

  const leaseId = activeLease.id;
  const condoId = activeLease.unit.condoId ?? activeLease.condoId;

  const [thisMonthPayments, careRequests, communityPosts] = await Promise.all([
    prisma.paymentSchedule.findMany({
      where: { contractId: leaseId, dueDate: { gte: startOfMonth, lte: endOfMonth } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.careServiceRequest.findMany({
      where: {
        contractId: leaseId,
        status: {
          in: [
            "PENDING",
            "PENDING_OWNER_APPROVAL",
            "SCHEDULED",
            "IN_PROGRESS",
            "AWAITING_TENANT_CONFIRMATION",
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    condoId
      ? prisma.communityPost.findMany({
          where: { condoId },
          include: { author: { select: { name: true } } },
          orderBy: [{ isNotice: "desc" }, { createdAt: "desc" }],
          take: 3,
        })
      : Promise.resolve([]),
  ]);

  const isExpiringSoon = new Date(activeLease.endDate) <= sixtyDaysLater;
  const thisMonthPayment = thisMonthPayments[0] ?? null;
  const communityHref = condoId
    ? `/dashboard/tenant/community?condoId=${condoId}`
    : "/dashboard/tenant#community";

  return (
    <div className="bg-zinc-50 min-h-screen text-zinc-800 pb-20 md:pb-28">
      <main className="max-w-[1140px] mx-auto px-4 py-6 sm:py-8 space-y-6">
        <WelcomeCard userName={session.user.name} />

        {/* Lease expiring banner */}
        {isExpiringSoon && (
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 sm:p-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-zinc-900 text-sm">
                Your lease is expiring soon. Contact us.
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Lease end date: {new Date(activeLease.endDate).toLocaleDateString("en-US")}
              </p>
            </div>
          </div>
        )}

        {/* Row 1: Lease + Payments */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-6">
          {/* Lease summary */}
          <section id="lease" className="bg-white border border-zinc-200 shadow-2xs rounded-xl p-5 sm:p-6 space-y-4">
            <div className="border-b border-zinc-100 pb-3">
              <span className="text-xs font-bold text-[#0E5246] uppercase tracking-widest">Lease Summary</span>
              <h2 className="text-base sm:text-lg font-extrabold text-zinc-900">Active Lease</h2>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-900 truncate">{activeLease.unit.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 truncate">{activeLease.unit.fullAddress}</p>
                </div>
                <LeaseStatusBadge status={activeLease.status} />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Lease Period</p>
                  <p className="text-sm font-medium text-zinc-900">
                    {new Date(activeLease.startDate).toLocaleDateString("en-US")}
                    {" – "}
                    {new Date(activeLease.endDate).toLocaleDateString("en-US")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Monthly Rent</p>
                  <p className="text-sm font-bold text-[#0E5246]">
                    ₱ {Number(activeLease.monthlyRent).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* This month payment */}
          <section id="payments" className="bg-white border border-zinc-200 shadow-2xs rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <span className="text-xs font-bold text-[#0E5246] uppercase tracking-widest">Payments</span>
                <h2 className="text-base sm:text-lg font-extrabold text-zinc-900">{`This Month's Payment`}</h2>
              </div>
              <Link
                href="/dashboard/tenant/payments"
                className="text-xs font-bold text-[#0E5246] hover:underline flex items-center gap-1 shrink-0"
              >
                View All →
              </Link>
            </div>
            {!thisMonthPayment ? (
              <EmptyState message="No payment scheduled for this month." />
            ) : (
              <ThisMonthPaymentCard payment={thisMonthPayment} />
            )}
          </section>
        </div>

        {/* Row 2: Care + Community */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-6">
          {/* Care service */}
          <section id="care" className="bg-white border border-zinc-200 shadow-2xs rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <span className="text-xs font-bold text-[#0E5246] uppercase tracking-widest">Care Service</span>
                <h2 className="text-base sm:text-lg font-extrabold text-zinc-900">Maintenance Requests</h2>
              </div>
              <Link
                href="/dashboard/tenant/care"
                className="bg-[#0E5246] hover:bg-[#0B4339] text-white font-extrabold px-4 py-2 rounded-lg text-xs shadow-2xs transition-all"
              >
                + Request
              </Link>
            </div>
            {careRequests.length === 0 ? (
              <EmptyState message="No active care requests." />
            ) : (
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg divide-y divide-zinc-100 overflow-hidden">
                {careRequests.map((c) => {
                  const cfg = careStatusLabel[c.status] ?? { text: c.status, cls: "bg-zinc-100 text-zinc-500" };
                  return (
                    <div key={c.id} className="flex items-center justify-between px-4 py-3 gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-zinc-900">
                          {careServiceTypeLabel[c.serviceType] ?? c.serviceType}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Preferred date: {new Date(c.preferredDate).toLocaleDateString("en-US")}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>
                          {cfg.text}
                        </span>
                        {c.status === "AWAITING_TENANT_CONFIRMATION" && (
                          <ConfirmCareCompletionButton careId={c.id} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Community board */}
          <section id="community" className="bg-white border border-zinc-200 shadow-2xs rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <span className="text-xs font-bold text-[#0E5246] uppercase tracking-widest">Community</span>
                <h2 className="text-base sm:text-lg font-extrabold text-zinc-900">Community Board</h2>
              </div>
              <Link
                href={communityHref}
                className="text-xs font-bold text-[#0E5246] hover:underline flex items-center gap-1 shrink-0"
              >
                View All →
              </Link>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-sm text-zinc-500">
              {communityPosts.length === 0
                ? "No posts yet."
                : `${communityPosts.length} posts`}
            </div>
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

// ── Welcome card ────────────────────────────────────────────
function WelcomeCard({ userName }: { userName?: string | null }) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl border border-zinc-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
          Hello, {userName ?? "Tenant"}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Manage your active lease and care requests.
        </p>
      </div>
      <div className="flex items-center justify-between sm:justify-end space-x-2">
        <span className="bg-[#0E5246]/10 text-[#0E5246] text-xs font-bold px-3 py-1.5 rounded-full border border-[#0E5246]/20">
          Tenant Level 5
        </span>
        <LogoutButton />
      </div>
    </div>
  );
}

// ── Lease status badge ────────────────────────────────────
function LeaseStatusBadge({ status }: { status: ContractStatus }) {
  const map: Record<string, { text: string; cls: string }> = {
    ACTIVE: { text: "Active", cls: "bg-emerald-100 text-emerald-700" },
    EXPIRING_SOON: { text: "Expiring Soon", cls: "bg-amber-100 text-amber-700" },
    EXPIRED: { text: "Expired", cls: "bg-red-100 text-red-600" },
    TERMINATED: { text: "Terminated", cls: "bg-red-100 text-red-600" },
  };
  const cfg = map[status] ?? { text: status, cls: "bg-zinc-100 text-zinc-500" };
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${cfg.cls}`}>
      {cfg.text}
    </span>
  );
}

// ── This month payment card ──────────────────────────────
function ThisMonthPaymentCard({ payment }: { payment: any }) {
  const due = new Date(payment.dueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
  const amount = `₱ ${Number(payment.amountDue).toLocaleString()}`;

  if (payment.status === "PAID") {
    return (
      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-emerald-700">Payment Confirmed ✓</p>
          <p className="text-sm text-zinc-600 mt-0.5">{due} · {amount}</p>
        </div>
      </div>
    );
  }

  if (payment.status === "AWAITING_APPROVAL") {
    return (
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <Clock className="w-6 h-6 text-blue-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-blue-700">Receipt Submitted - Pending Approval</p>
          <p className="text-sm text-zinc-500 mt-0.5">{due} · {amount}</p>
        </div>
      </div>
    );
  }

  if (payment.status === "OVERDUE") {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-red-700">OVERDUE - Please contact us immediately</p>
          <p className="text-sm text-zinc-900 mt-0.5">{due} · {amount}</p>
        </div>
        <ReceiptUploadButton paymentId={payment.id} />
      </div>
    );
  }

  // PENDING
  return (
    <div className="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
      <div>
        <p className="font-semibold text-amber-700">Payment Due</p>
        <p className="text-sm text-zinc-900 mt-0.5">{due} · {amount}</p>
      </div>
      <ReceiptUploadButton paymentId={payment.id} />
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 text-center text-sm text-zinc-500">
      {message}
    </div>
  );
}
