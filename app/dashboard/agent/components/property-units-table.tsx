"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  Download, 
  Calendar, 
  Clock, 
  ChevronUp, 
  ChevronDown, 
  X,
  FileCheck,
  Building2,
  FileText,
  ExternalLink
} from "lucide-react";

export interface PropertyUnit {
  id: number;
  title: string;
  type: string;
  sellType: string;
  status: number; // 0: Active, 1: Completed, 2: Contracted, 3: Under Negotiation, 4: Hidden
  price: number | string | null;
  area: number;
  bed?: number | null;
  bath?: number | null;
  address1?: string | null;
  address2?: string | null;
  address3?: string | null;
  fullAddress?: string | null;
  ownerName?: string | null;
  ownerMobile?: string | null;
  ownerEmail?: string | null;
  images?: any;
  regdate?: string | Date;
  lastUpdate?: string | Date;
  viewCount?: number;
  note?: string | null;
  agent?: {
    id: number;
    name?: string | null;
    email?: string | null;
  } | null;
  contractUploads?: Array<{
    id: number;
    pdfUrl: string;
    createdAt: string | Date;
  }>;
  loiDocuments?: Array<{
    id: number;
    status: string;
    signedAt?: string | Date | null;
    createdAt: string | Date;
  }>;
}

interface PropertyUnitsTableProps {
  initialUnits: PropertyUnit[];
  agentName?: string;
  onStatusUpdated?: () => void;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  title?: string;
}

export default function PropertyUnitsTable({ 
  initialUnits, 
  agentName, 
  onStatusUpdated,
  isCollapsible = false,
  defaultExpanded = true,
  title = "Property Units Management"
}: PropertyUnitsTableProps) {
  const [units, setUnits] = useState<PropertyUnit[]>(initialUnits);
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sellTypeFilter, setSellTypeFilter] = useState<string>("all");
  
  // Sort State
  const [sortField, setSortField] = useState<keyof PropertyUnit | "priceNum">("regdate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal State for Document Upload
  const [uploadModalUnit, setUploadModalUnit] = useState<PropertyUnit | null>(null);
  const [docType, setDocType] = useState<"contract" | "loi">("contract");
  const [docName, setDocName] = useState("");
  const [docFileUrl, setDocFileUrl] = useState("");
  const [leaseExpiry, setLeaseExpiry] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Status mapping
  const STATUS_CONFIG: Record<number, { label: string; badgeClass: string; selectClass: string }> = {
    0: { 
      label: "Active", 
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200", 
      selectClass: "text-emerald-700 font-bold bg-emerald-50/70 border-emerald-300 focus:ring-emerald-500" 
    },
    1: { 
      label: "Active", 
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200", 
      selectClass: "text-emerald-700 font-bold bg-emerald-50/70 border-emerald-300" 
    },
    2: { 
      label: "Contracted", 
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200", 
      selectClass: "text-blue-700 font-bold bg-blue-50/70 border-blue-300 focus:ring-blue-500" 
    },
    3: { 
      label: "Under Negotiation", 
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200", 
      selectClass: "text-amber-700 font-bold bg-amber-50/70 border-amber-300 focus:ring-amber-500" 
    },
    4: { 
      label: "Hidden", 
      badgeClass: "bg-zinc-100 text-zinc-600 border-zinc-200", 
      selectClass: "text-zinc-600 font-bold bg-zinc-100 border-zinc-300 focus:ring-zinc-400" 
    },
  };

  // Handle Inline Status Change
  const handleStatusChange = async (unitId: number, newStatus: number) => {
    setUnits(prev => prev.map(u => u.id === unitId ? { ...u, status: newStatus, lastUpdate: new Date() } : u));

    try {
      const res = await fetch("/api/pms/unit-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      if (onStatusUpdated) onStatusUpdated();
    } catch (e) {
      console.error("Status update error:", e);
      setUnits(initialUnits);
    }
  };

  // Handle Document Upload Submit
  const handleDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadModalUnit || !docFileUrl) return;

    setIsUploading(true);
    try {
      const res = await fetch("/api/pms/unit-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: uploadModalUnit.id,
          documentType: docType,
          documentName: docName || (docType === "loi" ? "LOI Document" : "Signed Lease Contract"),
          fileUrl: docFileUrl,
          expiryDate: leaseExpiry || undefined,
        }),
      });

      if (res.ok) {
        setUnits(prev => prev.map(u => {
          if (u.id === uploadModalUnit.id) {
            const updatedUploads = [...(u.contractUploads || [])];
            if (docType === "contract") {
              updatedUploads.push({ id: Date.now(), pdfUrl: docFileUrl, createdAt: new Date() });
            }
            return {
              ...u,
              contractUploads: updatedUploads,
              status: leaseExpiry ? 2 : u.status,
              note: leaseExpiry ? `Lease Expiry: ${leaseExpiry}` : u.note,
            };
          }
          return u;
        }));
        setUploadModalUnit(null);
        setDocFileUrl("");
        setDocName("");
        setLeaseExpiry("");
      }
    } catch (e) {
      console.error("Doc upload error:", e);
    } finally {
      setIsUploading(false);
    }
  };

  // Filter & Search Logic
  const filteredUnits = useMemo(() => {
    return units.filter(unit => {
      // 1. Keyword Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = unit.title.toLowerCase().includes(q);
        const matchAddress = (unit.address2 || unit.fullAddress || "").toLowerCase().includes(q);
        const matchOwner = (unit.ownerName || "").toLowerCase().includes(q);
        const matchId = String(unit.id).includes(q);
        if (!matchTitle && !matchAddress && !matchOwner && !matchId) return false;
      }

      // 2. Status Filter
      if (statusFilter !== "all" && String(unit.status) !== statusFilter) return false;

      // 4. Type & SaleType Filters
      if (typeFilter !== "all" && unit.type.toLowerCase() !== typeFilter.toLowerCase()) return false;
      if (sellTypeFilter !== "all" && unit.sellType.toLowerCase() !== sellTypeFilter.toLowerCase()) return false;

      // 5. Date Range Filter
      if (startDate) {
        const unitDate = new Date(unit.regdate || Date.now()).getTime();
        const start = new Date(startDate).getTime();
        if (unitDate < start) return false;
      }
      if (endDate) {
        const unitDate = new Date(unit.regdate || Date.now()).getTime();
        const end = new Date(endDate).setHours(23, 59, 59, 999);
        if (unitDate > end) return false;
      }

      return true;
    }).sort((a, b) => {
      let aVal: any = a[sortField as keyof PropertyUnit];
      let bVal: any = b[sortField as keyof PropertyUnit];

      if (sortField === "priceNum" || sortField === "price") {
        aVal = Number(a.price) || 0;
        bVal = Number(b.price) || 0;
      } else if (sortField === "area") {
        aVal = Number(a.area) || 0;
        bVal = Number(b.area) || 0;
      } else if (sortField === "regdate" || sortField === "lastUpdate") {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [units, searchTerm, statusFilter, typeFilter, sellTypeFilter, startDate, endDate, sortField, sortOrder]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Title", "Type", "Sale Type", "Address", "Area (sqm)", "Bed", "Bath", "Price (PHP)", "Registrant/Owner", "Agent", "Status", "Last Updated", "Lease Expiry"];
    const rows = filteredUnits.map(u => [
      u.id,
      `"${u.title.replace(/"/g, '""')}"`,
      u.type,
      u.sellType,
      `"${(u.address2 || u.fullAddress || "").replace(/"/g, '""')}"`,
      u.area,
      u.bed ?? "-",
      u.bath ?? "-",
      u.price ? Number(u.price).toLocaleString() : "-",
      `"${(u.ownerName || "TES").replace(/"/g, '""')}"`,
      `"${(u.agent?.name || "Unassigned").replace(/"/g, '""')}"`,
      STATUS_CONFIG[u.status]?.label || u.status,
      new Date(u.lastUpdate || u.regdate || Date.now()).toISOString().split("T")[0],
      u.note?.includes("Lease Expiry:") ? u.note.replace("Lease Expiry:", "").trim() : "-"
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Property_Units_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSort = (field: keyof PropertyUnit | "priceNum") => {
    if (sortField === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/80 overflow-hidden space-y-0 transition-all">
      
      {/* ── Table Header & Collapsible Toggle Bar ── */}
      <div 
        className={`p-4 sm:p-6 transition-colors ${
          isCollapsible ? "cursor-pointer hover:bg-zinc-50/70" : ""
        } ${isExpanded ? "border-b border-zinc-100" : ""}`}
        onClick={() => {
          if (isCollapsible) setIsExpanded(prev => !prev);
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight">Property Units</h2>
                <span className="bg-blue-50 text-blue-700 text-xs font-black px-2.5 py-0.5 rounded-full border border-blue-200/60 shadow-2xs">
                  {filteredUnits.length} Units
                </span>
                {!isExpanded && (
                  <span className="text-[11px] text-zinc-400 font-bold hidden sm:inline-block">
                    (Click to expand table)
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                Manage property listings, asset transaction status, lease contracts, and LOI copies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download Excel</span>
            </button>

            <Link
              href="/account/unit/registration/step-one"
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition-all active:scale-95"
            >
              <span>+ Add Unit</span>
            </Link>

            {isCollapsible && (
              <button
                type="button"
                onClick={() => setIsExpanded(prev => !prev)}
                className="flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-extrabold text-xs px-3 py-2 rounded-xl transition-all shadow-2xs"
              >
                <span>{isExpanded ? "Collapse ▲" : "Expand ▼"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Expanded Content (Filters + Mobile Card View + Desktop Table View) ── */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-5 animate-fade-in">

          {/* Filter Bar: Date Range + Search Bar */}
          <div className="p-4 sm:p-5 border-b border-zinc-100 bg-white grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            <div className="md:col-span-5 flex items-center gap-2 bg-[#f8fafc] border border-zinc-200/90 rounded-xl px-3 py-2">
              <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs font-bold bg-transparent outline-none text-zinc-700 cursor-pointer"
                title="Filter by Registration/Update Start Date"
              />
              <span className="text-zinc-400 text-xs font-bold">~</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs font-bold bg-transparent outline-none text-zinc-700 cursor-pointer"
                title="Filter by Registration/Update End Date"
              />
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(""); setEndDate(""); }}
                  className="text-zinc-400 hover:bg-zinc-200 rounded-full p-0.5"
                  title="Clear Dates"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="md:col-span-7 flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by unit title, building, address, owner name, ID..."
                  className="w-full text-xs font-bold bg-[#f8fafc] border border-zinc-200/90 rounded-xl pl-9 pr-3 py-2.5 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Filter Badges Row 2: Status & Type Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">Status:</span>
            {[
              { label: "All Status", val: "all" },
              { label: "Active 🟢", val: "0" },
              { label: "Under Negotiation 🟡", val: "3" },
              { label: "Contracted (Leased) 🔵", val: "2" },
              { label: "Hidden ⚪", val: "4" },
            ].map(s => (
              <button
                key={s.val}
                onClick={() => setStatusFilter(s.val)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                  statusFilter === s.val
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-2xs font-black"
                    : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border-zinc-200/80"
                }`}
              >
                {s.label}
              </button>
            ))}

            <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider ml-2">Sale Type:</span>
            {[
              { label: "All", val: "all" },
              { label: "Rent", val: "rent" },
              { label: "Sale", val: "sale" },
            ].map(st => (
              <button
                key={st.val}
                onClick={() => setSellTypeFilter(st.val)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                  sellTypeFilter === st.val
                    ? "bg-blue-600 text-white border-blue-600 shadow-2xs font-black"
                    : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border-zinc-200/80"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* ── 1. Mobile Optimized Card List (< 768px: md:hidden) ── */}
          <div className="block md:hidden space-y-3">
            {filteredUnits.length > 0 ? (
              filteredUnits.map((unit) => {
                const isRent = unit.sellType?.toLowerCase() === "rent";
                const isSale = unit.sellType?.toLowerCase() === "sale";
                const leaseExpiryMatch = unit.note?.match(/Lease Expiry:\s*([0-9-]+)/i);
                const expiryDateStr = leaseExpiryMatch ? leaseExpiryMatch[1] : null;

                return (
                  <div key={unit.id} className="bg-[#f8fafc] border border-zinc-200/90 rounded-2xl p-4 space-y-3 shadow-2xs">
                    
                    {/* Top row: ID + Badges + Actions */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-zinc-400 text-xs">#{unit.id}</span>
                        <span className="bg-pink-50 text-pink-700 font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-pink-200 capitalize">
                          {unit.type || "Condo"}
                        </span>
                        <span className={`font-extrabold text-[10px] px-2 py-0.5 rounded-md border capitalize ${
                          isRent 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isSale
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                          {unit.sellType || "Rent"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/properties/id${unit.id}`}
                          target="_blank"
                          className="text-blue-600 font-bold text-xs bg-white border border-zinc-200 px-2.5 py-1 rounded-lg shadow-2xs"
                        >
                          View
                        </Link>
                        <Link
                          href={`/account/unit/edit/${unit.id}`}
                          className="text-zinc-700 font-bold text-xs bg-white border border-zinc-200 px-2.5 py-1 rounded-lg shadow-2xs"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <Link 
                        href={`/properties/id${unit.id}`}
                        target="_blank"
                        className="font-bold text-zinc-900 text-sm hover:text-blue-600 line-clamp-2"
                      >
                        {unit.title}
                      </Link>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">
                        {unit.address2 || unit.fullAddress || "Metro Manila"}
                      </p>
                    </div>

                    {/* Specs & Price Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-xl border border-zinc-200/60 text-center">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-bold block">Price</span>
                        <span className="text-xs font-black text-zinc-900 truncate block">
                          ₱ {unit.price ? Number(unit.price).toLocaleString() : "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 font-bold block">Area</span>
                        <span className="text-xs font-bold text-zinc-800 block">{unit.area}m²</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 font-bold block">Bed/Bath</span>
                        <span className="text-xs font-bold text-zinc-800 block">{unit.bed ?? 0}/{unit.bath ?? 0}</span>
                      </div>
                    </div>

                    {/* Status & Docs row */}
                    <div className="pt-2 border-t border-zinc-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1">
                        <select
                          value={unit.status}
                          onChange={(e) => handleStatusChange(unit.id, Number(e.target.value))}
                          className={`w-full text-xs font-extrabold rounded-xl px-3 py-2 border transition-all focus:outline-none ${
                            STATUS_CONFIG[unit.status]?.selectClass || "bg-zinc-100 border-zinc-200 text-zinc-700"
                          }`}
                        >
                          <option value={0}>Active (진행중)</option>
                          <option value={3}>Under Negotiation (협상중)</option>
                          <option value={2}>Contracted (계약완료)</option>
                          <option value={4}>Hidden (보류/숨김)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        {expiryDateStr && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
                            Exp: {expiryDateStr}
                          </span>
                        )}
                        <button
                          onClick={() => setUploadModalUnit(unit)}
                          className="flex items-center gap-1 text-xs font-bold text-zinc-700 bg-white hover:bg-blue-50 border border-zinc-200 px-3 py-1.5 rounded-xl shadow-2xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-zinc-500" />
                          <span>+Docs ({((unit.contractUploads?.length || 0) + (unit.loiDocuments?.length || 0))})</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-zinc-400 font-bold bg-[#f8fafc] rounded-2xl border border-dashed border-zinc-200">
                No units match filters.
              </div>
            )}
          </div>

          {/* ── 2. Desktop/Tablet Full Data Table (≥ 768px: hidden md:block) ── */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-zinc-200/80">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-zinc-200/80 text-zinc-500 font-extrabold text-[11px] uppercase tracking-wider select-none">
                  <th className="py-3.5 px-4 cursor-pointer hover:text-zinc-900" onClick={() => toggleSort("id")}>
                    <div className="flex items-center gap-1">
                      <span>ID</span>
                      {sortField === "id" && (sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th className="py-3.5 px-4 min-w-[200px]">Title</th>
                  <th className="py-3.5 px-3">Type</th>
                  <th className="py-3.5 px-3">Sale Type</th>
                  <th className="py-3.5 px-3 min-w-[120px]">Address</th>
                  <th className="py-3.5 px-3 cursor-pointer hover:text-zinc-900" onClick={() => toggleSort("area")}>
                    <div className="flex items-center gap-1">
                      <span>Area</span>
                      {sortField === "area" && (sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th className="py-3.5 px-3">Bed/Bath</th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-zinc-900" onClick={() => toggleSort("priceNum")}>
                    <div className="flex items-center gap-1">
                      <span>Price</span>
                      {sortField === "priceNum" && (sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th className="py-3.5 px-3">Registrant</th>
                  <th className="py-3.5 px-3">Agent</th>
                  <th className="py-3.5 px-3 cursor-pointer hover:text-zinc-900" onClick={() => toggleSort("lastUpdate")}>
                    <div className="flex items-center gap-1">
                      <span>Last updated</span>
                      {sortField === "lastUpdate" && (sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th className="py-3.5 px-4 min-w-[160px]">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                {filteredUnits.length > 0 ? (
                  filteredUnits.map((unit) => {
                    const isRent = unit.sellType?.toLowerCase() === "rent";
                    const isSale = unit.sellType?.toLowerCase() === "sale";
                    const leaseExpiryMatch = unit.note?.match(/Lease Expiry:\s*([0-9-]+)/i);
                    const expiryDateStr = leaseExpiryMatch ? leaseExpiryMatch[1] : null;

                    return (
                      <tr key={unit.id} className="hover:bg-blue-50/20 transition-colors">
                        
                        <td className="py-3.5 px-4 font-bold text-zinc-500">{unit.id}</td>

                        <td className="py-3.5 px-4">
                          <Link 
                            href={`/properties/id${unit.id}`}
                            target="_blank"
                            className="font-bold text-zinc-900 hover:text-blue-600 transition-colors line-clamp-1 block"
                            title={unit.title}
                          >
                            {unit.title}
                          </Link>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="bg-pink-50 text-pink-700 font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-pink-200 capitalize">
                            {unit.type || "Condo"}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className={`font-extrabold text-[10px] px-2 py-0.5 rounded-md border capitalize ${
                            isRent 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isSale
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}>
                            {unit.sellType || "Rent"}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-zinc-600 truncate max-w-[130px]" title={unit.address2 || unit.fullAddress || ""}>
                          {unit.address2 || unit.fullAddress || "-"}
                        </td>

                        <td className="py-3.5 px-3 font-semibold text-zinc-800 whitespace-nowrap">
                          {unit.area}m²
                        </td>

                        <td className="py-3.5 px-3 font-semibold text-zinc-700 whitespace-nowrap">
                          {unit.bed ?? 0}/{unit.bath ?? 0}
                        </td>

                        <td className="py-3.5 px-4 font-black text-zinc-900 whitespace-nowrap">
                          ₱ {unit.price ? Number(unit.price).toLocaleString() : "-"}
                        </td>

                        <td className="py-3.5 px-3 text-zinc-700 font-semibold truncate max-w-[100px]">
                          {unit.ownerName || "TES"}
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-bold text-zinc-800">
                            {unit.agent?.name || agentName || "Assigned"}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-zinc-500 whitespace-nowrap text-[11px]">
                          {new Date(unit.lastUpdate || unit.regdate || Date.now()).toISOString().split("T")[0]}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <select
                              value={unit.status}
                              onChange={(e) => handleStatusChange(unit.id, Number(e.target.value))}
                              className={`text-xs font-extrabold rounded-lg px-2.5 py-1 border transition-all focus:outline-none ${
                                STATUS_CONFIG[unit.status]?.selectClass || "bg-zinc-100 border-zinc-200 text-zinc-700"
                              }`}
                            >
                              <option value={0}>Active</option>
                              <option value={3}>Under Negotiation</option>
                              <option value={2}>Contracted</option>
                              <option value={4}>Hidden</option>
                            </select>
                            {expiryDateStr && (
                              <div className="text-[10px] font-bold text-blue-700 bg-blue-50/80 px-1.5 py-0.5 rounded border border-blue-200/60 flex items-center gap-1 whitespace-nowrap">
                                <Clock className="w-2.5 h-2.5 text-blue-500" />
                                <span>Exp: {expiryDateStr}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setUploadModalUnit(unit)}
                              className="text-zinc-600 hover:text-blue-600 font-bold text-xs bg-zinc-50 hover:bg-blue-50 border border-zinc-200/80 px-2 py-1 rounded-md transition-all shadow-2xs"
                              title="Upload LOI or Contract Copy"
                            >
                              +Docs ({((unit.contractUploads?.length || 0) + (unit.loiDocuments?.length || 0))})
                            </button>
                            <Link
                              href={`/properties/id${unit.id}`}
                              target="_blank"
                              className="text-blue-600 hover:text-blue-800 font-bold text-xs hover:underline"
                            >
                              View
                            </Link>
                            <Link
                              href={`/account/unit/edit/${unit.id}`}
                              className="text-zinc-600 hover:text-zinc-900 font-bold text-xs hover:underline"
                            >
                              Edit
                            </Link>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={13} className="py-12 text-center text-zinc-400 font-bold">
                      No property units match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ── Document Upload Modal (LOI & Lease Contract Copy) ── */}
      {uploadModalUnit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 space-y-5 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">Legal & PMS Documents</span>
                <h3 className="text-lg font-black text-zinc-900">Manage LOI & Contract Copies</h3>
              </div>
              <button
                onClick={() => setUploadModalUnit(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50/60 border border-blue-200/70 p-3 rounded-xl">
              <span className="text-xs font-bold text-zinc-900 block truncate">
                Unit #{uploadModalUnit.id}: {uploadModalUnit.title}
              </span>
              <span className="text-[11px] text-zinc-500 font-medium">
                {uploadModalUnit.address2 || uploadModalUnit.fullAddress || "Metro Manila"}
              </span>
            </div>

            {/* Existing Documents List */}
            {((uploadModalUnit.contractUploads && uploadModalUnit.contractUploads.length > 0) || (uploadModalUnit.loiDocuments && uploadModalUnit.loiDocuments.length > 0)) && (
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Existing Documents</h4>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {uploadModalUnit.contractUploads?.map((c, i) => (
                    <div key={c.id || i} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200/80 text-xs">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-zinc-800">Contract Copy #{c.id}</span>
                      </div>
                      <a href={c.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">
                        Download / View
                      </a>
                    </div>
                  ))}
                  {uploadModalUnit.loiDocuments?.map((l, i) => (
                    <div key={l.id || i} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200/80 text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-600" />
                        <span className="font-bold text-zinc-800">LOI Document ({l.status})</span>
                      </div>
                      <span className="text-zinc-500 text-[11px]">{new Date(l.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Form */}
            <form onSubmit={handleDocSubmit} className="space-y-4 pt-2 border-t border-zinc-100">
              <h4 className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">+ Attach New Document / Copy</h4>
              
              {/* Document Type Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDocType("contract")}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    docType === "contract"
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-zinc-50 text-zinc-700 border-zinc-200"
                  }`}
                >
                  📄 Lease Contract Copy (계약서)
                </button>
                <button
                  type="button"
                  onClick={() => setDocType("loi")}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    docType === "loi"
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-zinc-50 text-zinc-700 border-zinc-200"
                  }`}
                >
                  📝 LOI Document (구매의향서)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Document Title / Memo</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g., 2026-2027 Signed Lease Contract.pdf"
                  className="w-full text-xs font-bold bg-[#f8fafc] border border-zinc-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">File URL / Cloud Link (PDF / Image) *</label>
                <input
                  type="text"
                  required
                  value={docFileUrl}
                  onChange={(e) => setDocFileUrl(e.target.value)}
                  placeholder="https://cloud.rbs-homes.com/contracts/unit1863_contract.pdf"
                  className="w-full text-xs font-bold bg-[#f8fafc] border border-zinc-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {docType === "contract" && (
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Lease Expiry Date (임대 계약 만료일)</label>
                  <input
                    type="date"
                    value={leaseExpiry}
                    onChange={(e) => setLeaseExpiry(e.target.value)}
                    className="w-full text-xs font-bold bg-[#f8fafc] border border-zinc-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-zinc-500 mt-0.5">Setting an expiry date will automatically flag status as Contracted (Leased).</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setUploadModalUnit(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !docFileUrl}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {isUploading ? "Uploading..." : "Save Document"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}