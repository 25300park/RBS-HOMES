export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { Building2, CalendarDays, ClipboardList, Plus } from "lucide-react";
import LogoutButton from "./components/logout-button";
import AgentScheduleForm from "./components/agent-schedule-form";

const unitStatusConfig: Record<number, { text: string; cls: string }> = {
  0: { text: "Ongoing", cls: "bg-blue-500/15 text-blue-400" },
  1: { text: "Completed", cls: "bg-slate-600/40 text-slate-300" },
  2: { text: "Contracted", cls: "bg-emerald-500/15 text-emerald-400" },
  3: { text: "Under Negotiation", cls: "bg-amber-500/15 text-amber-400" },
};

const tourStatusConfig: Record<number, { text: string; cls: string }> = {
  0: { text: "Requested", cls: "bg-blue-500/15 text-blue-400" },
  1: { text: "Pending", cls: "bg-amber-500/15 text-amber-400" },
  2: { text: "Confirmed", cls: "bg-emerald-500/15 text-emerald-400" },
  3: { text: "Cancelled", cls: "bg-red-500/15 text-red-400" },
};

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
  const schedules = data?.schedules ?? [];
  const tourRequests = data?.tourRequests ?? [];

  const summary = {
    total: units.length,
    ongoing: units.filter((u: any) => u.status === 0).length,
    contracted: units.filter((u: any) => u.status === 2).length,
    negotiation: units.filter((u: any) => u.status === 3).length,
  };

  const scheduleUnits = units.map((u: any) => ({ id: u.id, title: u.title }));
  const unitTitleById = new Map<number, string>(units.map((u: any) => [u.id, u.title]));

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

        {/* My Listings */}
        <section>
          <SectionTitle icon={<Building2 className="w-4 h-4 text-blue-400" />}>My Listings</SectionTitle>

          <div className="grid grid-cols-4 gap-2 mb-4">
            <SummaryCard label="Total" value={summary.total} />
            <SummaryCard label="Ongoing" value={summary.ongoing} />
            <SummaryCard label="Contracted" value={summary.contracted} />
            <SummaryCard label="Negotiation" value={summary.negotiation} />
          </div>

          {units.length === 0 ? (
            <EmptyState message="No listings assigned to you yet." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {units.map((u: any) => {
                const cfg = unitStatusConfig[u.status] ?? { text: "Unknown", cls: "bg-slate-600/40 text-slate-300" };
                return (
                  <div key={u.id} className="bg-[#1e293b] border border-slate-700 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm text-white truncate">{u.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${cfg.cls}`}>
                        {cfg.text}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 truncate">
                      {[u.address1, u.address2].filter(Boolean).join(" ")}
                    </p>
                    <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                      <span>{u.type} · {u.sellType}</span>
                      <span>{u.viewCount} views</span>
                    </div>
                    {u.price && (
                      <p className="text-sm font-bold text-blue-400 mt-2">
                        ₱ {Number(u.price).toLocaleString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <Link
            href="/unit/register"
            className="flex items-center justify-center gap-2 min-h-[44px] bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Register New Listing
          </Link>
        </section>

        {/* Tour Requests */}
        <section>
          <SectionTitle icon={<ClipboardList className="w-4 h-4 text-blue-400" />}>Tour Requests</SectionTitle>

          {tourRequests.length === 0 ? (
            <EmptyState message="No tour requests yet." />
          ) : (
            <div className="bg-[#1e293b] border border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 text-xs border-b border-slate-700">
                    <th className="text-left px-3 py-2 font-medium">Listing</th>
                    <th className="text-left px-3 py-2 font-medium">Applicant</th>
                    <th className="text-left px-3 py-2 font-medium">Contact</th>
                    <th className="text-left px-3 py-2 font-medium">Preferred Date</th>
                    <th className="text-center px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {tourRequests.map((t: any) => {
                    const cfg = tourStatusConfig[t.status] ?? { text: "Unknown", cls: "bg-slate-600/40 text-slate-300" };
                    return (
                      <tr key={t.id}>
                        <td className="px-3 py-3 text-white truncate max-w-[140px]">{unitTitleById.get(t.unitId) ?? "—"}</td>
                        <td className="px-3 py-3 text-slate-300">{t.username ?? t.email ?? "—"}</td>
                        <td className="px-3 py-3 text-slate-300">{t.mobile ?? "—"}</td>
                        <td className="px-3 py-3 text-slate-300">
                          {t.requestDate ? new Date(t.requestDate).toLocaleDateString("en-US") : "—"}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>
                            {cfg.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* My Schedule */}
        <section>
          <SectionTitle icon={<CalendarDays className="w-4 h-4 text-blue-400" />}>My Schedule</SectionTitle>

          {schedules.length === 0 ? (
            <EmptyState message="No upcoming schedules." />
          ) : (
            <div className="bg-[#1e293b] border border-slate-700 rounded-xl divide-y divide-slate-700 overflow-hidden mb-4">
              {schedules.map((s: any) => (
                <div key={s.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-sm text-white">{s.title}</p>
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      {new Date(s.date).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {s.unit && <p className="text-xs text-slate-400 mt-0.5">{s.unit.title}</p>}
                  {s.memo && <p className="text-xs text-slate-400 mt-1">{s.memo}</p>}
                </div>
              ))}
            </div>
          )}

          <AgentScheduleForm units={scheduleUnits} />
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

// ── Empty state ────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-20 border border-dashed border-slate-700 rounded-xl text-sm text-slate-400 mb-4">
      {message}
    </div>
  );
}
