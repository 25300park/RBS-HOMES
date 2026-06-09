export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  FileText,
  Banknote,
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

const careStatusLabel: Record<string, { text: string; cls: string }> = {
  PENDING: { text: "접수", cls: "bg-gray-100 text-gray-600" },
  SCHEDULED: { text: "일정 확정", cls: "bg-blue-100 text-blue-600" },
  COMPLETED: { text: "완료", cls: "bg-green-100 text-green-700" },
  CANCELLED: { text: "취소", cls: "bg-gray-100 text-gray-400" },
};

export default async function TenantDashboardPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) redirect("/login");

  const userId = Number(session.user.id);

  const now = new Date();
  const sixtyDaysLater = new Date(now);
  sixtyDaysLater.setDate(now.getDate() + 60);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  // 현재 활성 계약 (가장 최근 1개)
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
      <div className="max-w-[1140px] mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          안녕하세요, {session.user.name ?? "임차인"}님
        </h1>
        <EmptyState message="현재 활성 임대차 계약이 없습니다. 관리자에게 문의하세요." />
      </div>
    );
  }

  const leaseId = activeLease.id;
  const condoId = activeLease.unit.condoId ?? activeLease.condoId;

  const [thisMonthPayments, paymentHistory, careRequests, communityPosts] = await Promise.all([
    prisma.paymentSchedule.findMany({
      where: { contractId: leaseId, dueDate: { gte: startOfMonth, lte: endOfMonth } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.paymentSchedule.findMany({
      where: { contractId: leaseId, dueDate: { gte: sixMonthsAgo, lt: startOfMonth } },
      orderBy: { dueDate: "desc" },
      take: 20,
    }),
    prisma.careServiceRequest.findMany({
      where: { contractId: leaseId, status: { not: "CANCELLED" } },
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

  return (
    <div className="max-w-[1140px] mx-auto px-4 py-10 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          안녕하세요, {session.user.name ?? "임차인"}님
        </h1>
        <p className="text-gray-500 mt-1 text-sm">나의 계약과 납부 현황을 확인하세요.</p>
      </div>

      {/* 만료 임박 배너 */}
      {isExpiringSoon && (
        <div className="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-700 text-sm">계약 만료 60일 이내</p>
              <p className="text-xs text-amber-600 mt-0.5">
                만료일: {new Date(activeLease.endDate).toLocaleDateString("ko-KR")}
              </p>
            </div>
          </div>
          <Link
            href="/units"
            className="flex items-center gap-1 flex-shrink-0 text-sm bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg font-medium transition-colors"
          >
            새 매물 보러가기 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 현재 계약 요약 */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">현재 계약</h2>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="grid grid-cols-3 md:grid-cols-1 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">유닛</p>
              <p className="font-semibold text-gray-800">{activeLease.unit.title}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{activeLease.unit.fullAddress}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">월 임대료</p>
              <p className="font-bold text-orange-500 text-lg">
                ₱ {Number(activeLease.monthlyRent).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">계약 기간</p>
              <p className="font-medium text-gray-700 text-sm">
                {new Date(activeLease.startDate).toLocaleDateString("ko-KR")} ~{" "}
                {new Date(activeLease.endDate).toLocaleDateString("ko-KR")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 이번 달 납부 */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Banknote className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">이번 달 납부</h2>
        </div>

        {!thisMonthPayment ? (
          <EmptyState message="이번 달 납부 스케줄이 없습니다." />
        ) : (
          <ThisMonthPaymentCard payment={thisMonthPayment} />
        )}
      </section>

      {/* 납부 이력 */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-gray-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">납부 이력 (최근 6개월)</h2>
        </div>

        {paymentHistory.length === 0 ? (
          <EmptyState message="납부 이력이 없습니다." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs">
                  <th className="text-left px-4 py-2 font-medium">납부 기준월</th>
                  <th className="text-right px-4 py-2 font-medium">금액</th>
                  <th className="text-center px-4 py-2 font-medium">상태</th>
                  <th className="text-right px-4 py-2 font-medium">확인일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white border border-gray-200 rounded-lg">
                {paymentHistory.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(p.dueDate).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      ₱ {Number(p.amountDue).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <PaymentStatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {p.verifiedAt ? new Date(p.verifiedAt).toLocaleDateString("ko-KR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 홈케어 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-purple-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">홈케어</h2>
          </div>
          <Link
            href={`/dashboard/tenant/care/new?contractId=${leaseId}`}
            className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg font-medium transition-colors"
          >
            + 케어 신청
          </Link>
        </div>

        {careRequests.length === 0 ? (
          <EmptyState message="진행 중인 홈케어 신청이 없습니다." />
        ) : (
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden bg-white">
            {careRequests.map((c) => {
              const cfg = careStatusLabel[c.status] ?? { text: c.status, cls: "bg-gray-100 text-gray-600" };
              return (
                <div key={c.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-medium text-sm text-gray-800">{c.serviceType}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      희망일: {new Date(c.preferredDate).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>
                    {cfg.text}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 커뮤니티 */}
      {condoId && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-teal-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">콘도 커뮤니티</h2>
            </div>
            <Link
              href={`/dashboard/tenant/community?condoId=${condoId}`}
              className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
            >
              전체 보기 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {communityPosts.length === 0 ? (
            <EmptyState message="게시글이 없습니다." />
          ) : (
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden bg-white">
              {communityPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {post.isNotice && (
                        <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded font-medium flex-shrink-0">
                          공지
                        </span>
                      )}
                      <p className="font-medium text-sm text-gray-800 truncate">{post.title}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{post.author.name}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

// ── 이번 달 납부 카드 (상태별 UI) ────────────────────────────────
function ThisMonthPaymentCard({ payment }: { payment: any }) {
  const due = new Date(payment.dueDate).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  });

  if (payment.status === "PAID") {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-5">
        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
        <div>
          <p className="font-semibold text-green-700">{due} 납부 완료</p>
          <p className="text-sm text-green-600 mt-0.5">
            ₱ {Number(payment.amountDue).toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  if (payment.status === "AWAITING_APPROVAL") {
    return (
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-5">
        <Clock className="w-6 h-6 text-blue-500 flex-shrink-0" />
        <div>
          <p className="font-semibold text-blue-700">{due} — 영수증 확인 중입니다</p>
          <p className="text-sm text-blue-500 mt-0.5">관리자가 확인 후 승인합니다.</p>
        </div>
      </div>
    );
  }

  if (payment.status === "OVERDUE") {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-300 rounded-xl p-5">
        <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-red-700">{due} — 연체 중입니다</p>
          <p className="text-sm text-red-500 mt-0.5">
            ₱ {Number(payment.amountDue).toLocaleString()} · 빠른 납부 후 영수증을 업로드하세요.
          </p>
        </div>
        <ReceiptUploadButton paymentId={payment.id} />
      </div>
    );
  }

  // PENDING
  return (
    <div className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl p-5">
      <div>
        <p className="font-semibold text-gray-800">{due}</p>
        <p className="text-orange-500 font-bold text-lg mt-0.5">
          ₱ {Number(payment.amountDue).toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">납부 후 영수증을 업로드하세요.</p>
      </div>
      <ReceiptUploadButton paymentId={payment.id} />
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-gray-100 text-gray-600",
    AWAITING_APPROVAL: "bg-orange-100 text-orange-600",
    PAID: "bg-green-100 text-green-700",
    OVERDUE: "bg-red-100 text-red-600",
  };
  const label: Record<string, string> = {
    PENDING: "대기",
    AWAITING_APPROVAL: "확인 중",
    PAID: "완료",
    OVERDUE: "연체",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {label[status] ?? status}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-24 border border-dashed border-gray-200 rounded-lg text-sm text-gray-400">
      {message}
    </div>
  );
}
