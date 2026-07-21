export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { Building2, CalendarDays, Plus, Bell } from "lucide-react";
import LogoutButton from "./components/logout-button";

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

export default async function AgentDashboardPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) redirect("/");

  const data = await getAgentDashboardData();
  const units = data?.units ?? [];
  const todoSummary = data?.todoSummary ?? { pendingTourCount: 0, upcomingSchedules: [] };

  const summary = {
    total: units.length,
    ongoing: units.filter((u: any) => u.status === 0).length,
    contracted: units.filter((u: any) => u.status === 2).length,
    negotiation: units.filter((u: any) => u.status === 3).length,
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="max-w-3xl mx-auto px-4 py-6 pb-12 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Agent Dashboard</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300 font-medium truncate max-w-[120px]">
              {session.user.name ?? "Agent"}
            </span>
            <LogoutButton />
          </div>
        </div>

        {/* 지금 할 일 */}
        <section>
          <SectionTitle icon={<Bell className="w-4 h-4 text-amber-400" />}>지금 할 일</SectionTitle>

          <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Pending Tour Requests</span>
              {todoSummary.pendingTourCount > 0 ? (
                <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full">
                  {todoSummary.pendingTourCount}
                </span>
              ) : (
                <span className="text-xs text-slate-500">0</span>
              )}
            </div>

            {todoSummary.upcomingSchedules.length > 0 && (
              <div className="space-y-2 border-t border-slate-700 pt-3">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Today / Tomorrow</p>
                {(todoSummary.upcomingSchedules as any[]).map((s) => (
                  <div key={s.id} className="flex items-start justify-between gap-2">
                    <p className="text-sm text-white truncate">{s.title}</p>
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      {new Date(s.date).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {todoSummary.pendingTourCount === 0 && todoSummary.upcomingSchedules.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-1">처리할 항목이 없습니다.</p>
            )}
          </div>
        </section>

        {/* My Listings */}
        <section>
          <SectionTitle icon={<Building2 className="w-4 h-4 text-blue-400" />}>My Listings</SectionTitle>

          <div className="grid grid-cols-4 gap-2 mb-4">
            <SummaryCard label="Total" value={summary.total} />
            <SummaryCard label="Ongoing" value={summary.ongoing} />
            <SummaryCard label="Contracted" value={summary.contracted} />
            <SummaryCard label="Negotiation" value={summary.negotiation} />
          </div>

          <div className="flex gap-2 mt-2">
            <Link
              href="/account/unit/my-list"
              className="flex-1 flex items-center justify-center min-h-[44px] border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white rounded-lg text-sm font-semibold transition-colors"
            >
              View All Listings
            </Link>
            <Link
              href="/unit/register"
              className="flex-1 flex items-center justify-center gap-2 min-h-[44px] bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Register New Listing
            </Link>
          </div>
        </section>

        {/* Tour Requests — 요약 카드 */}
        <section>
          <SectionTitle icon={<Bell className="w-4 h-4 text-blue-400" />}>Tour Requests</SectionTitle>

          <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-300">
              대기 중인 투어 요청{" "}
              <span className="font-bold text-white">{todoSummary.pendingTourCount}건</span>
            </p>
            <Link
              href="/dashboard/agent/tour-requests"
              className="flex-shrink-0 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              View All →
            </Link>
          </div>
        </section>

        {/* My Schedule — 요약 카드 */}
        <section>
          <SectionTitle icon={<CalendarDays className="w-4 h-4 text-blue-400" />}>My Schedule</SectionTitle>

          <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-300">
              다가오는 일정{" "}
              <span className="font-bold text-white">{todoSummary.upcomingSchedules.length}건</span>
            </p>
            <Link
              href="/account/schedule"
              className="flex-shrink-0 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Schedule 바로가기 →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Section title ─────────────────────────────────────────
function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h2 className="text-sm font-bold text-white uppercase tracking-wide">{children}</h2>
    </div>
  );
}

// ── Summary card ───────────────────────────────────────────
function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-3 text-center">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}

