"use client";

import SelectionBox from "@/components/ui/select-box";
import { COMPLETION_STATUS_OPTIONS } from "@/lib/config/unit-options";

interface CommercialFieldsProps {
  formData: {
    roadFrontageM: string;
    footTraffic: string;
    completionStatus: string;
  };
  onChange: (name: string, value: string) => void;
}

export default function CommercialFields({ formData, onChange }: CommercialFieldsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Completion Status — required */}
      <div className="flex flex-col gap-2">
        <label className="block text-xs font-medium text-zinc-500 mb-1">
          Completion Status <span className="text-red-500">*</span>
        </label>
        <SelectionBox
          options={COMPLETION_STATUS_OPTIONS}
          selectedValue={formData.completionStatus}
          onSelect={(v) => onChange("completionStatus", v)}
          className="w-full md:space-x-2"
          boxClassName="h-12 md:h-10 w-full"
          textClassName="text-xs"
        />
      </div>

      {/* Road Frontage — optional */}
      <div className="flex flex-col gap-2">
        <label className="block text-xs font-medium text-zinc-500 mb-1">
          Road Frontage (m){" "}
          <span className="text-xs font-normal text-zinc-400">(optional)</span>
        </label>
        <input
          type="number"
          min={0}
          step={0.1}
          placeholder="e.g. 8.5"
          value={formData.roadFrontageM}
          onChange={(e) => onChange("roadFrontageM", e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-orange-400 w-40"
        />
      </div>

      {/* Foot Traffic — optional */}
      <div className="flex flex-col gap-2">
        <label className="block text-xs font-medium text-zinc-500 mb-1">
          Foot Traffic Description{" "}
          <span className="text-xs font-normal text-zinc-400">(optional)</span>
        </label>
        <textarea
          rows={3}
          placeholder="e.g. High foot traffic area near main road, surrounded by residential subdivisions"
          value={formData.footTraffic}
          onChange={(e) => onChange("footTraffic", e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none w-full"
        />
      </div>
    </div>
  );
}
