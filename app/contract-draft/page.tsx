import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  DRAFT:                 { text: "Draft",              cls: "bg-gray-100 text-gray-600" },
  UNDER_LANDLORD_REVIEW: { text: "Awaiting Landlord",  cls: "bg-blue-100 text-blue-700" },
  SENT_TO_TENANT:        { text: "Sent to Tenant",     cls: "bg-yellow-100 text-yellow-700" },
  REVISION_REQUESTED:    { text: "Revision Requested", cls: "bg-orange-100 text-orange-700" },
  APPROVED:              { text: "Approved",           cls: "bg-green-100 text-green-700" },
  FINALIZED:             { text: "Finalized",          cls: "bg-emerald-100 text-emerald-700" },
  REJECTED:              { text: "Rejected",           cls: "bg-red-100 text-red-600" },
};

export default async function ContractDraftListPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) redirect("/");

  const userId = Number(session.user.id);

  const drafts = await prisma.contractDraft.findMany({
    where: {
      OR: [
        { landlordBrokerId: userId },
        { tenantBrokerId: userId },
        { unit: { adminId: userId } },
      ],
    },
    include: { unit: { select: { title: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 mb-16 md:mb-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Contract Drafts</h1>
      </div>

      {drafts.length === 0 ? (
        <div className="flex items-center justify-center h-24 border border-dashed border-gray-300 rounded-xl text-sm text-gray-400">
          No contract drafts found.
        </div>
      ) : (
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
          {drafts.map((draft) => {
            const badge = STATUS_LABEL[draft.status] ?? { text: draft.status, cls: "bg-gray-100 text-gray-600" };
            return (
              <Link
                key={draft.id}
                href={`/contract-draft/${draft.id}`}
                className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{draft.unit.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Updated{" "}
                    {new Date(draft.updatedAt).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
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
