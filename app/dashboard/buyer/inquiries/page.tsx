export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getBuyerInquiries } from "@/lib/buyer/get-buyer-inquiries";

const statusLabel: Record<number, { text: string; cls: string }> = {
  0: { text: "접수", cls: "bg-gray-100 text-gray-600" },
  1: { text: "처리 중", cls: "bg-orange-100 text-orange-600" },
  2: { text: "완료", cls: "bg-green-100 text-green-600" },
};

export default async function BuyerInquiriesPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) redirect("/");

  const userId = Number(session.user.id);
  const contacts = await getBuyerInquiries(userId);

  return (
    <div className="max-w-[1140px] mx-auto px-4 py-10 space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/dashboard/buyer"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Dashboard
        </Link>
      </div>

      <h1 className="text-xl font-bold text-gray-800">My Inquiries</h1>

      {contacts.length === 0 ? (
        <div className="flex items-center justify-center h-24 border border-dashed border-gray-200 rounded-lg text-sm text-gray-400">
          문의 내역이 없습니다.
        </div>
      ) : (
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden bg-white">
          {contacts.map((c) => {
            const st = statusLabel[c.status] ?? statusLabel[0];
            return (
              <div key={c.id} className="px-4 py-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-800">{c.message}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(c.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${st.cls}`}>
                    {st.text}
                  </span>
                </div>
                {c.response && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
                    <p className="text-xs font-semibold text-gray-500 mb-1">
                      답변
                      {c.respondedAt && (
                        <span className="ml-2 font-normal">
                          · {new Date(c.respondedAt).toLocaleDateString("ko-KR")}
                        </span>
                      )}
                    </p>
                    <p>{c.response}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
