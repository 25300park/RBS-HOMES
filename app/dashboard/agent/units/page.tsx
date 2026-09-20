export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Bell, Building2, ChevronLeft } from "lucide-react";
import LogoutButton from "../components/logout-button";
import BottomNav from "../components/bottom-nav";
import PropertyUnitsTable from "../components/property-units-table";
import prisma from "@/lib/prisma";

export default async function AgentUnitsManagementPage() {
  let session: any = await getServerSession(authOptions as any);
  const currentUserId = session?.user?.id ? Number(session.user.id) : 187;

  const displayName = session?.user?.name || "TES (Senior Broker)";

  const unitsRaw = await prisma.unit.findMany({
    where: {
      OR: [
        { agentId: currentUserId },
        { adminId: currentUserId },
      ],
    },
    select: {
      id: true,
      title: true,
      type: true,
      sellType: true,
      status: true,
      price: true,
      area: true,
      bed: true,
      bath: true,
      address1: true,
      address2: true,
      address3: true,
      fullAddress: true,
      ownerName: true,
      ownerMobile: true,
      ownerEmail: true,
      images: true,
      regdate: true,
      lastUpdate: true,
      viewCount: true,
      note: true,
      agent: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      contractUploads: {
        select: {
          id: true,
          pdfUrl: true,
          createdAt: true,
        },
        take: 5,
      },
      loiDocuments: {
        select: {
          id: true,
          status: true,
          signedAt: true,
          createdAt: true,
        },
        take: 5,
      },
    },
    orderBy: { regdate: "desc" },
  });

  const units = unitsRaw.map(u => ({
    ...u,
    price: u.price ? u.price.toString() : null,
    regdate: u.regdate ? u.regdate.toISOString() : undefined,
    lastUpdate: u.lastUpdate ? u.lastUpdate.toISOString() : undefined,
    contractUploads: u.contractUploads?.map(c => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
    loiDocuments: u.loiDocuments?.map(l => ({
      ...l,
      signedAt: l.signedAt ? l.signedAt.toISOString() : null,
      createdAt: l.createdAt.toISOString(),
    })),
  }));

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* ── Global GNB Header ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
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

      {/* ── Main Full Page Table Section ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-12 md:pb-24">
        
        {/* Breadcrumbs & Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold mb-1">
              <Link href="/dashboard/agent" className="hover:text-zinc-700">Dashboard</Link>
              <span>/</span>
              <span className="text-zinc-700">Units</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              Property Units Management
            </h1>
          </div>
        </div>

        {/* Full Interactive Table Component (Always Expanded) */}
        <PropertyUnitsTable
          initialUnits={units}
          agentName={session?.user?.name ?? undefined}
          isCollapsible={false}
          defaultExpanded={true}
          title="All Managed Properties"
        />

      </main>

      <BottomNav />
    </div>
  );
}