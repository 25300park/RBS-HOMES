export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Heart, CalendarDays, MessageSquare, ArrowRight } from "lucide-react";

export default async function BuyerDashboardPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) redirect("/");

  const userId = Number(session.user.id);

  const [favorites, scheduleCount, contacts] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.schedule.count({
      where: { userId, status: 2, date: { not: null } },
    }),
    prisma.contact.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="max-w-[1140px] mx-auto px-4 py-10 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          안녕하세요, {session.user.name ?? "회원"}님
        </h1>
        <p className="text-gray-500 mt-1 text-sm">나의 활동 현황을 확인하세요.</p>
      </div>

      {/* 즐겨찾기 매물 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">즐겨찾기 매물</h2>
          </div>
          <Link
            href="/account/unit/favorites"
            className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
          >
            전체 보기 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-500">
          즐겨찾기 {favorites.length}건
        </div>
      </section>

      {/* 방문 일정 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">예약된 방문 일정</h2>
          </div>
          <Link
            href="/account/schedule"
            className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-500">
          예약된 방문 일정 {scheduleCount}건
        </div>
      </section>

      {/* 문의 내역 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-purple-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">내 문의 내역</h2>
          </div>
          <Link
            href="/dashboard/buyer/inquiries"
            className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-500">
          문의 내역 {contacts.length}건
        </div>
      </section>
    </div>
  );
}

