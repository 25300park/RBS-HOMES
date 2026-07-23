import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  DRAFT:                 { text: "Draft",               cls: "bg-gray-100 text-gray-600" },
  UNDER_LANDLORD_REVIEW: { text: "Awaiting Landlord",   cls: "bg-blue-100 text-blue-700" },
  COUNTER_OFFERED:       { text: "Counter Offered",      cls: "bg-orange-100 text-orange-700" },
  TENANT_APPROVED:       { text: "Tenant Approved",      cls: "bg-green-100 text-green-700" },
  SIGNED:                { text: "Signed",               cls: "bg-emerald-100 text-emerald-700" },
  REJECTED:              { text: "Rejected",             cls: "bg-red-100 text-red-600" },
};

export default async function LoiListPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) redirect("/");

  const userId = Number(session.user.id);
  const level = Number(session.user.level);
  const isBroker = [2, 3].includes(level);

  const lois = await prisma.loiDocument.findMany({
    where: {
      OR: [
        { tenantBrokerId: userId },
        { landlordId: userId },
        { landlordBrokerId: userId },
      ],
    },
    include: { unit: { select: { title: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 mb-16 md:mb-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Letter of Intent (LOI)</h1>
        {isBroker && (
          <Link
            href="/loi/new"
            className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            + New LOI
          </Link>
        )}
      </div>

      {/* List */}
      {lois.length === 0 ? (
        <div className="flex items-center justify-center h-24 border border-dashed border-gray-300 rounded-xl text-sm text-gray-400">
          No LOI documents found.
        </div>
      ) : (
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
          {lois.map((loi) => {
            const badge = STATUS_LABEL[loi.status] ?? { text: loi.status, cls: "bg-gray-100 text-gray-600" };
            return (
              <Link
                key={loi.id}
                href={`/loi/${loi.id}`}
                className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{loi.unit.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Updated {new Date(loi.updatedAt).toLocaleDateString("en-PH", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </p>
                </div>
                <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${badge.cls}`}>
                  {badge.text}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
