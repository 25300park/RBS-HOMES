"use client";

import React, { useState } from "react";
import { X, CheckCircle, AlertTriangle, FileText, Wrench, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CareApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestData?: {
    id: number;
    unitTitle: string;
    tenantName: string;
    type: string;
    description: string;
    estimatedCost: number;
    vendor: string;
  };
  onApproved?: () => void;
}

export function CareApprovalModal({
  isOpen,
  onClose,
  requestData = {
    id: 101,
    unitTitle: "Two Serendra #1204",
    tenantName: "Sophia Martinez",
    type: "Plumbing & Faucet Replacement",
    description: "Kitchen sink water leak causing cabinet moisture. Requires copper pipe fitting replacement and seal gasket.",
    estimatedCost: 6500,
    vendor: "RBS Verified Handyman Services",
  },
  onApproved,
}: CareApprovalModalProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleApprove = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Repair Cost Approved",
        description: `₱${requestData.estimatedCost.toLocaleString()} authorized. Contractor has been dispatched.`,
      });
      if (onApproved) onApproved();
      onClose();
    }, 600);
  };

  const handleReject = () => {
    toast({
      title: "Quotation Rejected",
      description: "Requested alternative quotation from RBS Property Care Team.",
      variant: "destructive",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-200/80 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-5">
          {/* Header */}
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Landlord Approval Required
            </span>
            <h3 className="text-lg font-black text-zinc-900">
              Care & Repair Quotation
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Review and approve maintenance expense for {requestData.unitTitle}.
            </p>
          </div>

          {/* Cost Highlight Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">
                Estimated Cost
              </span>
              <div className="text-2xl sm:text-3xl font-black text-blue-900 mt-0.5">
                ₱{requestData.estimatedCost.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-semibold text-zinc-500 block">Charged to</span>
              <span className="text-xs font-bold text-zinc-800">Owner Reserve</span>
            </div>
          </div>

          {/* Breakdown Details */}
          <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-zinc-200/60 pb-2">
              <span className="text-zinc-500 font-semibold">Service Type</span>
              <span className="font-bold text-zinc-900 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                {requestData.type}
              </span>
            </div>
            <div className="flex justify-between border-b border-zinc-200/60 pb-2">
              <span className="text-zinc-500 font-semibold">Tenant</span>
              <span className="font-bold text-zinc-900">{requestData.tenantName}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200/60 pb-2">
              <span className="text-zinc-500 font-semibold">Assigned Vendor</span>
              <span className="font-bold text-zinc-900">{requestData.vendor}</span>
            </div>
            <div className="pt-1">
              <span className="text-zinc-500 font-semibold block mb-1">Issue Description</span>
              <p className="text-zinc-700 leading-relaxed bg-white p-2.5 rounded-xl border border-zinc-200/60 text-[11px]">
                {requestData.description}
              </p>
            </div>

            {/* Document Vault Link */}
            <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between bg-blue-50/70 p-2.5 rounded-xl border border-blue-200/60">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="font-extrabold text-zinc-900 block text-[11px]">
                    Official Vendor Quotation PDF
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    Uploaded to Contracts & LOI Vault
                  </span>
                </div>
              </div>
              <a
                href="/dashboard/contracts"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs transition-all hover:bg-blue-50"
              >
                <span>문서함에서 보기</span>
                <span className="text-xs">↗</span>
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={handleReject}
              className="w-full py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              Request Re-quote
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleApprove}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{isProcessing ? "Authorizing..." : "Approve ₱" + requestData.estimatedCost.toLocaleString()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
