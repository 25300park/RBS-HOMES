export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { ClipboardList, ArrowLeft } from "lucide-react";
import TourActionButtons from "../components/tour-action-buttons";

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

export default async function TourRequestsPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) redirect("/");

  const data = await getAgentDashboardData();
  const units = data?.units ?? [];
  const tourRequests = data?.tourRequests ?? [];

  const unitTitleById = new Map<number, string>(units.map((u: any) => [u.id, u.title]));

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="max-w-3xl mx-auto px-4 py-6 pb-12 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/agent"
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>

        {/* Tour Requests */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="w-4 h-4 text-blue-400" />
            <h1 className="text-sm font-bold text-white uppercase tracking-wide">Tour Requests</h1>
          </div>

          {tourRequests.length === 0 ? (
            <div className="flex items-center justify-center h-20 border border-dashed border-slate-700 rounded-xl text-sm text-slate-400">
              No tour requests yet.
            </div>
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
                    <th className="text-center px-3 py-2 font-medium">Actions</th>
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
                        <td className="px-3 py-3 text-center">
                          {t.status === 0 ? (
                            <TourActionButtons scheduleId={t.id} />
                          ) : (
                            <span className="text-xs text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
