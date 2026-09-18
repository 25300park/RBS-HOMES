"use client";

import React, { useState } from "react";
import { GatepassModal } from "@/components/dashboard/gatepass-modal";
import { useToast } from "@/hooks/use-toast";
import { FileText, Truck, ShieldCheck, CheckCircle2, MessageSquare, Download } from "lucide-react";

interface TenantDashboardClientProps {
  unitTitle: string;
  condoName: string;
  monthlyRent: number;
}

export function TenantDashboardClient({
  unitTitle,
  condoName,
  monthlyRent,
}: TenantDashboardClientProps) {
  const { toast } = useToast();
  const [isGatepassOpen, setIsGatepassOpen] = useState(false);
  const [isRequestingOR, setIsRequestingOR] = useState(false);

  const handleRequestOfficialReceipt = () => {
    setIsRequestingOR(true);
    setTimeout(() => {
      setIsRequestingOR(false);
      toast({
        title: "Official Receipt (OR) Requested",
        description: "Sent to your Assigned Broker and General Operations Manager. Our team will verify and reply back to you.",
      });
    }, 500);
  };

  return (
    <>
      {/* Interactive Action Bar for Tenant */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-zinc-900">Condo Gatepass & Delivery Clearance</h4>
            <p className="text-xs text-zinc-500 font-medium">Quick clearance for deliveries, workers, moving vehicles or guests.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleRequestOfficialReceipt}
            disabled={isRequestingOR}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>{isRequestingOR ? "Requesting..." : "Request Tax OR"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsGatepassOpen(true)}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Request Gatepass</span>
          </button>
        </div>
      </div>

      {/* Gatepass Modal */}
      <GatepassModal
        isOpen={isGatepassOpen}
        onClose={() => setIsGatepassOpen(false)}
        unitTitle={unitTitle}
        condoName={condoName}
      />
    </>
  );
}
