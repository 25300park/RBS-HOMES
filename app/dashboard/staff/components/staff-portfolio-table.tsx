"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  User,
  Phone,
  FileText,
  Upload,
  CreditCard,
  Wrench,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface ManagedPortfolioItem {
  id: string;
  unitTitle: string;
  condoName: string;
  unitNumber: string;
  tenantName: string;
  tenantPhone: string;
  landlordName: string;
  landlordPhone: string;
  monthlyRent: number;
  rentPaymentStatus: "PAID" | "PENDING" | "AWAITING_APPROVAL" | "OVERDUE" | "—";
  duesStatus: "PAID" | "PENDING" | "OVERDUE" | "—";
  contractPeriod: string;
  activeCareCount: number;
  hasContractDoc: boolean;
  hasLoiDoc: boolean;
}

interface StaffPortfolioTableProps {
  items: ManagedPortfolioItem[];
}

export default function StaffPortfolioTable({ items }: StaffPortfolioTableProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.unitTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.landlordName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.condoName.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "ALL") return matchesSearch;
    if (statusFilter === "CARE") return matchesSearch && item.activeCareCount > 0;
    if (statusFilter === "PENDING_RENT") return matchesSearch && item.rentPaymentStatus === "PENDING";
    return matchesSearch;
  });

  const handleUploadClick = (unitTitle: string) => {
    toast({
      title: "Opening Document Uploader",
      description: `Targeting ${unitTitle} for Contract/LOI PDF upload.`,
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-zinc-200/80 overflow-hidden font-sans">
      
      {/* Table Header & Search Filter */}
      <div className="p-5 sm:p-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-base font-black text-zinc-900">
              Managed Properties & Active Leases
            </h3>
            <span className="text-xs bg-blue-100 text-blue-800 font-extrabold px-2.5 py-0.5 rounded-full">
              {filteredItems.length} Units Active
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time oversight of tenants, landlords, monthly rent remittances, association dues, and legal documents.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search unit, tenant, owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-zinc-100/80 p-1 rounded-xl border border-zinc-200/60 text-xs font-bold text-zinc-600">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === "ALL" ? "bg-white text-zinc-900 shadow-2xs" : "hover:text-blue-600"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("CARE")}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                statusFilter === "CARE" ? "bg-amber-500 text-white shadow-2xs" : "hover:text-amber-600"
              }`}
            >
              <Wrench className="w-3 h-3" />
              <span>Care Active</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-600">
          <thead className="bg-zinc-50/80 text-[11px] font-extrabold uppercase text-zinc-400 tracking-wider border-b border-zinc-100">
            <tr>
              <th className="py-3.5 px-6 sm:px-4">Property & Unit</th>
              <th className="py-3.5 px-4">Resident (Tenant)</th>
              <th className="py-3.5 px-4">Owner (Landlord)</th>
              <th className="py-3.5 px-4">Rent & Dues Status</th>
              <th className="py-3.5 px-4">Care & Vault Docs</th>
              <th className="py-3.5 px-6 sm:px-4 text-right">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-medium">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                
                {/* 1. Property Info */}
                <td className="py-4 px-6 sm:px-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs font-extrabold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-zinc-900 block text-xs sm:text-sm group-hover:text-blue-600 transition-colors">
                        {item.unitTitle}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-medium block">
                        {item.condoName} · {item.contractPeriod}
                      </span>
                      <span className="text-[11px] font-bold text-zinc-700">
                        ₱{item.monthlyRent.toLocaleString()} / mo
                      </span>
                    </div>
                  </div>
                </td>

                {/* 2. Tenant Info */}
                <td className="py-4 px-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item.tenantName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                      <Phone className="w-3 h-3 text-zinc-400" />
                      <span>{item.tenantPhone}</span>
                    </div>
                  </div>
                </td>

                {/* 3. Landlord Info */}
                <td className="py-4 px-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>{item.landlordName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                      <Phone className="w-3 h-3 text-zinc-400" />
                      <span>{item.landlordPhone}</span>
                    </div>
                  </div>
                </td>

                {/* 4. Rent & Association Dues */}
                <td className="py-4 px-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-zinc-400">Rent:</span>
                      {item.rentPaymentStatus === "—" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-400 text-[10px] font-extrabold">
                          —
                        </span>
                      ) : item.rentPaymentStatus === "PAID" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                          <Clock className="w-2.5 h-2.5" /> Pending Check
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-zinc-400">Dues:</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-400 text-[10px] font-bold">
                        {item.duesStatus}
                      </span>
                    </div>
                  </div>
                </td>

                {/* 5. Care & Docs */}
                <td className="py-4 px-4">
                  <div className="space-y-1.5">
                    {item.activeCareCount > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-800 border border-amber-300/40 text-[10px] font-black">
                        <Wrench className="w-3 h-3 text-amber-600" />
                        <span>{item.activeCareCount} Repair Pending</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-zinc-400 font-medium">All Clear</span>
                    )}

                    <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                      <FileText className="w-3 h-3 text-blue-500" />
                      <span>{item.hasContractDoc ? "Contract PDF ✓" : "Drafting"}</span>
                    </div>
                  </div>
                </td>

                {/* 6. Quick Action Buttons */}
                <td className="py-4 px-6 sm:px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href="/dashboard/contracts"
                      onClick={() => handleUploadClick(item.unitTitle)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 hover:border-blue-500 hover:text-blue-600 text-zinc-700 font-bold text-[11px] shadow-2xs transition-all flex items-center gap-1"
                      title="Upload official Contract PDF / LOI to Vault"
                    >
                      <Upload className="w-3 h-3 text-blue-600" />
                      <span>Upload Doc</span>
                    </Link>

                    <Link
                      href="/dashboard/contracts"
                      className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-500 transition-colors"
                      title="View Documents in Vault"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
