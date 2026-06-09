export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Heart, CalendarDays, MessageSquare, ArrowRight } from "lucide-react";

export default async function BuyerDashboardPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) redirect("/login");

  const userId = Number(session.user.id);

  const [favorites, schedules, contacts] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      include: {
        unit: {
          select: { id: true, title: true, price: true, fullAddress: true, images: true, sellType: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.schedule.findMany({
      where: { userId, status: 2, date: { not: null } },
      orderBy: { date: "asc" },
      take: 5,
    }),
    prisma.contact.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const statusLabel: Record<number, { text: string; cls: string }> = {
    0: { text: "접수", cls: "bg-gray-100 text-gray-600" },
    1: { text: "처리 중", cls: "bg-orange-100 text-orange-600" },
    2: { text: "완료", cls: "bg-green-100 text-green-600" },
  };

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

        {favorites.length === 0 ? (
          <EmptyState message="즐겨찾기한 매물이 없습니다." />
        ) : (
          <div className="grid grid-cols-3 2lg:grid-cols-2 md:grid-cols-1 gap-4">
            {favorites.map(({ unit }) => {
              const img = Array.isArray(unit.images) ? (unit.images as string[])[0] : null;
              return (
                <Link
                  key={unit.id}
                  href={`/unit/detail/${unit.id}`}
                  className="flex gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
                >
                  <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                    {img && (
                      <img src={img} alt={unit.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate">{unit.title}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{unit.fullAddress}</p>
                    <p className="text-orange-500 font-bold text-sm mt-1">
                      ₱ {Number(unit.price ?? 0).toLocaleString()}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 방문 일정 */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-blue-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">예약된 방문 일정</h2>
        </div>

        {schedules.length === 0 ? (
          <EmptyState message="예약된 방문 일정이 없습니다." />
        ) : (
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden bg-white">
            {schedules.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium text-sm text-gray-800">{s.title ?? "방문 일정"}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.location ?? ""}</p>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0 ml-4">
                  {s.date ? new Date(s.date).toLocaleDateString("ko-KR") : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 문의 내역 */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-purple-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">내 문의 내역</h2>
        </div>

        {contacts.length === 0 ? (
          <EmptyState message="문의 내역이 없습니다." />
        ) : (
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden bg-white">
            {contacts.map((c) => {
              const st = statusLabel[c.status] ?? statusLabel[0];
              return (
                <div key={c.id} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">{c.message.slice(0, 60)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(c.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ml-4 ${st.cls}`}>
                    {st.text}
                  </span>
                </div>
              );
            })}
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
