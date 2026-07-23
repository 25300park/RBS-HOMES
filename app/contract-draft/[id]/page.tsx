import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import ContractDraftDetail from "./contract-draft-detail";

export default async function ContractDraftDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) redirect("/");

  const draftId = Number(params.id);
  const callerId = Number(session.user.id);

  const draft = await prisma.contractDraft.findUnique({
    where: { id: draftId },
    include: { unit: { select: { title: true, adminId: true } } },
  });
  if (!draft) notFound();

  const isLandlordSide =
    callerId === draft.unit.adminId || callerId === draft.landlordBrokerId;
  const isTenantSide = callerId === draft.tenantBrokerId;

  if (!isLandlordSide && !isTenantSide) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-500">접근 권한이 없습니다.</p>
        <Link
          href="/contract-draft"
          className="mt-4 inline-block text-sm text-orange-500 hover:underline"
        >
          ← Back to Contract Drafts
        </Link>
      </div>
    );
  }

  const viewerRole: "landlord" | "tenant" = isLandlordSide ? "landlord" : "tenant";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 mb-16 md:mb-0">
      <div className="mb-6">
        <Link
          href="/contract-draft"
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Back to Contract Drafts
        </Link>
      </div>
      <ContractDraftDetail draft={draft} viewerRole={viewerRole} />
    </div>
  );
}
