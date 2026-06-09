export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Building2, CalendarDays, ArrowRight, CircleDot } from "lucide-react";

const unitStatusLabel: Record<number, { text: string; cls: string }> = {
  0: { text: "진행 중", cls: "bg-green-100 text-green-600" },
  1: { text: "완료", cls: "bg-gray-100 text-gray-500" },
  2: { text: "계약됨", cls: "bg-blue-100 text-blue-600" },
  3: { text: "협의 중", cls: "bg-orange-100 text-orange-600" },
};

export default async function AgentDashboardPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) redirect("/login");

  const userId = Number(session.user.id);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfWeek = new Date(startOfToday);
  endOfWeek.setDate(startOfToday.getDate() + 7);

  const [units, schedulesThisWeek] = await Promise.all([
    prisma.unit.findMany({
      where: { adminId: userId },
      orderBy: { regdate: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        price: true,
        fullAddress: true,
        images: true,
        sellType: true,
        status: true,
        regdate: true,
        viewCount: true,
      },
    }),
    prisma.schedule.findMany({
      where: {
        status: 2,
        date: { gte: startOfToday, lte: endOfWeek },
        unitId: {
          in: await prisma.unit
            .findMany({ where: { adminId: userId }, select: { id: true } })
            .then((u) => u.map((x) => x.id)),
        },
      },
      orderBy: { date: "asc" },
    }),
  ]);

  const todaySchedules = schedulesThisWeek.filter(
    (s) => s.date && new Date(s.date) < new Date(startOfToday.getTime() + 86400000)
  );
  const weekSchedules = schedulesThisWeek.filter(
    (s) => s.date && new Date(s.date) >= new Date(startOfToday.getTime() + 86400000)
  );

  return (
    <div className="max-w-[1140px] mx-auto px-4 py-10 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          안녕하세요, {session.user.name ?? "에이전트"}님
        </h1>
        <p className="text-gray-500 mt-1 text-sm">담당 매물과 방문 일정을 확인하세요.</p>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-3 md:grid-cols-1 gap-4">
        {[
          { label: "등록 매물", value: units.length, suffix: "개" },
          { label: "오늘 방문", value: todaySchedules.length, suffix: "건" },
          { label: "이번 주 방문", value: schedulesThisWeek.length, suffix: "건" },
        ].map(({ label, value, suffix }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {value}
              <span className="text-base font-medium text-gray-500 ml-1">{suffix}</span>
            </p>
          </div>
        ))}
      </div>

      {/* 내 매물 목록 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">내 등록 매물</h2>
          </div>
          <Link
            href="/account/unit/my-list"
            className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
          >
            전체 보기 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {units.length === 0 ? (
          <EmptyState message="등록한 매물이 없습니다." />
        ) : (
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden bg-white">
            {units.map((unit) => {
              const img = Array.isArray(unit.images) ? (unit.images as string[])[0] : null;
              const st = unitStatusLabel[unit.status] ?? unitStatusLabel[0];
              return (
                <Link
                  key={unit.id}
                  href={`/unit/detail/${unit.id}`}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                    {img && <img src={img} alt={unit.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate">{unit.title}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{unit.fullAddress}</p>
                    <p className="text-orange-500 font-bold text-sm mt-0.5">
                      ₱ {Number(unit.price ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>
                      {st.text}
                    </span>
                    <span className="text-xs text-gray-400">조회 {unit.viewCount}</span>
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
          <h2 className="text-lg font-bold text-gray-800">방문 일정</h2>
        </div>

        {schedulesThisWeek.length === 0 ? (
          <EmptyState message="이번 주 예정된 방문 일정이 없습니다." />
        ) : (
          <div className="space-y-3">
            {todaySchedules.length > 0 && (
              <ScheduleGroup title="오늘" schedules={todaySchedules} dotCls="bg-orange-400" />
            )}
            {weekSchedules.length > 0 && (
              <ScheduleGroup title="이번 주" schedules={weekSchedules} dotCls="bg-blue-400" />
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function ScheduleGroup({
  title,
  schedules,
  dotCls,
}: {
  title: string;
  schedules: any[];
  dotCls: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{title}</p>
      <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden bg-white">
        {schedules.map((s) => (
          <div key={s.id} className="flex items-center gap-3 px-4 py-3">
            <CircleDot className={`w-3 h-3 flex-shrink-0 ${dotCls.replace("bg-", "text-")}`} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-800 truncate">{s.title ?? "방문 일정"}</p>
              <p className="text-xs text-gray-500 truncate">{s.location ?? ""}</p>
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {s.date ? new Date(s.date).toLocaleDateString("ko-KR") : ""}
            </span>
          </div>
        ))}
      </div>
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
