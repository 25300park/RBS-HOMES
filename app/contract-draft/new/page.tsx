import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import ContractDraftForm from "./contract-draft-form";

export default async function ContractDraftNewPage({
  searchParams,
}: {
  searchParams: { loiId?: string };
}) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) redirect("/");

  const level = Number(session.user.level);

  if (![2, 3].includes(level)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-500">브로커만 작성 가능합니다.</p>
        <Link href="/contract-draft" className="mt-4 inline-block text-sm text-orange-500 hover:underline">
          ← Back to Contract Drafts
        </Link>
      </div>
    );
  }

  const loiId = searchParams.loiId ? Number(searchParams.loiId) : null;
  if (!loiId) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-500">유효하지 않은 접근입니다. LOI를 먼저 완료해주세요.</p>
        <Link href="/loi" className="mt-4 inline-block text-sm text-orange-500 hover:underline">
          ← Back to LOI list
        </Link>
      </div>
    );
  }

  const loi = await prisma.loiDocument.findUnique({
    where: { id: loiId },
    include: { unit: { select: { id: true, title: true } } },
  });

  if (!loi || loi.status !== "SIGNED") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-500">
          서명이 완료된 LOI가 필요합니다.
        </p>
        <Link href="/loi" className="mt-4 inline-block text-sm text-orange-500 hover:underline">
          ← Back to LOI list
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 mb-16 md:mb-0">
      <div className="mb-6">
        <Link
          href={`/loi/${loiId}`}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Back to LOI
        </Link>
        <h1 className="text-xl font-bold text-gray-900 mt-2">New Contract Draft</h1>
      </div>

      <ContractDraftForm
        unitId={loi.unit.id}
        loiId={loiId}
        unitTitle={loi.unit.title}
      />
    </div>
  );
}
