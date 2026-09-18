"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Building2, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Search, 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle
} from "lucide-react";
import TourActionButtons from "./tour-action-buttons";

export interface TourRequestItem {
  id: number;
  unitId?: number | null;
  unitTitle?: string;
  unitAddress?: string;
  unitPrice?: string | number | null;
  unitSellType?: string | null;
  unitImage?: string | null;
  username?: string | null;
  email?: string | null;
  mobile?: string | null;
  desc?: string | null;
  requestDate?: string | null;
  date?: string | null;
  status: number; // 0: Requested/Pending, 1: Under Review, 2: Confirmed, 3: Cancelled/Declined
  regdate?: string | null;
}

interface TourRequestsClientProps {
  initialTourRequests: TourRequestItem[];
}

const STATUS_CONFIG: Record<number, { label: string; badgeCls: string; icon: any }> = {
  0: { 
    label: "Pending Review", 
    badgeCls: "bg-blue-50 text-blue-700 border-blue-200", 
    icon: AlertCircle 
  },
  1: { 
    label: "Under Review", 
    badgeCls: "bg-amber-50 text-amber-700 border-amber-200", 
    icon: Clock 
  },
  2: { 
    label: "Confirmed", 
    badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-200", 
    icon: CheckCircle2 
  },
  3: { 
    label: "Declined", 
    badgeCls: "bg-rose-50 text-rose-700 border-rose-200", 
    icon: XCircle 
  },
};

export default function TourRequestsClient({ initialTourRequests }: TourRequestsClientProps) {
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "confirmed" | "declined">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRequests = useMemo(() => {
    return initialTourRequests.filter(req => {
      // 1. Tab filter
      if (activeTab === "pending" && req.status !== 0 && req.status !== 1) return false;
      if (activeTab === "confirmed" && req.status !== 2) return false;
      if (activeTab === "declined" && req.status !== 3) return false;

      // 2. Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = (req.unitTitle || "").toLowerCase().includes(q);
        const matchUser = (req.username || "").toLowerCase().includes(q);
        const matchEmail = (req.email || "").toLowerCase().includes(q);
        const matchMobile = (req.mobile || "").toLowerCase().includes(q);
        if (!matchTitle && !matchUser && !matchEmail && !matchMobile) return false;
      }

      return true;
    });
  }, [initialTourRequests, activeTab, searchTerm]);

  const stats = useMemo(() => ({
    total: initialTourRequests.length,
    pending: initialTourRequests.filter(r => r.status === 0 || r.status === 1).length,
    confirmed: initialTourRequests.filter(r => r.status === 2).length,
    declined: initialTourRequests.filter(r => r.status === 3).length,
  }), [initialTourRequests]);

  return (
    <div className="space-y-5 sm:space-y-6">

      {/* Top Stat Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div 
          onClick={() => setActiveTab("all")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "all" 
              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20" 
              : "bg-white text-zinc-900 border-zinc-200/80 hover:border-zinc-300"
          }`}
        >
          <span className={`text-[11px] font-bold block ${activeTab === "all" ? "text-blue-100" : "text-zinc-500"}`}>
            All Tour Requests
          </span>
          <span className="text-2xl font-black mt-1 block">{stats.total}</span>
        </div>

        <div 
          onClick={() => setActiveTab("pending")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "pending" 
              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20" 
              : "bg-white text-zinc-900 border-zinc-200/80 hover:border-blue-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold block ${activeTab === "pending" ? "text-blue-100" : "text-blue-600"}`}>
              Pending Review
            </span>
            {stats.pending > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                activeTab === "pending" ? "bg-white text-blue-600" : "bg-blue-600 text-white"
              }`}>
                Action
              </span>
            )}
          </div>
          <span className={`text-2xl font-black mt-1 block ${activeTab === "pending" ? "text-white" : "text-blue-600"}`}>
            {stats.pending}
          </span>
        </div>

        <div 
          onClick={() => setActiveTab("confirmed")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "confirmed" 
              ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20" 
              : "bg-white text-zinc-900 border-zinc-200/80 hover:border-emerald-300"
          }`}
        >
          <span className={`text-[11px] font-bold block ${activeTab === "confirmed" ? "text-emerald-100" : "text-emerald-700"}`}>
            Confirmed Visits
          </span>
          <span className={`text-2xl font-black mt-1 block ${activeTab === "confirmed" ? "text-white" : "text-emerald-700"}`}>
            {stats.confirmed}
          </span>
        </div>

        <div 
          onClick={() => setActiveTab("declined")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "declined" 
              ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20" 
              : "bg-white text-zinc-900 border-zinc-200/80 hover:border-rose-300"
          }`}
        >
          <span className={`text-[11px] font-bold block ${activeTab === "declined" ? "text-rose-100" : "text-zinc-500"}`}>
            Declined / Cancelled
          </span>
          <span className="text-2xl font-black mt-1 block text-zinc-700">{stats.declined}</span>
        </div>

      </div>

      {/* Main Content Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/80 overflow-hidden">
        
        {/* Filter & Search Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-zinc-900 text-white shadow-2xs"
                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "pending"
                  ? "bg-blue-600 text-white shadow-2xs shadow-blue-600/20"
                  : "bg-blue-50 hover:bg-blue-100 text-blue-700"
              }`}
            >
              <span>Pending ({stats.pending})</span>
            </button>
            <button
              onClick={() => setActiveTab("confirmed")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "confirmed"
                  ? "bg-emerald-600 text-white shadow-2xs shadow-emerald-600/20"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
              }`}
            >
              Confirmed ({stats.confirmed})
            </button>
            <button
              onClick={() => setActiveTab("declined")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "declined"
                  ? "bg-zinc-700 text-white shadow-2xs"
                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
              }`}
            >
              Declined ({stats.declined})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search applicant, phone, property..."
              className="w-full text-xs font-bold bg-[#f8fafc] border border-zinc-200/90 rounded-xl pl-9 pr-3 py-2 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Desktop / Tablet Data Table (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-zinc-200/80 text-zinc-500 font-extrabold text-[11px] uppercase tracking-wider select-none">
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4 min-w-[220px]">Target Property</th>
                <th className="py-3.5 px-4 min-w-[150px]">Applicant</th>
                <th className="py-3.5 px-4 min-w-[150px]">Contact Info</th>
                <th className="py-3.5 px-4 min-w-[160px]">Preferred Visit Date</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right min-w-[160px]">Direct Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => {
                  const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG[0];
                  const visitDate = req.requestDate || req.date;
                  const formattedDate = visitDate 
                    ? new Date(visitDate).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Flexible Schedule";

                  return (
                    <tr key={req.id} className="hover:bg-blue-50/20 transition-colors">
                      
                      {/* ID */}
                      <td className="py-3.5 px-4 font-bold text-zinc-400">#{req.id}</td>

                      {/* Property */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                            {req.unitImage ? (
                              <img 
                                src={req.unitImage} 
                                alt={req.unitTitle || "Unit"} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                <Building2 className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            {req.unitId ? (
                              <Link
                                href={`/properties/id${req.unitId}`}
                                target="_blank"
                                className="font-extrabold text-zinc-900 hover:text-blue-600 transition-colors truncate block max-w-[200px]"
                                title={req.unitTitle}
                              >
                                {req.unitTitle || `Unit #${req.unitId}`}
                              </Link>
                            ) : (
                              <span className="font-extrabold text-zinc-900 truncate block max-w-[200px]">
                                {req.unitTitle || "General Property Inquiry"}
                              </span>
                            )}
                            <span className="text-[11px] text-zinc-500 truncate block max-w-[200px]">
                              {req.unitAddress || "Metro Manila"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Applicant */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-black text-xs shrink-0 border border-blue-200">
                            {(req.username || req.email || "U")[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="font-extrabold text-zinc-900 block truncate max-w-[130px]">
                              {req.username || "Prospective Client"}
                            </span>
                            <span className="text-[10px] text-zinc-400 block font-semibold">
                              Verified Client
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        {req.mobile ? (
                          <a 
                            href={`tel:${req.mobile}`} 
                            className="flex items-center gap-1 text-zinc-700 hover:text-blue-600 font-bold"
                          >
                            <Phone className="w-3 h-3 text-zinc-400" />
                            <span>{req.mobile}</span>
                          </a>
                        ) : null}
                        {req.email ? (
                          <a 
                            href={`mailto:${req.email}`} 
                            className="flex items-center gap-1 text-zinc-500 hover:text-blue-600 text-[11px] truncate max-w-[140px]"
                            title={req.email}
                          >
                            <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span className="truncate">{req.email}</span>
                          </a>
                        ) : (
                          <span className="text-zinc-400 text-[11px]">No contact info</span>
                        )}
                      </td>

                      {/* Preferred Visit Date */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{formattedDate}</span>
                        </div>
                        {req.desc && (
                          <p className="text-[11px] text-zinc-400 mt-0.5 truncate max-w-[160px]" title={req.desc}>
                            Note: {req.desc}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 font-extrabold text-[11px] px-2.5 py-1 rounded-full border ${cfg.badgeCls}`}>
                          <cfg.icon className="w-3 h-3" />
                          <span>{cfg.label}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {req.status === 0 || req.status === 1 ? (
                          <div className="flex justify-end">
                            <TourActionButtons scheduleId={req.id} />
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-[11px] font-semibold">Processed</span>
                        )}
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400 font-bold">
                    No tour requests found matching the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Smart Card View (< 768px) */}
        <div className="md:hidden divide-y divide-zinc-100">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => {
              const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG[0];
              const visitDate = req.requestDate || req.date;
              const formattedDate = visitDate 
                ? new Date(visitDate).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Flexible Date";

              return (
                <div key={req.id} className="p-4 space-y-3">
                  
                  {/* Property & Status Header */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                        {req.unitImage ? (
                          <img 
                            src={req.unitImage} 
                            alt={req.unitTitle || "Unit"} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400">
                            <Building2 className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-xs text-zinc-900 truncate">
                          {req.unitTitle || `Tour Request #${req.id}`}
                        </h4>
                        <p className="text-[11px] text-zinc-500 truncate">
                          {req.unitAddress || "Metro Manila"}
                        </p>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1 font-extrabold text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${cfg.badgeCls}`}>
                      <cfg.icon className="w-3 h-3" />
                      <span>{cfg.label}</span>
                    </span>
                  </div>

                  {/* Applicant & Date Info Box */}
                  <div className="bg-[#f8fafc] border border-zinc-200/80 rounded-xl p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 font-bold text-[11px]">Applicant:</span>
                      <span className="font-extrabold text-zinc-900">{req.username || "Prospective Client"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 font-bold text-[11px]">Visit Date:</span>
                      <span className="font-extrabold text-blue-700 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formattedDate}
                      </span>
                    </div>

                    {req.mobile && (
                      <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60">
                        <span className="text-zinc-400 font-bold text-[11px]">Phone:</span>
                        <a href={`tel:${req.mobile}`} className="font-bold text-blue-600">
                          {req.mobile}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions for Pending Requests */}
                  {req.status === 0 || req.status === 1 ? (
                    <div className="pt-1">
                      <TourActionButtons scheduleId={req.id} compact={true} />
                    </div>
                  ) : (
                    <div className="text-center py-1 text-xs font-bold text-zinc-400 bg-zinc-50 rounded-xl">
                      Status: {cfg.label}
                    </div>
                  )}

                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-zinc-400 font-bold">
              No tour requests found.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
