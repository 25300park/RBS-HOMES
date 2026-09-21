export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Heart, Calendar, MessageSquare } from "lucide-react";
import LogoutButton from "./components/logout-button";
import BottomNav from "./components/bottom-nav";
import { ConciergeMessageWidget } from "@/components/dashboard/concierge-message-widget";

export default async function BuyerDashboardPage() {
  let session: any = await getServerSession(authOptions as any);
  if (!session?.user?.id) {
    session = {
      user: {
        id: "1",
        name: "Prospective Buyer Demo",
        email: "buyer@demo.com",
        image: "/assets/images/default-avatar.png",
      },
    };
  }

  const userId = Number(session.user.id);
  const userLevel = Number(session?.user?.level ?? 1);
  const isStaff = userLevel === 0 || userLevel === 20 || userLevel === 30;

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
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* ── Global GNB Header (Same as Main Page) ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 h-18 sm:h-16 flex items-center justify-between">
          
          {/* Brand Logo - Official RBS Logo */}
          <Link href="/" className="flex items-center">
            <img
              src="/assets/images/rbs-logo.png"
              alt="RBS Homes"
              className="h-9 sm:h-8 w-auto object-contain"
            />
          </Link>

          {/* Center: Dashboard Switcher Links */}
          <nav className="flex md:hidden items-center bg-zinc-100/80 p-1.5 rounded-xl border border-zinc-200/60 text-xs font-bold text-zinc-600">
            {isStaff && (
              <Link
                href="/dashboard/staff"
                className="hover:text-blue-600 px-3 py-1.5 rounded-lg transition-colors"
              >
                Staff
              </Link>
            )}
            <Link
              href="/dashboard/landlord"
              className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg transition-colors"
            >
              Owner
            </Link>
            <Link
              href="/dashboard/tenant"
              className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg transition-colors"
            >
              Tenant
            </Link>
            <Link
              href="/dashboard/agent"
              className="hover:text-blue-600 px-3.5 py-1.5 rounded-lg transition-colors"
            >
              Agent
            </Link>
            <Link
              href="/dashboard/buyer"
              className="bg-blue-600 text-white px-4 py-1.5 rounded-lg shadow-sm transition-all"
            >
              Buyer
            </Link>
          </nav>

          {/* Right: Quick Actions & Profile */}
          <div className="flex items-center gap-4 sm:gap-3">
            <Link
              href="/unit/buy"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all active:scale-98"
            >
              <Heart className="w-4 h-4" />
              <span>Explore Condos</span>
            </Link>
            <LogoutButton />
          </div>

        </div>
      </header>

      {/* ── Main Dashboard Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-8 md:pb-24">

        {/* Top Welcome Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-5 shadow-sm border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-xl font-black text-zinc-900 tracking-tight">
                Hello, {session?.user?.name ?? "Buyer"}
              </h1>
              <span className="bg-blue-50 text-blue-700 text-xs sm:text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-blue-200/60">
                Verified Buyer
              </span>
            </div>
            <p className="text-sm sm:text-xs text-zinc-500 mt-1">
              Track your saved properties, scheduled visits, and direct agent inquiries.
            </p>
          </div>

          <Link
            href="/unit/buy"
            className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all self-start sm:self-auto"
          >
            Browse Units for Sale →
          </Link>
        </div>

        {/* 4-col Responsive Section Grid with Concierge Desk */}
        <div className="grid grid-cols-4 lg:grid-cols-2 md:grid-cols-1 gap-6">

          {/* RBS Dedicated Buyer Advisor Widget */}
          <ConciergeMessageWidget
            userRole="buyer"
            managerName="Clara Benitez"
            managerRole="RBS Premier Property Advisor"
          />

          {/* Card 1: Saved Properties */}
          <div className="bg-white rounded-2xl p-6 sm:p-5 shadow-sm border border-zinc-200/80 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                  <Heart className="w-4 h-4 fill-rose-500" />
                </div>
                <span className="text-xs font-extrabold text-zinc-900">Saved Units</span>
              </div>
              <span className="text-[10px] font-bold text-zinc-400">Wishlist</span>
            </div>

            <div>
              <span className="text-4xl sm:text-3xl font-black text-zinc-900">{favorites.length}</span>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                {favorites.length > 0 ? "Properties bookmarked for comparison" : "No saved units yet"}
              </p>
            </div>

            <Link
              href="/account/unit/favorites"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center shadow-md shadow-blue-600/20 active:scale-98 transition-all"
            >
              {favorites.length > 0 ? "View Saved Properties →" : "Explore Properties →"}
            </Link>
          </div>

          {/* Card 2: Scheduled Visits */}
          <div className="bg-white rounded-2xl p-6 sm:p-5 shadow-sm border border-zinc-200/80 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-xs font-extrabold text-zinc-900">Scheduled Tours</span>
              </div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Confirmed</span>
            </div>

            <div>
              <span className="text-4xl sm:text-3xl font-black text-blue-600">{scheduleCount}</span>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                {scheduleCount > 0 ? "Upcoming on-site property viewings" : "No scheduled visits yet"}
              </p>
            </div>

            <Link
              href="/account/schedule"
              className="w-full bg-[#1d4ed8] hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center shadow-md shadow-blue-600/20 active:scale-98 transition-all"
            >
              Check Visit Calendar →
            </Link>
          </div>

          {/* Card 3: Direct Inquiries */}
          <div className="bg-white rounded-2xl p-6 sm:p-5 shadow-sm border border-zinc-200/80 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-xs font-extrabold text-zinc-900">Agent Inquiries</span>
              </div>
              <span className="text-[10px] font-bold text-zinc-400">Consultation</span>
            </div>

            <div>
              <span className="text-4xl sm:text-3xl font-black text-zinc-900">{contacts.length}</span>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                {contacts.length > 0 ? "Active inquiries with verified brokers" : "No inquiry records found"}
              </p>
            </div>

            <Link
              href="/dashboard/buyer/inquiries"
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center shadow-sm active:scale-98 transition-all"
            >
              View Inquiries →
            </Link>
          </div>

        </div>

      </main>

      <BottomNav />
    </div>
  );
}
