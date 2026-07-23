import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import LoiForm from "./loi-form";

export default async function LoiNewPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) redirect("/");

  const level = Number(session.user.level);
  const userId = Number(session.user.id);

  if (![2, 3].includes(level)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-500">브로커만 작성 가능합니다.</p>
        <Link href="/loi" className="mt-4 inline-block text-sm text-orange-500 hover:underline">
          ← Back to LOI list
        </Link>
      </div>
    );
  }

  const units = await prisma.unit.findMany({
    where: { agentId: userId },
    select: { id: true, title: true, adminId: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 mb-16 md:mb-0">
      <div className="mb-6">
        <Link href="/loi" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Back to LOI list
        </Link>
        <h1 className="text-xl font-bold text-gray-900 mt-2">New Letter of Intent</h1>
      </div>

      <LoiForm units={units} />
    </div>
  );
}
