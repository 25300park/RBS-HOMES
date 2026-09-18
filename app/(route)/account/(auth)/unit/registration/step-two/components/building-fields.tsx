"use client";

interface BuildingFieldsProps {
  formData: {
    totalFloors: string;
    existingTenants: string;
  };
  onChange: (name: string, value: string) => void;
}

export default function BuildingFields({ formData, onChange }: BuildingFieldsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Total Floors — required */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-zinc-700">
          Total Floors <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min={1}
          placeholder="e.g. 12"
          value={formData.totalFloors}
          onChange={(e) => onChange("totalFloors", e.target.value)}
          className="border border-zinc-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-orange-400 w-40"
        />
      </div>

      {/* Existing Tenants — optional */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-zinc-700">
          Existing Tenants{" "}
          <span className="text-xs font-normal text-zinc-400">(optional)</span>
        </label>
        <textarea
          rows={3}
          placeholder="e.g. Ground floor retail occupied by convenience store. Floors 2–5 vacant."
          value={formData.existingTenants}
          onChange={(e) => onChange("existingTenants", e.target.value)}
          className="border border-zinc-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-orange-400 resize-none"
        />
        <p className="text-xs text-zinc-400">
          Describe current tenant occupancy or state &quot;Fully vacant&quot; if empty.
        </p>
      </div>
    </div>
  );
}