"use client";

import SelectionBox from "@/components/ui/select-box";
import { ZONING_TYPE_OPTIONS } from "@/lib/config/unit-options";

interface LotFieldsProps {
  formData: {
    roadFrontageM: string;
    zoningType: string;
  };
  onChange: (name: string, value: string) => void;
}

export default function LotFields({ formData, onChange }: LotFieldsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Zoning Type — required */}
      <div className="flex flex-col gap-2">
        <label className="block text-xs font-medium text-zinc-500 mb-1">
          Zoning Type <span className="text-red-500">*</span>
        </label>
        <SelectionBox
          options={ZONING_TYPE_OPTIONS}
          selectedValue={formData.zoningType}
          onSelect={(v) => onChange("zoningType", v)}
          className="w-full flex-wrap gap-y-2 md:space-x-2"
          boxClassName="h-12 md:h-10 w-full"
          textClassName="text-xs"
        />
      </div>

      {/* Road Frontage — required */}
      <div className="flex flex-col gap-2">
        <label className="block text-xs font-medium text-zinc-500 mb-1">
          Road Frontage (m) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min={0}
          step={0.1}
          placeholder="e.g. 12.0"
          value={formData.roadFrontageM}
          onChange={(e) => onChange("roadFrontageM", e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-orange-400 w-40"
        />
      </div>
    </div>
  );
}
