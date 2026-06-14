export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Building2, Banknote, Wrench, AlertTriangle, ArrowRight } from "lucide-react";
import { ContractStatus, PaymentStatus } from "@prisma/client";
import ApproveCareButton from "./components/approve-care-button";

const paymentStatusConfig: Record<PaymentStatus, { text: string; cls: string }> = {
  PENDING: { text: "Pending", cls: "bg-gray-100 text-gray-600" },
  AWAITING_APPROVAL: { text: "Awaiting Approval", cls: "bg-orange-100 text-orange-600" },
  PAID: { text: "Paid", cls: "bg-green-100 text-green-700" },
  OVERDUE: { text: "Overdue", cls: "bg-red-100 text-red-600" },
};

// PENDING 상태의 계약 목록 배지는 "Payment Due"로 표시
const leaseBadgeLabel: Record<PaymentStatus, string> = {
  ...Object.fromEntries(
    Object.entries(paymentStatusConfig).map(([k, v]) => [k, v.text])
  ),
  PENDING: "Payment Due",
} as Record<PaymentStatus, string>;

const careStatusLabel: Record<string, string> = {
  PENDING: "Received",
  PENDING_OWNER_APPROVAL: "Awaiting Your Approval",
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  AWAITING_TENANT_CONFIRMATION: "Awaiting Tenant Confirmation",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default async function LandlordDashboardPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) redirect("/login");

  const userId = Number(session.user.id);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const sixtyDaysLater = new Date(now);
  sixtyDaysLater.setDate(now.getDate() + 60);

  const leases = await prisma.leaseContract.findMany({
    where: {
      landlordId: userId,
      status: { in: [ContractStatus.ACTIVE, ContractStatus.EXPIRING_SOON] },
    },
    include: {
      unit: { select: { id: true, title: true, fullAddress: true } },
      tenant: { select: { id: true, name: true, phone: true } },
      paymentSchedules: {
        where: { dueDate: { gte: startOfMonth, lte: endOfMonth } },
        orderBy: { dueDate: "asc" },
        take: 1,
      },
      careRequests: {
        where: {
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
        take: 3,
      },
    },
    orderBy: { endDate: "asc" },
  });

  const expiringLeases = leases.filter((l) => new Date(l.endDate) <= sixtyDaysLater);

  const allCareRequests = leases.flatMap((l) =>
    l.careRequests.map((c) => ({ ...c, unit: l.unit }))
  );

  const paymentSummary = leases.reduce(
    (acc, l) => {
      const p = l.paymentSchedules[0];
      if (p) acc[p.status] = (acc[p.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="max-w-[1140px] mx-auto px-4 py-10 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Hello, {session.user.name ?? "Landlord"}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Check your units and lease status.</p>
      </div>

      {/* 만료 60일 이내 경고 배너 */}
      {expiringLeases.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-700 text-sm">
              Lease Expiring Soon — {expiringLeases.length}
            </p>
            <ul className="mt-1 space-y-0.5">
              {expiringLeases.map((l) => (
                <li key={l.id} className="text-xs text-amber-600">
                  {l.unit.title} · Expires:{" "}
                  {new Date(l.endDate).toLocaleDateString("en-US")} (within 60 days)
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 납부 현황 요약 */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Banknote className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">This Month Payment Status</h2>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-2 gap-3">
          {(["PENDING", "AWAITING_APPROVAL", "PAID", "OVERDUE"] as PaymentStatus[]).map((s) => {
            const cfg = paymentStatusConfig[s];
            return (
              <div key={s} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
                <p className="text-xs text-gray-500">{cfg.text}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{paymentSummary[s] ?? 0}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 활성 계약 목록 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Active Leases</h2>
          </div>
          <Link
            href="/api/pms/leases"
            className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {leases.length === 0 ? (
          <EmptyState message="No active leases." />
        ) : (
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden bg-white">
            {leases.map((l) => {
              const thisMonthPayment = l.paymentSchedules[0];
              const paymentCfg = thisMonthPayment
                ? paymentStatusConfig[thisMonthPayment.status]
                : null;
              return (
                <div key={l.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">
                        {l.unit.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{l.unit.fullAddress}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Tenant: {l.tenant?.name ?? "Unassigned"} · Monthly Rent: ₱ {Number(l.monthlyRent).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs text-gray-400">
                        ~ {new Date(l.endDate).toLocaleDateString("en-US")}
                      </span>
                      {paymentCfg && thisMonthPayment && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${paymentCfg.cls}`}>
                          {leaseBadgeLabel[thisMonthPayment.status]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 케어 서비스 진행 현황 */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Wrench className="w-5 h-5 text-purple-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Care Service Status</h2>
        </div>

        {allCareRequests.length === 0 ? (
          <EmptyState message="No active care service requests." />
        ) : (
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden bg-white">
            {allCareRequests.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-800">
                    {c.serviceType} · {c.unit.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Preferred date: {new Date(c.preferredDate).toLocaleDateString("en-US")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-4">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium">
                    {careStatusLabel[c.status] ?? c.status}
                  </span>
                  {c.status === "PENDING_OWNER_APPROVAL" && (
                    <ApproveCareButton careId={c.id} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-24 border border-dashed border-gray-200 rounded-lg text-sm text-gray-400">
      {message}
    </div>
  );
}
