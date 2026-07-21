export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCondoPosts } from "@/lib/community/get-condo-posts";

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: { condoId?: string };
}) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) redirect("/");

  const condoId = searchParams.condoId ? Number(searchParams.condoId) : null;

  const posts = condoId ? await getCondoPosts(condoId) : [];

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC]">
      <div className="max-w-[640px] mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Back link */}
        <div>
          <Link
            href="/dashboard/tenant"
            className="flex items-center gap-1 text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        <h1 className="text-xl font-bold text-[#F8FAFC]">Community Board</h1>

        {!condoId ? (
          <div className="flex items-center justify-center h-20 border border-dashed border-[#334155] rounded-xl text-sm text-[#94A3B8]">
            소속 콘도 정보가 없습니다.
          </div>
        ) : posts.length === 0 ? (
          <div className="flex items-center justify-center h-20 border border-dashed border-[#334155] rounded-xl text-sm text-[#94A3B8]">
            No posts yet.
          </div>
        ) : (
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl divide-y divide-[#334155] overflow-hidden">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {post.isNotice && (
                      <span className="text-xs px-1.5 py-0.5 bg-[#3B82F6]/15 text-[#3B82F6] rounded font-medium flex-shrink-0">
                        Notice
                      </span>
                    )}
                    <p className="font-medium text-sm text-[#F8FAFC] truncate">{post.title}</p>
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-0.5">{post.author.name}</p>
                </div>
                <span className="text-xs text-[#94A3B8] flex-shrink-0">
                  {new Date(post.createdAt).toLocaleDateString("en-US")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
