export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Wallet,
  Wrench,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
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
  PENDING: { text: "Requested", cls: "bg-[#F59E0B]/15 text-[#F59E0B]" },
  PENDING_OWNER_APPROVAL: { text: "Awaiting Owner Approval", cls: "bg-orange-500/15 text-orange-400" },
  SCHEDULED: { text: "Scheduled", cls: "bg-[#3B82F6]/15 text-[#3B82F6]" },
  IN_PROGRESS: { text: "In Progress", cls: "bg-purple-500/15 text-purple-400" },
  AWAITING_TENANT_CONFIRMATION: { text: "Please Confirm", cls: "bg-[#10B981]/15 text-[#10B981] animate-pulse" },
  COMPLETED: { text: "Completed", cls: "bg-[#334155] text-[#94A3B8]" },
  CANCELLED: { text: "Cancelled", cls: "bg-[#EF4444]/15 text-[#EF4444]" },
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

  // Current active (or expiring soon) lease
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
      <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC]">
        <div className="max-w-[640px] mx-auto px-4 py-10 pb-24">
          <Header userName={session.user.name} />
          <div className="mt-6">
            <EmptyState message="You don't have an active lease yet. Please contact us." />
          </div>
        </div>
        <BottomNav communityHref="/dashboard/tenant#community" />
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
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC]">
      <div className="max-w-[640px] mx-auto px-4 py-6 pb-24 space-y-6">
        <Header userName={session.user.name} />

        {/* Lease expiring banner */}
        {isExpiringSoon && (
          <div className="flex items-start gap-3 bg-[#F59E0B]/10 border border-[#F59E0B]/40 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#F59E0B] text-sm">
                Your lease is expiring soon. Contact us.
              </p>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Lease end date: {new Date(activeLease.endDate).toLocaleDateString("en-US")}
              </p>
            </div>
          </div>
        )}

        {/* Lease summary */}
        <section>
          <SectionTitle>Lease Summary</SectionTitle>
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-[#F8FAFC] truncate">{activeLease.unit.title}</p>
                <p className="text-xs text-[#94A3B8] mt-0.5 truncate">{activeLease.unit.fullAddress}</p>
              </div>
              <LeaseStatusBadge status={activeLease.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs text-[#94A3B8] mb-1">Lease Period</p>
                <p className="text-sm font-medium text-[#F8FAFC]">
                  {new Date(activeLease.startDate).toLocaleDateString("en-US")}
                  {" – "}
                  {new Date(activeLease.endDate).toLocaleDateString("en-US")}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#94A3B8] mb-1">Monthly Rent</p>
                <p className="text-sm font-bold text-[#3B82F6]">
                  ₱ {Number(activeLease.monthlyRent).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* This month payment */}
        <section id="payments">
          <SectionTitle>{`This Month's Payment`}</SectionTitle>
          {!thisMonthPayment ? (
            <EmptyState message="No payment scheduled for this month." />
          ) : (
            <ThisMonthPaymentCard payment={thisMonthPayment} />
          )}
        </section>

        {/* Payment history summary */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <SectionTitle noMargin>Payment History</SectionTitle>
            <Link
              href="/dashboard/tenant/payments"
              className="flex items-center gap-1 text-sm text-[#3B82F6] hover:text-[#3B82F6]/80 font-medium transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 text-sm text-[#94A3B8]">
            View your full payment history.
          </div>
        </section>

        {/* Care service */}
        <section id="care">
          <div className="flex items-center justify-between mb-3">
            <SectionTitle noMargin>Care Service</SectionTitle>
            <Link
              href="/dashboard/tenant/care"
              className="flex items-center justify-center gap-1.5 min-h-[44px] px-4 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Request Care Service
            </Link>
          </div>

          {careRequests.length === 0 ? (
            <EmptyState message="No active care requests." />
          ) : (
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl divide-y divide-[#334155] overflow-hidden">
              {careRequests.map((c) => {
                const cfg = careStatusLabel[c.status] ?? { text: c.status, cls: "bg-[#334155] text-[#94A3B8]" };
                return (
                  <div key={c.id} className="flex items-center justify-between px-4 py-3 gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-[#F8FAFC]">
                        {careServiceTypeLabel[c.serviceType] ?? c.serviceType}
                      </p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">
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
        <section id="community">
          <div className="flex items-center justify-between mb-3">
            <SectionTitle noMargin>Community Board</SectionTitle>
            <Link
              href={communityHref}
              className="flex items-center gap-1 text-sm text-[#3B82F6] hover:text-[#3B82F6]/80 font-medium transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {communityPosts.length === 0 ? (
            <EmptyState message="No posts yet." />
          ) : (
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl divide-y divide-[#334155] overflow-hidden">
              {communityPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {post.isNotice && (
                        <span className="text-xs px-1.5 py-0.5 bg-[#3B82F6]/15 text-[#3B82F6] rounded font-medium flex-shrink-0">
                          Notice
                        </span>
                      )}
                      <p className="font-medium text-sm text-[#F8FAFC] truncate">{post.title}</p>
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{post.author.name}</p>
                  </div>
                  <span className="text-xs text-[#94A3B8] flex-shrink-0">
                    {new Date(post.createdAt).toLocaleDateString("en-US")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <BottomNav communityHref={communityHref} />
    </div>
  );
}

// ── Header ────────────────────────────────────────────────
function Header({ userName }: { userName?: string | null }) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-bold text-[#F8FAFC]">My Dashboard</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#F8FAFC] font-medium truncate max-w-[120px]">
          {userName ?? "Tenant"}
        </span>
        <LogoutButton />
      </div>
    </div>
  );
}

// ── Section title ─────────────────────────────────────────
function SectionTitle({ children, noMargin }: { children: React.ReactNode; noMargin?: boolean }) {
  return (
    <h2 className={`text-sm font-bold text-[#F8FAFC] uppercase tracking-wide ${noMargin ? "" : "mb-3"}`}>
      {children}
    </h2>
  );
}

// ── Lease status badge ────────────────────────────────────
function LeaseStatusBadge({ status }: { status: ContractStatus }) {
  const map: Record<string, { text: string; cls: string }> = {
    ACTIVE: { text: "Active", cls: "bg-[#10B981]/15 text-[#10B981]" },
    EXPIRING_SOON: { text: "Expiring Soon", cls: "bg-[#F59E0B]/15 text-[#F59E0B]" },
    EXPIRED: { text: "Expired", cls: "bg-[#EF4444]/15 text-[#EF4444]" },
    TERMINATED: { text: "Terminated", cls: "bg-[#EF4444]/15 text-[#EF4444]" },
  };
  const cfg = map[status] ?? { text: status, cls: "bg-[#334155] text-[#94A3B8]" };
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${cfg.cls}`}>
      {cfg.text}
    </span>
  );
}

// ── This month payment card (status-based UI) ────────────
function ThisMonthPaymentCard({ payment }: { payment: any }) {
  const due = new Date(payment.dueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
  const amount = `₱ ${Number(payment.amountDue).toLocaleString()}`;

  if (payment.status === "PAID") {
    return (
      <div className="flex items-center gap-3 bg-[#10B981]/10 border border-[#10B981]/40 rounded-xl p-4">
        <CheckCircle2 className="w-6 h-6 text-[#10B981] flex-shrink-0" />
        <div>
          <p className="font-semibold text-[#10B981]">Payment Confirmed ✓</p>
          <p className="text-sm text-[#F8FAFC] mt-0.5">
            {due} · {amount}
          </p>
        </div>
      </div>
    );
  }

  if (payment.status === "AWAITING_APPROVAL") {
    return (
      <div className="flex items-center gap-3 bg-[#3B82F6]/10 border border-[#3B82F6]/40 rounded-xl p-4">
        <Clock className="w-6 h-6 text-[#3B82F6] flex-shrink-0" />
        <div>
          <p className="font-semibold text-[#3B82F6]">Receipt Submitted - Pending Approval</p>
          <p className="text-sm text-[#94A3B8] mt-0.5">
            {due} · {amount}
          </p>
        </div>
      </div>
    );
  }

  if (payment.status === "OVERDUE") {
    return (
      <div className="flex items-center gap-3 bg-[#EF4444]/10 border border-[#EF4444]/50 rounded-xl p-4">
        <XCircle className="w-6 h-6 text-[#EF4444] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#EF4444]">OVERDUE - Please contact us immediately</p>
          <p className="text-sm text-[#F8FAFC] mt-0.5">
            {due} · {amount}
          </p>
        </div>
        <ReceiptUploadButton paymentId={payment.id} />
      </div>
    );
  }

  // PENDING
  return (
    <div className="flex items-center justify-between gap-4 bg-[#F59E0B]/10 border border-[#F59E0B]/40 rounded-xl p-4">
      <div>
        <p className="font-semibold text-[#F59E0B]">Payment Due</p>
        <p className="text-sm text-[#F8FAFC] mt-0.5">
          {due} · {amount}
        </p>
      </div>
      <ReceiptUploadButton paymentId={payment.id} />
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-20 border border-dashed border-[#334155] rounded-xl text-sm text-[#94A3B8]">
      {message}
    </div>
  );
}
