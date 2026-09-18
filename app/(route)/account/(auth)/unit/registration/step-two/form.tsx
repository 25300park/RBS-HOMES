"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { stepTwoSchema } from "@/types/schema";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { TagInput } from "@/components/ui/tag-input";
import Spinner from "@/components/ui/spinner";
import {
  furnitureOptions,
  petPolicyOption,
  bedOption,
  bathOption,
  parkingOption,
  interioredOption,
} from "@/lib/config/unit-options";
import SelectionBox from "@/components/ui/select-box";
import { SubmitButton } from "@/components/ui/submit-btn";
import { useToast } from "@/hooks/use-toast";
import OfficeFields from "./components/office-fields";
import CommercialFields from "./components/commercial-fields";
import WarehouseFields from "./components/warehouse-fields";
import LotFields from "./components/lot-fields";
import BuildingFields from "./components/building-fields";

/** 타입별 필수 입력 필드 (roadFrontageM, footTraffic, zoningType, existingTenants는 선택 항목) */
const TYPE_REQUIRED: Record<string, string[]> = {
  office:     ["completionStatus"],
  commercial: ["completionStatus"],
  warehouse:  ["ceilingHeight"],
  lot:        [],
  building:   ["totalFloors"],
  etc:        [],
};

/** Toast 메시지용 필드 레이블 */
const FIELD_LABELS: Record<string, string> = {
  completionStatus: "Completion Status",
  roadFrontageM:    "Road Frontage",
  footTraffic:      "Foot Traffic Description",
  ceilingHeight:    "Ceiling Height",
  zoningType:       "Zoning Type",
  totalFloors:      "Total Floors",
  existingTenants:  "Existing Tenants",
};

export default function StepTwoForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [unitType, setUnitType] = useState("condo");
  const [formData, setFormData] = useState({
    // ── 공통 ──
    area:             "",
    parking:          "",
    outstandingPayment: "",
    // ── Condo 전용 ──
    floor:            "",
    bed:              "",
    bath:             "",
    furniture:        "",
    interiored:       "",
    petPolicy:        "",
    yearCompletion:   "",
    amenity:          [] as string[],
    // ── 유형별 확장 필드 ──
    totalFloors:      "",
    completionStatus: "",
    ceilingHeight:    "",
    roadFrontageM:    "",
    footTraffic:      "",
    existingTenants:  "",
    zoningType:       "",
  });

  const [isLoading,    setIsLoading]    = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Step1 unitType 로드
    const step1 = loadFromLocalStorage("step1");
    if (step1?.unitType) setUnitType(step1.unitType);

    // Step2 저장 데이터 복원
    const savedData = loadFromLocalStorage("step2");
    if (savedData) {
      setFormData((prev) => ({ ...prev, ...savedData }));
    }
    setIsLoading(false);
  }, []);

  const handleChange = (name: string, value: string) => {
    if (name === "outstandingPayment") {
      const raw = value.replace(/[^0-9]/g, "");
      if (!isNaN(Number(raw))) {
        setFormData((prev) => ({
          ...prev,
          outstandingPayment: Number(raw).toLocaleString(),
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = () => {
    // 1. Area: 모든 타입에서 필수
    if (!formData.area || parseInt(formData.area) < 1) {
      toast({
        title: "Required Field Missing",
        variant: "destructive",
        description: "Please enter the floor area (sqm).",
      });
      return;
    }

    const isCondo = unitType === "condo";

    if (isCondo) {
      // 2. Condo: Zod 스키마 전체 검증 (기존 로직 유지)
      const result = stepTwoSchema.safeParse({
        ...formData,
        area:               parseInt(formData.area),
        floor:              parseInt(formData.floor || ""),
        bed:                parseInt(formData.bed   || "0"),
        bath:               parseInt(formData.bath  || "0"),
        parking:            parseInt(formData.parking || "0"),
        outstandingPayment: parseFloat(formData.outstandingPayment || "0"),
      });
      if (!result.success) {
        const issue = result.error.issues[0];
        toast({
          title: "Required Field Missing",
          variant: "destructive",
          description: `${issue.path[0]} - ${issue.message}`,
        });
        return;
      }
    } else {
      // 3. 비Condo: 타입별 필수 필드 검증
      const reqFields = TYPE_REQUIRED[unitType] || [];
      for (const field of reqFields) {
        const val = (formData as any)[field];
        if (!val || String(val).trim() === "") {
          const label = FIELD_LABELS[field] || field;
          toast({
            title: "Required Field Missing",
            variant: "destructive",
            description: `Please fill in ${label}.`,
          });
          return;
        }
      }
    }

    const preparedData = {
      ...formData,
      area: formData.area.trim(),
      floor: formData.floor.trim(),
      bed: formData.bed,
      bath: formData.bath,
      parking: formData.parking,
      furniture: formData.furniture,
      interiored: formData.interiored,
      petPolicy: formData.petPolicy,
      yearCompletion: formData.yearCompletion.trim(),
      outstandingPayment: formData.outstandingPayment.trim(),
    };

    setIsSubmitting(true);
    saveToLocalStorage("step2", preparedData);
    setTimeout(() => {
      router.push("/account/unit/registration/step-three");
    }, 400);
  };

  const isCondo = unitType === "condo";

  return (
    <div
      className={`p-6 sm:p-8 mb-10 bg-white ${
        isLoading ? "border-none shadow-none" : "border border-zinc-200/80 shadow-sm"
      } rounded-2xl max-w-4xl mx-auto`}
    >
      {isLoading ? (
        <div className="flex justify-center w-full items-center h-[400px]">
          <Spinner />
        </div>
      ) : (
        <section className="space-y-6">
          <div className="space-y-6">

            {/* ─────────────────────────────────────────────
                Condo Only: Bed / Bath / Parking
            ───────────────────────────────────────────── */}
            {isCondo && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-2">
                    Bedrooms
                  </label>
                  <div className="grid grid-cols-7 gap-1 w-full">
                    {bedOption.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleChange("bed", opt.value)}
                        className={`h-10 px-1 rounded-xl text-xs font-bold transition-all border flex items-center justify-center text-center truncate active:scale-95 ${
                          formData.bed === opt.value
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "border-zinc-200 hover:border-blue-300 bg-white text-zinc-700"
                        }`}
                        title={opt.label}
                      >
                        <span className="truncate">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-2">
                    Bathrooms
                  </label>
                  <div className="grid grid-cols-6 gap-1 w-full">
                    {bathOption.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleChange("bath", opt.value)}
                        className={`h-10 px-1 rounded-xl text-xs font-bold transition-all border flex items-center justify-center text-center truncate active:scale-95 ${
                          formData.bath === opt.value
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "border-zinc-200 hover:border-blue-300 bg-white text-zinc-700"
                        }`}
                        title={opt.label}
                      >
                        <span className="truncate">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-2">
                    Parking Spaces
                  </label>
                  <div className="grid grid-cols-6 gap-1 w-full">
                    {parkingOption.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleChange("parking", opt.value)}
                        className={`h-10 px-1 rounded-xl text-xs font-bold transition-all border flex items-center justify-center text-center truncate active:scale-95 ${
                          formData.parking === opt.value
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "border-zinc-200 hover:border-blue-300 bg-white text-zinc-700"
                        }`}
                        title={opt.label}
                      >
                        <span className="truncate">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────
                Non-Condo: Parking Only
            ───────────────────────────────────────────── */}
            {!isCondo && (
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-2">
                  Parking Spaces
                </label>
                <div className="grid grid-cols-6 gap-1.5 max-w-sm">
                  {parkingOption.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleChange("parking", opt.value)}
                      className={`h-10 px-1 rounded-xl text-xs font-bold transition-all border flex items-center justify-center text-center truncate active:scale-95 ${
                        formData.parking === opt.value
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "border-zinc-200 hover:border-blue-300 bg-white text-zinc-700"
                      }`}
                      title={opt.label}
                    >
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────
                Condo Only: Furniture / Pet / Interior
            ───────────────────────────────────────────── */}
            {isCondo && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2 border-t border-zinc-100">
                {/* Furniture (5 cols) */}
                <div className="lg:col-span-5">
                  <label className="block text-xs font-bold text-zinc-700 mb-2">
                    Furniture
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full">
                    {furnitureOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleChange("furniture", opt.value)}
                        className={`h-11 px-2 rounded-xl text-[11px] sm:text-xs font-bold tracking-tight transition-all border flex items-center justify-center text-center active:scale-95 ${
                          formData.furniture === opt.value
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "border-zinc-200 hover:border-blue-300 bg-white text-zinc-700"
                        }`}
                        title={opt.label}
                      >
                        <span className="leading-tight">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pet Policy (4 cols) */}
                <div className="lg:col-span-4">
                  <label className="block text-xs font-bold text-zinc-700 mb-2">
                    Pet Policy
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full">
                    {petPolicyOption.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleChange("petPolicy", opt.value)}
                        className={`h-11 px-2 rounded-xl text-[11px] sm:text-xs font-bold tracking-tight transition-all border flex items-center justify-center text-center active:scale-95 ${
                          formData.petPolicy === opt.value
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "border-zinc-200 hover:border-blue-300 bg-white text-zinc-700"
                        }`}
                        title={opt.label}
                      >
                        <span className="leading-tight">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interior (3 cols) */}
                <div className="lg:col-span-3">
                  <label className="block text-xs font-bold text-zinc-700 mb-2">
                    Interior
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 w-full">
                    {interioredOption.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleChange("interiored", opt.value)}
                        className={`h-11 px-2 rounded-xl text-[11px] sm:text-xs font-bold tracking-tight transition-all border flex items-center justify-center text-center active:scale-95 ${
                          formData.interiored === opt.value
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "border-zinc-200 hover:border-blue-300 bg-white text-zinc-700"
                        }`}
                        title={opt.label}
                      >
                        <span className="leading-tight">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────
                Common Numeric Inputs: Area, Floor, Year, Commission
            ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-zinc-100">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Floor Area (sqm) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full border border-zinc-200 rounded-xl h-11 px-3.5 text-sm font-semibold placeholder:text-zinc-400 placeholder:font-normal"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>

              {isCondo && (
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Floor Level <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="floor"
                    value={formData.floor}
                    onChange={(e) => handleChange(e.target.name, e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full border border-zinc-200 rounded-xl h-11 px-3.5 text-sm placeholder:text-zinc-400"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
              )}

              {isCondo && (
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Year of Completion
                  </label>
                  <Input
                    type="text"
                    name="yearCompletion"
                    value={formData.yearCompletion}
                    onChange={(e) => handleChange(e.target.name, e.target.value)}
                    placeholder="e.g. 2024"
                    className="w-full border border-zinc-200 rounded-xl h-11 px-3.5 text-sm placeholder:text-zinc-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Commission (₱)
                </label>
                <Input
                  type="text"
                  name="outstandingPayment"
                  value={formData.outstandingPayment}
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                  placeholder="e.g. 45,000"
                  className="w-full border border-zinc-200 rounded-xl h-11 px-3.5 text-sm text-right font-semibold placeholder:text-zinc-400 placeholder:font-normal"
                />
              </div>
            </div>

            {/* ─────────────────────────────────────────────
                Property-Type Specific Extended Fields
            ───────────────────────────────────────────── */}
            {unitType === "office" && (
              <div className="border-t border-zinc-100 pt-6">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4">
                  Office Details
                </p>
                <OfficeFields formData={formData} onChange={handleChange} />
              </div>
            )}
            {unitType === "commercial" && (
              <div className="border-t border-zinc-100 pt-6">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4">
                  Commercial Details
                </p>
                <CommercialFields formData={formData} onChange={handleChange} />
              </div>
            )}
            {unitType === "warehouse" && (
              <div className="border-t border-zinc-100 pt-6">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4">
                  Warehouse Details
                </p>
                <WarehouseFields formData={formData} onChange={handleChange} />
              </div>
            )}
            {unitType === "lot" && (
              <div className="border-t border-zinc-100 pt-6">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4">
                  Lot Details
                </p>
                <LotFields formData={formData} onChange={handleChange} />
              </div>
            )}
            {unitType === "building" && (
              <div className="border-t border-zinc-100 pt-6">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4">
                  Building Details
                </p>
                <BuildingFields formData={formData} onChange={handleChange} />
              </div>
            )}

            {/* ─────────────────────────────────────────────
                Condo Only: Amenities
            ───────────────────────────────────────────── */}
            {isCondo && (
              <div className="col-span-2 md:col-span-1">
                <TagInput
                  label="Amenities List"
                  value={formData.amenity}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, amenity: value }))
                  }
                />
              </div>
            )}
          </div>

          <div className="w-full flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-6 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => router.push("/account/unit/registration/step-one")}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all text-center"
            >
              ← Back: Basic Info
            </button>
            <div className="w-full sm:w-auto">
              <SubmitButton
                isSubmitting={isSubmitting}
                onClick={handleNext}
                label="Next: Photos & Description →"
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
