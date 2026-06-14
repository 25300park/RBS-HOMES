export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Building2, FileText, Wrench, ExternalLink } from "lucide-react";
import LogoutButton from "./components/logout-button";
import ApproveCareButton from "./components/approve-care-button";

const careServiceTypeLabel: Record<string, string> = {
  AIRCON: "Aircon Service",
  CLEANING: "Cleaning",
  REPAIR: "Repair",
  HANDYMAN: "Handyman",
};

const careStatusLabel: Record<string, { text: string; cls: string }> = {
  PENDING: { text: "Requested", cls: "bg-gray-100 text-gray-600" },
  PENDING_OWNER_APPROVAL: { text: "Awaiting Your Approval", cls: "bg-orange-100 text-orange-600" },
  SCHEDULED: { text: "Scheduled", cls: "bg-blue-100 text-blue-600" },
  IN_PROGRESS: { text: "In Progress", cls: "bg-purple-100 text-purple-600" },
  AWAITING_TENANT_CONFIRMATION: { text: "Awaiting Tenant Confirmation", cls: "bg-green-100 text-green-700" },
  COMPLETED: { text: "Completed", cls: "bg-gray-100 text-gray-500" },
  CANCELLED: { text: "Cancelled", cls: "bg-red-100 text-red-600" },
};

async function getOwnerDashboardData() {
  const headersList = headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const cookie = headersList.get("cookie") ?? "";

  const res = await fetch(`${protocol}://${host}/api/pms/owner-dashboard`, {
    headers: { cookie },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function OwnerDashboardPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) redirect("/auth/login");

  const data = await getOwnerDashboardData();
  const leases = data?.leases ?? [];

  const allCareRequests = leases.flatMap((l: any) =>
    l.careRequests.map((c: any) => ({ ...c, unit: l.unit }))
  );
  console.log("[DEBUG] allCareRequests:", JSON.stringify(allCareRequests));
  console.log("[DEBUG] leases careRequests:", JSON.stringify(leases.map((l: any) => l.careRequests)));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Owner Dashboard</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">{session.user.name ?? "Owner"}</span>
            <LogoutButton />
          </div>
        </div>

        {/* Lease Summary */}
        <section>
          <SectionHeader icon={<Building2 className="w-5 h-5 text-blue-500" />} title="Lease Summary" />
          {leases.length === 0 ? (
            <EmptyState message="No active leases found." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leases.map((lease: any) => (
                <div key={lease.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{lease.unit.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {[lease.unit.address1, lease.unit.address2].filter(Boolean).join(" ")}
                      </p>
                    </div>
                    <ContractStatusBadge status={lease.status} />
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tenant</span>
                      <span className="font-medium text-gray-700">
                        {lease.tenant?.name ?? lease.tenant?.email ?? "Unassigned"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Lease Period</span>
                      <span className="font-medium text-gray-700">
                        {new Date(lease.startDate).toLocaleDateString("en-US")} –{" "}
                        {new Date(lease.endDate).toLocaleDateString("en-US")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Monthly Rent</span>
                      <span className="font-bold text-blue-600">
                        ₱ {Number(lease.monthlyRent).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Payment Status */}
        <section>
          <SectionHeader icon={<FileText className="w-5 h-5 text-green-500" />} title="Payment Status" />
          {leases.length === 0 ? (
            <EmptyState message="No payment records found." />
          ) : (
            <div className="space-y-6">
              {leases.map((lease: any) => (
                <div key={lease.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="font-semibold text-sm text-gray-800">{lease.unit.title}</p>
                  </div>
                  {lease.paymentSchedules.length === 0 ? (
                    <div className="px-4 py-6">
                      <EmptyState message="No payment schedules in the last 6 months." />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 text-gray-500 text-xs">
                            <th className="text-left px-4 py-2 font-medium">Due Date</th>
                            <th className="text-right px-4 py-2 font-medium">Amount</th>
                            <th className="text-center px-4 py-2 font-medium">Status</th>
                            <th className="text-center px-4 py-2 font-medium">Receipt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {lease.paymentSchedules.map((p: any) => (
                            <tr key={p.id}>
                              <td className="px-4 py-3 text-gray-700">
                                {new Date(p.dueDate).toLocaleDateString("en-US", {
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
                              <td className="px-4 py-3 text-center">
                                {p.receiptImageUrl ? (
                                  <a
                                    href={p.receiptImageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 text-xs font-medium"
                                  >
                                    View <ExternalLink className="w-3 h-3" />
                                  </a>
                                ) : (
                                  <span className="text-gray-300 text-xs">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* DEBUG: {JSON.stringify(allCareRequests)} */}

        {/* Care Service Requests */}
        <section>
          <SectionHeader icon={<Wrench className="w-5 h-5 text-purple-500" />} title="Care Service Requests" />
          {allCareRequests.length === 0 ? (
            <EmptyState message="No active care service requests." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allCareRequests.map((c: any) => {
                const cfg = careStatusLabel[c.status] ?? { text: c.status, cls: "bg-gray-100 text-gray-600" };
                return (
                  <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm text-gray-800">
                          {careServiceTypeLabel[c.serviceType] ?? c.serviceType}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{c.unit.title}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${cfg.cls}`}>
                        {cfg.text}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      Requested: {new Date(c.createdAt).toLocaleDateString("en-US")}
                    </p>
                    {c.status === "PENDING_OWNER_APPROVAL" && (
                      <div className="mt-3">
                        <ApproveCareButton careId={c.id} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Documents */}
        <section>
          <SectionHeader icon={<FileText className="w-5 h-5 text-gray-400" />} title="Documents" />
          <ComingSoon />
        </section>

        {/* Signature */}
        <section>
          <SectionHeader icon={<FileText className="w-5 h-5 text-gray-400" />} title="Signature" />
          <ComingSoon />
        </section>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <h2 className="text-lg font-bold text-gray-800">{title}</h2>
    </div>
  );
}

function ContractStatusBadge({ status }: { status: string }) {
  const map: Record<string, { text: string; cls: string }> = {
    ACTIVE: { text: "Active", cls: "bg-green-100 text-green-700" },
    EXPIRING_SOON: { text: "Expiring Soon", cls: "bg-amber-100 text-amber-700" },
    EXPIRED: { text: "Expired", cls: "bg-red-100 text-red-600" },
    TERMINATED: { text: "Terminated", cls: "bg-gray-100 text-gray-500" },
  };
  const cfg = map[status] ?? { text: status, cls: "bg-gray-100 text-gray-500" };
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${cfg.cls}`}>
      {cfg.text}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    AWAITING_APPROVAL: "bg-blue-100 text-blue-600",
    PAID: "bg-green-100 text-green-700",
    OVERDUE: "bg-red-100 text-red-600",
  };
  const label: Record<string, string> = {
    PENDING: "Pending",
    AWAITING_APPROVAL: "Awaiting Approval",
    PAID: "Paid",
    OVERDUE: "Overdue",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {label[status] ?? status}
    </span>
  );
}

function ComingSoon() {
  return (
    <div className="flex items-center justify-center h-24 border border-dashed border-gray-200 rounded-xl text-sm text-gray-400 bg-white">
      Coming Soon
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-20 border border-dashed border-gray-200 rounded-xl text-sm text-gray-400">
      {message}
    </div>
  );
}
