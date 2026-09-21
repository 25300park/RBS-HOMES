"use client";

import React, { useState } from "react";
import { AlertTriangle, Wrench, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { CareApprovalModal } from "@/components/dashboard/care-approval-modal";

interface LandlordCareApprovalCardProps {
  pendingCount?: number;
}

export function LandlordCareApprovalCard({
  pendingCount = 1,
}: LandlordCareApprovalCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200/80 rounded-2xl p-6 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base sm:text-sm font-extrabold text-zinc-900">
                Repair Cost Approvals
              </h3>
              <p className="text-[11px] text-amber-800 font-semibold">
                {isApproved ? "0 Quotations Pending" : "1 Quotation Awaiting Authorization"}
              </p>
            </div>
          </div>

          <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border ${
            isApproved ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-amber-100 text-amber-800 border-amber-300"
          }`}>
            {isApproved ? "All Approved" : "Action Needed"}
          </span>
        </div>

        {!isApproved ? (
          <div className="bg-white/90 backdrop-blur-xs border border-amber-200/80 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-extrabold text-zinc-900 block text-sm sm:text-xs">Two Serendra #1204</span>
                <span className="text-[11px] text-zinc-500 font-medium">Plumbing & Faucet Replacement (Sophia M.)</span>
              </div>
              <span className="font-black text-blue-600 text-base sm:text-sm">₱6,500</span>
            </div>

            <p className="text-[11px] text-zinc-600 leading-relaxed bg-zinc-50 p-2 rounded-lg border border-zinc-200/60">
              Kitchen sink seal gasket & copper fitting replacement. Verified vendor assigned.
            </p>

            <div className="flex items-center justify-between pt-1 text-[11px]">
              <a
                href="/dashboard/contracts"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-bold underline flex items-center gap-1"
              >
                <span>📄 Quotation PDF (Document Vault)</span>
                <span>↗</span>
              </a>
              <span className="text-zinc-400">Submitted by Sophia Martinez</span>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="w-full mt-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1 active:scale-98"
            >
              <span>Review & Authorize Quotation</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3 text-xs text-emerald-800 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>₱6,500 repair authorized. Work in progress by RBS Care Team.</span>
          </div>
        )}
      </div>

      <CareApprovalModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onApproved={() => setIsApproved(true)}
      />
    </>
  );
}
