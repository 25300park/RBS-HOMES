"use client";

import React, { useState } from "react";
import { X, Truck, Wrench, Package, UserCheck, Calendar, Clock, CheckCircle2, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GatepassModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitTitle?: string;
  condoName?: string;
}

type PassType = "delivery" | "worker" | "move" | "visitor";

export function GatepassModal({
  isOpen,
  onClose,
  unitTitle = "Two Serendra #1204",
  condoName = "Two Serendra BGC",
}: GatepassModalProps) {
  const { toast } = useToast();
  const [passType, setPassType] = useState<PassType>("delivery");
  const [personName, setPersonName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [visitTime, setVisitTime] = useState("14:00");
  const [itemsDesc, setItemsDesc] = useState("");
  const [submittedPass, setSubmittedPass] = useState<any>(null);

  if (!isOpen) return null;

  const passTypes = [
    { id: "delivery" as PassType, label: "Delivery", desc: "Furniture & Large Parcels", icon: Truck, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { id: "worker" as PassType, label: "Worker", desc: "Maintenance & Repairs", icon: Wrench, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { id: "move" as PassType, label: "Move-in/Out", desc: "Bulky Item Pull-out", icon: Package, color: "text-purple-600 bg-purple-50 border-purple-200" },
    { id: "visitor" as PassType, label: "Visitor", desc: "Guest & Parking Pass", icon: UserCheck, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) {
      toast({
        title: "Required Field",
        description: "Please enter the visitor or courier name.",
        variant: "destructive",
      });
      return;
    }

    const passCode = `GP-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedPass({
      code: passCode,
      type: passType.toUpperCase(),
      unit: unitTitle,
      condo: condoName,
      name: personName,
      company: companyName || "N/A",
      date: visitDate,
      time: visitTime,
      items: itemsDesc || "Standard authorized entry",
    });

    toast({
      title: "Gatepass Requested Successfully!",
      description: `Gatepass ${passCode} is submitted to ${condoName} admin.`,
    });
  };

  const handleReset = () => {
    setSubmittedPass(null);
    setPersonName("");
    setCompanyName("");
    setItemsDesc("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-zinc-200/80 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submittedPass ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold mb-2">
                🏢 {condoName}
              </div>
              <h3 className="text-lg sm:text-xl font-black text-zinc-900">
                Request Condo Gatepass
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5 font-medium">
                Submit gate clearance for delivery vehicles, contractors, or guest entry for {unitTitle}.
              </p>
            </div>

            {/* Pass Type Grid */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-2">
                Pass Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {passTypes.map((pt) => {
                  const Icon = pt.icon;
                  const isSelected = passType === pt.id;
                  return (
                    <button
                      type="button"
                      key={pt.id}
                      onClick={() => setPassType(pt.id)}
                      className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-zinc-700 border-zinc-200 hover:border-blue-300"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-bold leading-tight truncate w-full">{pt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Personnel / Courier Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="e.g. John Santos"
                  className="w-full border border-zinc-200 rounded-xl h-10 px-3 text-xs outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Company / Vehicle Plate
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Lalamove (ABC-1234)"
                  className="w-full border border-zinc-200 rounded-xl h-10 px-3 text-xs outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Expected Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl h-10 px-3 text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Estimated Time
                </label>
                <input
                  type="time"
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="w-full border border-zinc-200 rounded-xl h-10 px-3 text-xs outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Items Description */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Items or Scope of Work
              </label>
              <textarea
                rows={2}
                value={itemsDesc}
                onChange={(e) => setItemsDesc(e.target.value)}
                placeholder="e.g. Dining table delivery, aircon cleaning tools"
                className="w-full border border-zinc-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 active:scale-98 transition-all"
              >
                Submit Gatepass Request →
              </button>
            </div>
          </form>
        ) : (
          /* Confirmation / QR Pass View */
          <div className="text-center py-2 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
                Gatepass Approved & Issued
              </span>
              <h3 className="text-xl font-black text-zinc-900 mt-2">
                Pass Code: {submittedPass.code}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Show this digital gatepass or QR code to the lobby security guard at {submittedPass.condo}.
              </p>
            </div>

            {/* Pass Card Preview */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-zinc-200/60 pb-2">
                <span className="text-zinc-500 font-semibold">Unit</span>
                <span className="font-bold text-zinc-900">{submittedPass.unit}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200/60 pb-2">
                <span className="text-zinc-500 font-semibold">Personnel</span>
                <span className="font-bold text-zinc-900">{submittedPass.name} ({submittedPass.company})</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200/60 pb-2">
                <span className="text-zinc-500 font-semibold">Date & Time</span>
                <span className="font-bold text-zinc-900">{submittedPass.date} @ {submittedPass.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-semibold">Category</span>
                <span className="font-extrabold text-blue-600 uppercase">{submittedPass.type}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition-colors"
            >
              Done / Close Gatepass
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
