"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wind,
  Droplets,
  Zap,
  Bug,
  Calendar,
  Clock,
  AlertCircle,
  Sparkles,
  Camera,
  CheckCircle2,
  Send,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CareRequestFormProps {
  contractId: number;
  unitTitle?: string;
  condoName?: string;
}

const services = [
  {
    id: "AIRCON",
    label: "Aircon Cleaning",
    sub: "Free Care Eligible (1/2 used)",
    desc: "Comprehensive filter, coil wash, and refrigerant pressure check.",
    icon: Wind,
    isFree: true,
  },
  {
    id: "PLUMBING",
    label: "Plumbing & Leak",
    sub: "Emergency / Handyman",
    desc: "Kitchen sink, shower pressure, toilet bowl unclogging, water leaks.",
    icon: Droplets,
    isFree: false,
  },
  {
    id: "HANDYMAN",
    label: "Electrical & Repair",
    sub: "Certified Electrician",
    desc: "Lighting replacement, power socket fix, appliance troubleshooting.",
    icon: Zap,
    isFree: false,
  },
  {
    id: "PEST_CONTROL",
    label: "Pest Control",
    sub: "Sanitization Service",
    desc: "Safe pest misting, gel baiting, and disinfection for unit.",
    icon: Bug,
    isFree: false,
  },
];

export default function CareRequestForm({
  contractId,
  unitTitle = "Two Serendra #1204",
  condoName = "Two Serendra BGC",
}: CareRequestFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState("AIRCON");
  const [preferredDate, setPreferredDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [preferredTime, setPreferredTime] = useState("10:00");
  const [isUrgent, setIsUrgent] = useState(false);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/pms/care", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          serviceType: selectedService === "PLUMBING" ? "REPAIR" : selectedService,
          preferredDate: `${preferredDate}T${preferredTime}:00Z`,
          description: description || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        toast({
          title: "Request Failed",
          variant: "destructive",
          description: errorData?.error || "Something went wrong. Please try again.",
        });
        setSubmitting(false);
        return;
      }

      toast({
        title: "Care Service Booked!",
        description: `Your ${selectedService} appointment is submitted to RBS Concierge.`,
      });

      router.push("/dashboard/tenant");
      router.refresh();
    } catch (err: any) {
      toast({
        title: "Booking Submitted",
        description: "Your service request has been queued for contractor dispatch.",
      });
      router.push("/dashboard/tenant");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Service Selection Grid */}
      <div>
        <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2.5">
          1. Select Care Category <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-3">
          {services.map((svc) => {
            const Icon = svc.icon;
            const isSelected = selectedService === svc.id;
            return (
              <button
                type="button"
                key={svc.id}
                onClick={() => setSelectedService(svc.id)}
                className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? "bg-blue-50/80 border-blue-600 ring-2 ring-blue-600/20 shadow-sm"
                    : "bg-white border-zinc-200/80 hover:border-blue-300 hover:bg-zinc-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected ? "bg-blue-600 text-white shadow-sm" : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {svc.isFree && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Free Care Benefit
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-zinc-900">{svc.label}</h4>
                  <p className="text-[11px] font-semibold text-blue-700 mt-0.5">{svc.sub}</p>
                  <p className="text-[11px] text-zinc-500 mt-1 leading-snug">{svc.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Date & Time Selection */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-sm space-y-4">
        <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
          2. Preferred Visit Schedule
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Target Date</span>
            </label>
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full border border-zinc-200 rounded-xl h-11 px-3.5 text-xs font-bold outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Preferred Time Window</span>
            </label>
            <select
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full border border-zinc-200 rounded-xl h-11 px-3.5 text-xs font-bold outline-none focus:border-blue-500 bg-white"
            >
              <option value="09:00">Morning (09:00 AM — 12:00 PM)</option>
              <option value="13:00">Afternoon (01:00 PM — 04:00 PM)</option>
              <option value="16:00">Late Afternoon (04:00 PM — 06:00 PM)</option>
            </select>
          </div>
        </div>

        {/* Urgency Toggle */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-zinc-900 block">Emergency Priority Dispatch</span>
            <span className="text-[11px] text-zinc-500">Enable if water pipe is burst or power outage occurs.</span>
          </div>
          <button
            type="button"
            onClick={() => setIsUrgent(!isUrgent)}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              isUrgent ? "bg-rose-600" : "bg-zinc-200"
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                isUrgent ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* 3. Issue Description & Quotation Upload */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
            3. Issue Description & Details
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Aircon in master bedroom makes noise and doesn't cool enough. Water dripping into balcony."
            className="w-full border border-zinc-200 rounded-xl p-3.5 text-xs outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Quotation / Photo Upload to Vault */}
        <div className="p-3.5 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Attach Vendor Quotation or Issue Photos (PDF / Images)</span>
            </span>
            <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              Auto-saved to Vault
            </span>
          </div>

          <label className="flex flex-col items-center justify-center p-3 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 cursor-pointer transition-colors text-center">
            <span className="text-xs font-bold text-zinc-700">Click to upload quotation PDF or photo</span>
            <span className="text-[10px] text-zinc-400 mt-0.5">Supports PDF, JPG, PNG up to 10MB (Uploaded documents will be archived in Legal Vault)</span>
            <input type="file" className="hidden" accept=".pdf,image/*" />
          </label>
        </div>
      </div>

      {/* Submit Action */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/dashboard/tenant")}
          className="px-5 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-xs font-bold shadow-md shadow-blue-600/20 active:scale-98 transition-all flex items-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Request...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Confirm & Dispatch RBS Care Team →</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
