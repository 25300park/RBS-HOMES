export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Bell, Building2, ChevronLeft, Calendar } from "lucide-react";
import LogoutButton from "../components/logout-button";
import BottomNav from "../components/bottom-nav";
import TourRequestsClient, { TourRequestItem } from "../components/tour-requests-client";
import prisma from "@/lib/prisma";
import { parseImages } from "@/lib/utils";

export default async function TourRequestsPage() {
  let session: any = await getServerSession(authOptions as any);
  const currentUserId = session?.user?.id ? Number(session.user.id) : 187;
  const displayName = session?.user?.name || "TES (Senior Broker)";

  // 1. Get current agent's managed unit IDs
  const agentUnits = await prisma.unit.findMany({
    where: {
      OR: [
        { agentId: currentUserId },
        { adminId: currentUserId },
      ],
    },
    select: {
      id: true,
      title: true,
      fullAddress: true,
      address2: true,
      price: true,
      sellType: true,
      images: true,
    },
  });

  const unitIds = agentUnits.map(u => u.id);
  const unitMap = new Map(agentUnits.map(u => [u.id, u]));

  // 2. Query Tour Requests for agent's units or assigned to current agent
  const rawTourRequests = await prisma.schedule.findMany({
    where: {
      OR: [
        { unitId: { in: unitIds.length > 0 ? unitIds : [1863, 1864, 1865] } },
        { userId: currentUserId },
      ],
    },
    orderBy: { regdate: "desc" },
    take: 50,
  });

  const tourRequests: TourRequestItem[] = rawTourRequests.map(item => {
    const targetUnit = item.unitId ? unitMap.get(item.unitId) : null;
    let unitImage: string | null = null;
    if (targetUnit?.images) {
      const parsed = parseImages(targetUnit.images);
      if (parsed.length > 0) {
        unitImage = typeof parsed[0] === "string" ? parsed[0] : null;
      } else if (typeof targetUnit.images === "string") {
        // parseImages가 JSON 파싱에 실패한 경우 — 원본 문자열이 이미
        // (JSON이 아닌) 순수 URL 그 자체일 가능성을 대비한 기존 폴백 유지
        unitImage = targetUnit.images;
      }
    }

    return {
      id: item.id,
      unitId: item.unitId,
      unitTitle: targetUnit?.title || (item.title ? item.title : "Tour Request"),
      unitAddress: targetUnit?.address2 || targetUnit?.fullAddress || item.location || "Metro Manila",
      unitPrice: targetUnit?.price ? targetUnit.price.toString() : null,
      unitSellType: targetUnit?.sellType || "Rent",
      unitImage: unitImage || "/assets/images/cities/BGC.png",
      username: item.username || item.desc || "Client",
      email: item.email || null,
      mobile: item.mobile || null,
      desc: item.desc || null,
      requestDate: item.requestDate ? item.requestDate.toISOString() : null,
      date: item.date ? item.date.toISOString() : null,
      status: item.status, // 0: Pending, 1: Review, 2: Confirmed, 3: Cancelled
      regdate: item.regdate ? item.regdate.toISOString() : null,
    };
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* ── Global GNB Header ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[72px] sm:h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              href="/dashboard/agent"
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>

            <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

            <Link href="/" className="flex items-center shrink-0">
              <img
                src="/assets/images/rbs-logo.png"
                alt="RBS Homes"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Right Header Navigation & Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/account/unit/registration/step-one"
              className="flex md:hidden items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20"
            >
              <span>+ Post Property</span>
            </Link>

            <Link
              href="/account/notifications"
              className="p-2 rounded-xl text-zinc-500 hover:text-blue-600 hover:bg-blue-50 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </Link>

            <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <img
                src={session?.user?.image || "/assets/images/default-avatar.png"}
                alt="Profile"
                className="w-8 h-8 rounded-full border border-zinc-200 object-cover"
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-extrabold text-zinc-900 leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] text-blue-600 font-bold leading-tight">
                  Licensed Broker
                </span>
              </div>
            </div>

            <LogoutButton />
          </div>
        </div>
      </header>

      {/* ── Main Full Page Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-12 md:pb-24">
        
        {/* Breadcrumbs & Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold mb-1">
              <Link href="/dashboard/agent" className="hover:text-zinc-700">Dashboard</Link>
              <span>/</span>
              <span className="text-zinc-700">Tour Requests</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              Tour Booking Queue
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">
              Review and confirm prospective client inspection requests for your listings.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/account/schedule"
              className="flex items-center gap-1.5 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold px-3.5 py-2 rounded-xl border border-zinc-200/90 shadow-2xs transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>View Timetable</span>
            </Link>
          </div>
        </div>

        {/* ── Interactive Tour Requests Client Component ── */}
        <TourRequestsClient initialTourRequests={tourRequests} />

      </main>

      {/* ── Mobile Bottom Navigation Bar (Hidden on Desktop/Tablet >= 768px) ── */}
      <BottomNav />

    </div>
  );
}
