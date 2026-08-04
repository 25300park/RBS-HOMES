export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Heart, Calendar, MessageSquare } from "lucide-react";
import LogoutButton from "./components/logout-button";
import BottomNav from "./components/bottom-nav";

export default async function BuyerDashboardPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) redirect("/");

  const userId = Number(session.user.id);

  const [favorites, scheduleCount, contacts] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.schedule.count({
      where: { userId, status: 2, date: { not: null } },
    }),
    prisma.contact.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="bg-zinc-50 min-h-screen text-zinc-800 pb-28 md:pb-20">
      <main className="max-w-[1140px] mx-auto px-4 py-6 sm:py-8 space-y-6">

        {/* Welcome card */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-zinc-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
              Hello, {session.user.name ?? "Guest"}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Track your saved properties, scheduled visits, and inquiries.
            </p>
          </div>
          <div className="flex items-center justify-between sm:justify-end space-x-2">
            <span className="bg-[#0E5246]/10 text-[#0E5246] text-xs font-bold px-3 py-1.5 rounded-full border border-[#0E5246]/20">
              Buyer Level 1
            </span>
            <LogoutButton />
          </div>
        </div>

        {/* 3-col section grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Saved properties */}
          <section className="bg-white border border-zinc-200 shadow-2xs rounded-xl p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-center space-x-2 border-b border-zinc-100 pb-3">
              <Heart className="w-4 h-4 text-[#0E5246]" />
              <span className="text-xs font-bold text-[#0E5246] uppercase tracking-widest">Saved</span>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
              <span className="text-2xl sm:text-3xl font-black text-zinc-900">{favorites.length}</span>
              <p className="text-xs text-zinc-500 mt-1">Saved properties</p>
            </div>
            <Link
              href="/account/unit/favorites"
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center shadow-2xs transition-all"
            >
              View All →
            </Link>
          </section>

          {/* Scheduled visits */}
          <section className="bg-white border border-zinc-200 shadow-2xs rounded-xl p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-center space-x-2 border-b border-zinc-100 pb-3">
              <Calendar className="w-4 h-4 text-[#0E5246]" />
              <span className="text-xs font-bold text-[#0E5246] uppercase tracking-widest">Visits</span>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
              <span className="text-2xl sm:text-3xl font-black text-[#0E5246]">{scheduleCount}</span>
              <p className="text-xs text-zinc-500 mt-1">Confirmed visits (status=2)</p>
            </div>
            <Link
              href="/account/schedule"
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center shadow-2xs transition-all"
            >
              View All →
            </Link>
          </section>

          {/* Inquiries */}
          <section className="bg-white border border-zinc-200 shadow-2xs rounded-xl p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-center space-x-2 border-b border-zinc-100 pb-3">
              <MessageSquare className="w-4 h-4 text-[#0E5246]" />
              <span className="text-xs font-bold text-[#0E5246] uppercase tracking-widest">Inquiries</span>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
              <span className="text-2xl sm:text-3xl font-black text-zinc-900">{contacts.length}</span>
              <p className="text-xs text-zinc-500 mt-1">Submitted inquiries</p>
            </div>
            <Link
              href="/dashboard/buyer/inquiries"
              className="w-full bg-[#0E5246] hover:bg-[#0B4339] text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center shadow-2xs transition-all"
            >
              View Details →
            </Link>
          </section>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}
