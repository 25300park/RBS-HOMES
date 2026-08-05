export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { Bell, Building2, Plus, CalendarDays, ChevronRight } from "lucide-react";
import LogoutButton from "./components/logout-button";
import BottomNav from "./components/bottom-nav";

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
    <div className="bg-zinc-50 min-h-screen text-zinc-800 pb-20 md:pb-28">
      <main className="max-w-[1140px] mx-auto px-4 py-6 sm:py-8 space-y-6">

        {/* Welcome card */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-zinc-200 shadow-2xs flex flex-row md:flex-col items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
              Hello, {session.user.name ?? "Agent"}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Manage your property listings, tour schedules, and client pipeline.
            </p>
          </div>
          <div className="flex items-center justify-between md:justify-end space-x-2">
            <span className="bg-[#0E5246]/10 text-[#0E5246] text-xs font-bold px-3 py-1.5 rounded-full border border-[#0E5246]/20">
              Agent Level 2
            </span>
            <LogoutButton />
          </div>
        </div>

        {/* Mobile filter tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar pb-1 text-xs font-bold md:hidden">
          {[
            { label: "Overview", href: "#action-items" },
            { label: "Action Items", href: "#action-items" },
            { label: "Listings", href: "#listings" },
            { label: "Pipeline", href: "#pipeline" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="px-3.5 py-1.5 rounded-md whitespace-nowrap bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100 transition-all"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Section 1: Action Items */}
        <section id="action-items" className="bg-white border border-zinc-200 shadow-2xs rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <span className="text-xs font-bold text-[#0E5246] uppercase tracking-widest">Action Items</span>
              <h2 className="text-base sm:text-lg font-extrabold text-zinc-900">Today & Tomorrow Tasks</h2>
            </div>
            {todoSummary.pendingTourCount > 0 && (
              <span className="bg-amber-100 text-amber-700 font-extrabold text-xs px-2.5 py-1 rounded-full shrink-0">
                Pending Tours: {todoSummary.pendingTourCount}
              </span>
            )}
          </div>

          {todoSummary.pendingTourCount === 0 && todoSummary.upcomingSchedules.length === 0 ? (
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 text-center text-sm text-zinc-500">
              No pending action items.
            </div>
          ) : (
            <div className="space-y-3">
              {todoSummary.pendingTourCount > 0 && (
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <p className="font-extrabold text-zinc-900 text-sm">
                        Pending Tour Requests: {todoSummary.pendingTourCount}
                      </p>
                      <p className="text-xs text-zinc-500">Clients waiting for schedule confirmation.</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/agent/tour-requests"
                    className="bg-[#0E5246] hover:bg-[#0B4339] text-white font-bold px-3 py-1.5 rounded-md text-xs shadow-2xs self-end sm:self-auto transition-all"
                  >
                    Manage →
                  </Link>
                </div>
              )}
              {(todoSummary.upcomingSchedules as any[]).map((s) => (
                <div
                  key={s.id}
                  className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <CalendarDays className="w-4 h-4 text-[#0E5246] shrink-0" />
                    <div className="min-w-0">
                      <p className="font-extrabold text-zinc-900 text-sm truncate">{s.title}</p>
                      <p className="text-xs text-zinc-500">
                        {new Date(s.date).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: My Listings */}
        <section id="listings" className="bg-white border border-zinc-200 shadow-2xs rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-3 gap-2">
            <div>
              <span className="text-xs font-bold text-[#0E5246] uppercase tracking-widest">My Listings</span>
              <h2 className="text-base sm:text-lg font-extrabold text-zinc-900">Property Portfolio Overview</h2>
            </div>
            <Link
              href="/account/unit/registration/step-one"
              className="bg-[#0E5246] hover:bg-[#0B4339] text-white font-extrabold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-2xs transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Register New Listing
            </Link>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-2 gap-3">
            <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500 font-medium block">Total</span>
                <span className="text-xl font-black text-zinc-900 mt-1 block">{summary.total}</span>
              </div>
              <Building2 className="w-7 h-7 text-zinc-400 opacity-60" />
            </div>
            <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-600 font-medium block">Ongoing</span>
                <span className="text-xl font-black text-[#0E5246] mt-1 block">{summary.ongoing}</span>
              </div>
              <Building2 className="w-7 h-7 text-[#0E5246] opacity-60" />
            </div>
            <div className="bg-[#0B4339] border border-[#0B4339] p-3.5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-white/70 font-medium block">Contracted</span>
                <span className="text-xl font-black text-white mt-1 block">{summary.contracted}</span>
              </div>
              <Building2 className="w-7 h-7 text-white opacity-60" />
            </div>
            <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-600 font-medium block">Negotiation</span>
                <span className="text-xl font-black text-amber-700 mt-1 block">{summary.negotiation}</span>
              </div>
              <Building2 className="w-7 h-7 text-amber-500 opacity-60" />
            </div>
          </div>
          <Link
            href="/account/unit/my-list"
            className="w-full flex items-center justify-center min-h-[40px] border border-zinc-200 hover:border-zinc-400 text-zinc-600 hover:text-zinc-900 rounded-lg text-xs font-bold transition-colors"
          >
            View All Listings →
          </Link>
        </section>

        {/* Section 3 & 4: Tour Requests + Schedule (2-col) */}
        <div id="pipeline" className="grid grid-cols-2 md:grid-cols-1 gap-6">
          <section className="bg-white border border-zinc-200 shadow-2xs rounded-xl p-5 sm:p-6 space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <span className="text-xs font-bold text-[#0E5246] uppercase tracking-widest">Tour Requests</span>
                <h2 className="text-base sm:text-lg font-extrabold text-zinc-900">New Client Inquiries</h2>
              </div>
              <Link
                href="/dashboard/agent/tour-requests"
                className="text-xs font-bold text-[#0E5246] hover:underline shrink-0"
              >
                View All →
              </Link>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 sm:p-5 flex items-center space-x-4">
              <div
                className={`w-12 h-12 rounded-lg text-white flex items-center justify-center font-black text-xl shrink-0 ${
                  todoSummary.pendingTourCount > 0 ? "bg-[#0E5246]" : "bg-zinc-300"
                }`}
              >
                {todoSummary.pendingTourCount}
              </div>
              <div>
                <h3 className="font-extrabold text-zinc-900 text-sm">
                  Pending Tours: {todoSummary.pendingTourCount}
                </h3>
                <p className="text-xs text-zinc-500">Clients waiting for schedule confirmation.</p>
              </div>
            </div>
            <Link
              href="/dashboard/agent/tour-requests"
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center shadow-2xs transition-all"
            >
              Manage Tour Requests →
            </Link>
          </section>

          <section className="bg-white border border-zinc-200 shadow-2xs rounded-xl p-5 sm:p-6 space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <span className="text-xs font-bold text-[#0E5246] uppercase tracking-widest">My Schedule</span>
                <h2 className="text-base sm:text-lg font-extrabold text-zinc-900">Upcoming Property Visits</h2>
              </div>
              <Link
                href="/account/schedule"
                className="text-xs font-bold text-[#0E5246] hover:underline shrink-0"
              >
                Calendar →
              </Link>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 sm:p-5 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-black text-xl shrink-0">
                {todoSummary.upcomingSchedules.length}
              </div>
              <div>
                <h3 className="font-extrabold text-zinc-900 text-sm">
                  Upcoming Schedules: {todoSummary.upcomingSchedules.length}
                </h3>
                <p className="text-xs text-zinc-500">Confirmed property visits for today and tomorrow.</p>
              </div>
            </div>
            <Link
              href="/account/schedule"
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center shadow-2xs transition-all"
            >
              Open Schedule Calendar →
            </Link>
          </section>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
