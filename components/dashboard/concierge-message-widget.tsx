"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageSquare, ShieldCheck, Headphones, ArrowUpRight, UserCheck, RefreshCw } from "lucide-react";
import { AssignManagerModal } from "./assign-manager-modal";
import { FloatingLiveChat } from "@/components/chat/floating-live-chat";

interface ConciergeMessageWidgetProps {
  userRole: "tenant" | "landlord" | "agent" | "buyer";
  managerName?: string;
  managerRole?: string;
  managerAvatar?: string;
  targetTitle?: string;
  isOnline?: boolean;
}

export function ConciergeMessageWidget({
  userRole,
  managerName: initialManagerName = "Sarah Jenkins",
  managerRole: initialManagerRole = "Mr. Homes Senior Asset & Care Manager",
  managerAvatar = "/assets/images/default-avatar.png",
  targetTitle = "Two Serendra #1204 (RBS-LEASE-2026-089)",
  isOnline = true,
}: ConciergeMessageWidgetProps) {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentManager, setCurrentManager] = useState({
    name: initialManagerName,
    role: initialManagerRole,
    avatarText: initialManagerName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "SJ",
  });

  const roleBadges: Record<string, { label: string; desc: string; badgeColor: string }> = {
    tenant: {
      label: "Tenant Concierge",
      desc: "Instant help for maintenance, gatepasses, condo amenities, and lease inquiries.",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    },
    landlord: {
      label: "Asset Manager",
      desc: "Direct support for rent remittances, tax receipts, tenant screening, and repair approvals.",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200/60",
    },
    agent: {
      label: "Broker Desk",
      desc: "Assistance with co-brokerage commissions, escrow verification, and listing boosts.",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200/60",
    },
    buyer: {
      label: "Property Advisor",
      desc: "Personalized guidance for condo viewings, bank loan approvals, and title transfers.",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200/60",
    },
  };

  const currentInfo = roleBadges[userRole] || roleBadges.tenant;

  return (
    <>
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
          {/* Header Badge & Quick Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <Headphones className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                {currentInfo.label}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(true)}
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-blue-200 border border-white/15 transition-colors cursor-pointer"
                title="Change or reassign Mr. Homes dedicated manager for this contract/condo"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Reassign Manager</span>
              </button>

              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>
          </div>

          {/* Manager Profile Info */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-full bg-zinc-200 border-2 border-white overflow-hidden shadow-sm flex items-center justify-center text-zinc-700 font-extrabold text-sm">
                {currentManager.avatarText}
              </div>
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-sm" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-extrabold text-white truncate">{currentManager.name}</h4>
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              </div>
              <p className="text-[11px] text-blue-200/90 truncate font-medium">{currentManager.role}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-zinc-300 leading-relaxed font-medium">
            {currentInfo.desc}
          </p>

          {/* Action Button: Opens Live Chat Popup */}
          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-md shadow-blue-900/40 flex items-center justify-center gap-2 transition-all active:scale-98 group cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat with Assigned Manager</span>
            <ArrowUpRight className="w-4 h-4 text-blue-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Floating Live Chat Popup Widget */}
      <FloatingLiveChat
        managerName={currentManager.name}
        managerRole={currentManager.role}
        userRole={userRole}
        unitTitle={targetTitle}
        isOpen={isChatOpen}
        onOpenChange={setIsChatOpen}
      />

      {/* Assign Manager Modal */}
      <AssignManagerModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        targetTitle={targetTitle}
        currentManagerName={currentManager.name}
        onManagerAssigned={(staff) => {
          setCurrentManager({
            name: staff.name,
            role: staff.role,
            avatarText: staff.avatarText,
          });
        }}
      />
    </>
  );
}

