import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import LoiDetail from "./loi-detail";

export default async function LoiDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) redirect("/");

  const loiId = Number(params.id);
  const callerId = Number(session.user.id);

  const loi = await prisma.loiDocument.findUnique({
    where: { id: loiId },
    include: { unit: { select: { title: true } } },
  });
  if (!loi) notFound();

  const isLandlordSide =
    callerId === loi.landlordId ||
    (loi.landlordBrokerId !== null && callerId === loi.landlordBrokerId);
  const isTenantSide = callerId === loi.tenantBrokerId;

  if (!isLandlordSide && !isTenantSide) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-500">접근 권한이 없습니다.</p>
        <Link
          href="/loi"
          className="mt-4 inline-block text-sm text-orange-500 hover:underline"
        >
          ← Back to LOI list
        </Link>
      </div>
    );
  }

  const viewerRole: "landlord" | "tenant" = isLandlordSide ? "landlord" : "tenant";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 mb-16 md:mb-0">
      <div className="mb-6">
        <Link
          href="/loi"
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Back to LOI list
        </Link>
      </div>
      <LoiDetail loi={loi} viewerRole={viewerRole} />
    </div>
  );
}
