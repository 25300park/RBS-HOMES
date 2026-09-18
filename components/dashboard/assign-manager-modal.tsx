"use client";

import React, { useState } from "react";
import {
  X,
  UserCheck,
  ShieldCheck,
  Building2,
  FileText,
  CheckCircle2,
  Search,
  Sparkles,
  Phone,
  Mail,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MrHomesStaff {
  id: number;
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  assignedCondos: string[];
  avatarText: string;
}

const defaultStaffList: MrHomesStaff[] = [
  {
    id: 101,
    name: "Sarah Jenkins",
    role: "Senior Asset & Care Manager",
    department: "BGC & Taguig Asset Team",
    phone: "+63 917 888 1234",
    email: "sarah.jenkins@mrhomes.com",
    assignedCondos: ["Two Serendra", "One Serendra", "Uptown Parksuites"],
    avatarText: "SJ",
  },
  {
    id: 102,
    name: "David Vance",
    role: "Broker Relations & Escrow Lead",
    department: "Makati & Ortigas Commercial",
    phone: "+63 917 888 5678",
    email: "david.vance@mrhomes.com",
    assignedCondos: ["The Proscenium Rockwell", "Discovery Primea", "Greenbelt Residences"],
    avatarText: "DV",
  },
  {
    id: 103,
    name: "Clara Benitez",
    role: "Premier Property & VIP Advisor",
    department: "VIP Concierge Division",
    phone: "+63 917 888 9012",
    email: "clara.benitez@mrhomes.com",
    assignedCondos: ["Aura Grand", "Arya Residences", "Shangri-La at the Fort"],
    avatarText: "CB",
  },
  {
    id: 104,
    name: "Jacob Jones",
    role: "Property Care & Technical Lead",
    department: "Care & Maintenance Ops",
    phone: "+63 917 888 3456",
    email: "jacob.jones@mrhomes.com",
    assignedCondos: ["All BGC / Makati Fast-Track Units"],
    avatarText: "JJ",
  },
];

interface AssignManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType?: "contract" | "condo";
  targetTitle?: string;
  currentManagerName?: string;
  onManagerAssigned?: (staff: MrHomesStaff) => void;
}

export function AssignManagerModal({
  isOpen,
  onClose,
  targetType = "contract",
  targetTitle = "Two Serendra #1204 (RBS-LEASE-2026-089)",
  currentManagerName = "Sarah Jenkins",
  onManagerAssigned,
}: AssignManagerModalProps) {
  const { toast } = useToast();
  const [selectedStaffId, setSelectedStaffId] = useState<number>(101);
  const [assignmentScope, setAssignmentScope] = useState<"current" | "condo_all">("current");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const filteredStaff = defaultStaffList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    setIsSaving(true);
    const chosenStaff = defaultStaffList.find((s) => s.id === selectedStaffId) || defaultStaffList[0];

    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Mr. Homes Dedicated Manager Assigned",
        description: `${chosenStaff.name} (${chosenStaff.role}) is now assigned to ${
          assignmentScope === "condo_all" ? "the entire condo master" : targetTitle
        }.`,
      });
      if (onManagerAssigned) {
        onManagerAssigned(chosenStaff);
      }
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-zinc-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                Assign Mr. Homes Dedicated Manager
              </h3>
              <p className="text-xs text-blue-200/90 font-medium">
                Designate an official company coordinator for contracts & properties
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Target Banner */}
          <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block">
                  Target Property / Lease
                </span>
                <span className="text-xs sm:text-sm font-black text-zinc-900">{targetTitle}</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-zinc-500 bg-white px-2.5 py-1 rounded-lg border border-zinc-200">
              Current: {currentManagerName}
            </span>
          </div>

          {/* Scope Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
              Assignment Scope
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAssignmentScope("current")}
                className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 ${
                  assignmentScope === "current"
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>This Contract Only</span>
              </button>

              <button
                type="button"
                onClick={() => setAssignmentScope("condo_all")}
                className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 ${
                  assignmentScope === "condo_all"
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Entire Condo Master</span>
              </button>
            </div>
          </div>

          {/* Staff Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Mr. Homes staff by name or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-semibold outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          {/* Staff List */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
              Select Official Staff Member
            </label>
            {filteredStaff.map((staff) => {
              const isSelected = selectedStaffId === staff.id;
              return (
                <div
                  key={staff.id}
                  onClick={() => setSelectedStaffId(staff.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-blue-50/90 border-blue-600 ring-2 ring-blue-600/20 shadow-xs"
                      : "bg-white border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-xs shadow-xs ${
                        isSelected ? "bg-blue-600 text-white" : "bg-zinc-200 text-zinc-700"
                      }`}
                    >
                      {staff.avatarText}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-extrabold text-zinc-900">
                          {staff.name}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700">
                          Official Staff
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-medium">{staff.role}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{staff.department}</p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-300"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 bg-zinc-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 active:scale-98 transition-all flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating Manager...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Confirm & Assign Manager</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
