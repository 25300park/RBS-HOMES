"use client";

interface WarehouseFieldsProps {
  formData: {
    ceilingHeight: string;
  };
  onChange: (name: string, value: string) => void;
}

export default function WarehouseFields({ formData, onChange }: WarehouseFieldsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Ceiling Height — required */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-zinc-700">
          Ceiling / Clear Height (m) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min={0}
          step={0.1}
          placeholder="e.g. 6.0"
          value={formData.ceilingHeight}
          onChange={(e) => onChange("ceilingHeight", e.target.value)}
          className="border border-zinc-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-orange-400 w-40"
        />
        <p className="text-xs text-zinc-400">
          Interior clear height from floor to lowest obstruction.
        </p>
      </div>
    </div>
  );
}
