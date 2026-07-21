import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import DateCalendar from "@/components/ui/date-calendar";
import { getUserSchedules, getUnitDetails } from "../../action";
import AgentScheduleSection from "@/components/schedule/agent-schedule-section";

async function getAgentDashboardData() {
  const headersList = headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const cookie = headersList.get("cookie") ?? "";

  const res = await fetch(`${protocol}://${host}/api/pms/agent-dashboard`, {
    headers: { cookie },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

const ScheduleHome = async () => {
  const session: any = await getServerSession(authOptions as any);
  const level = Number(session?.user?.level ?? 1);

  if (level === 2 || level === 3) {
    const data = await getAgentDashboardData();
    const units = data?.units ?? [];
    const schedules = data?.schedules ?? [];
    const tourRequests = data?.tourRequests ?? [];

    const scheduleUnits = units.map((u: any) => ({ id: u.id, title: u.title }));
    const pendingTourCountByUnit: Record<number, number> = (tourRequests as any[])
      .filter((t) => t.status === 0)
      .reduce((acc, t) => { acc[t.unitId] = (acc[t.unitId] ?? 0) + 1; return acc; }, {} as Record<number, number>);

    return (
      <div className="px-4 max-w-3xl mx-auto py-6 mb-12 md:mb-0">
        <AgentScheduleSection
          schedules={schedules}
          scheduleUnits={scheduleUnits}
          pendingTourCountByUnit={pendingTourCountByUnit}
        />
      </div>
    );
  }

  const { schedules, datesArray } = await getUserSchedules();
  return (
    <div className="px-4 max-w-[1440px] mx-auto mb-12 md:mb-0">
      <DateCalendar markedDates={datesArray} schedules={schedules} fetchUnitDetails={getUnitDetails} />
    </div>
  );
};

export default ScheduleHome;
