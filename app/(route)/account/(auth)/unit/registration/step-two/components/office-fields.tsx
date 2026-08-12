"use client";

import SelectionBox from "@/components/ui/select-box";
import { COMPLETION_STATUS_OPTIONS } from "@/lib/config/unit-options";

interface OfficeFieldsProps {
  formData: {
    totalFloors: string;
    completionStatus: string;
    ceilingHeight: string;
    furniture: string;
  };
  onChange: (name: string, value: string) => void;
}

export default function OfficeFields({ formData, onChange }: OfficeFieldsProps) {
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

      {/* Furniture — optional */}
      <div className="flex flex-col gap-2">
        <label className="block text-xs font-medium text-zinc-500 mb-1">
          Furnishing{" "}
          <span className="text-xs font-normal text-zinc-400">(optional)</span>
        </label>
        <SelectionBox
          options={[
            { label: "Bare Shell", value: "bare" },
            { label: "Fitted",     value: "semi" },
            { label: "Furnished",  value: "fully" },
          ]}
          selectedValue={formData.furniture}
          onSelect={(v) => onChange("furniture", v)}
          className="w-full md:space-x-2"
          boxClassName="h-12 md:h-10 w-full"
          textClassName="text-xs"
        />
      </div>

      {/* Total Floors — optional */}
      <div className="flex flex-col gap-2">
        <label className="block text-xs font-medium text-zinc-500 mb-1">
          Total Floors{" "}
          <span className="text-xs font-normal text-zinc-400">(optional)</span>
        </label>
        <input
          type="number"
          min={1}
          placeholder="e.g. 20"
          value={formData.totalFloors}
          onChange={(e) => onChange("totalFloors", e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-orange-400 w-40"
        />
      </div>

      {/* Ceiling Height — optional */}
      <div className="flex flex-col gap-2">
        <label className="block text-xs font-medium text-zinc-500 mb-1">
          Ceiling Height (m){" "}
          <span className="text-xs font-normal text-zinc-400">(optional)</span>
        </label>
        <input
          type="number"
          min={0}
          step={0.1}
          placeholder="e.g. 3.5"
          value={formData.ceilingHeight}
          onChange={(e) => onChange("ceilingHeight", e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-orange-400 w-40"
        />
      </div>
    </div>
  );
}
