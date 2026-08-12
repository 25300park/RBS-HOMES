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

/** 타입별 필수 입력 필드 (etc: 빈 배열 → area 공통 체크만 통과하면 제출 가능) */
const TYPE_REQUIRED: Record<string, string[]> = {
  office:     ["completionStatus"],
  commercial: ["completionStatus", "roadFrontageM", "footTraffic"],
  warehouse:  ["ceilingHeight"],
  lot:        ["roadFrontageM", "zoningType"],
  building:   ["totalFloors", "existingTenants"],
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
    parking:          "0",
    outstandingPayment: "",
    // ── Condo 전용 ──
    floor:            "",
    bed:              "0",
    bath:             "1",
    furniture:        "unfurnished",
    interiored:       "Interiored",
    petPolicy:        "Not allowed",
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
        title: "Incomplete Step",
        variant: "destructive",
        description: (
          <p className="text-lg font-semibold">area - Area is required</p>
        ),
      });
      return;
    }

    const isCondo = unitType === "condo";  // etc는 비Condo 분기(area만 체크)로 처리

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
        toast({
          title: "Incomplete Step",
          variant: "destructive",
          description: (
            <div>
              {result.error.issues.map((issue, i) => (
                <p key={i} className="text-lg font-semibold">
                  {issue.path[0]} - {issue.message}
                  <br />
                </p>
              ))}
            </div>
          ),
        });
        return;
      }
    } else {
      // 3. 비Condo: 타입별 필수 필드 검증
      const required = TYPE_REQUIRED[unitType] ?? [];
      const missing  = required.filter((field) => {
        const val = (formData as Record<string, unknown>)[field];
        return !val || (typeof val === "string" && val.trim() === "");
      });
      if (missing.length > 0) {
        toast({
          title: "Incomplete Step",
          variant: "destructive",
          description: (
            <div>
              {missing.map((field, i) => (
                <p key={i} className="text-lg font-semibold">
                  {FIELD_LABELS[field] ?? field} - Required
                  <br />
                </p>
              ))}
            </div>
          ),
        });
        return;
      }
    }

    setIsSubmitting(true);
    saveToLocalStorage("step2", formData);
    setTimeout(() => {
      router.push("/account/unit/registration/step-three");
    }, 1000);
  };

  const isCondo = unitType === "condo";  // etc는 비Condo 분기 → 공통(Area/Parking/Commission)만 표시

  return (
    <div
      className={`p-6 md:p-4 mb-10 md:mb-0 bg-white md:shadow-none md:border-none ${
        isLoading ? "border-none shadow-none" : "border"
      } rounded-lg shadow-md max-w-[1140px] mx-auto`}
    >
      {isLoading ? (
        <div className="flex justify-center w-full items-center h-[500px]">
          <Spinner />
        </div>
      ) : (
        <section className="space-y-6 md:space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-6 md:gap-4">

            {/* ─────────────────────────────────────────────
                Condo 전용: Bed / Bath / Parking (한 줄)
            ───────────────────────────────────────────── */}
            {isCondo && (
              <div className="col-span-2 md:col-span-1 grid grid-cols-3 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">
                    Bedrooms
                  </label>
                  <SelectionBox
                    options={bedOption}
                    selectedValue={formData.bed}
                    onSelect={(v) => handleChange("bed", v)}
                    className="w-full space-x-2"
                    boxClassName="h-12 w-12 md:h-10 md:w-10"
                    textClassName="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">
                    Bathrooms
                  </label>
                  <SelectionBox
                    options={bathOption}
                    selectedValue={formData.bath}
                    onSelect={(v) => handleChange("bath", v)}
                    className="w-full space-x-2"
                    boxClassName="h-12 w-12 md:h-10 md:w-10"
                    textClassName="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">
                    Parking Spaces
                  </label>
                  <SelectionBox
                    options={parkingOption}
                    selectedValue={formData.parking}
                    onSelect={(v) => handleChange("parking", v)}
                    className="w-full space-x-2"
                    boxClassName="h-12 w-12 md:h-10 md:w-10"
                    textClassName="text-xs"
                  />
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────
                비Condo 전용: Parking 단독
            ───────────────────────────────────────────── */}
            {!isCondo && (
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-medium text-zinc-500 mb-1">
                  Parking Spaces
                </label>
                <SelectionBox
                  options={parkingOption}
                  selectedValue={formData.parking}
                  onSelect={(v) => handleChange("parking", v)}
                  className="w-full space-x-2"
                  boxClassName="h-12 w-12 md:h-10 md:w-10"
                  textClassName="text-xs"
                />
              </div>
            )}

            {/* ─────────────────────────────────────────────
                Condo 전용: Furniture & Pet Policy
            ───────────────────────────────────────────── */}
            {isCondo && (
              <div className="col-span-2 md:col-span-1 grid grid-cols-2 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">
                    Furniture Status
                  </label>
                  <SelectionBox
                    options={furnitureOptions.slice(1).reverse()}
                    selectedValue={formData.furniture}
                    onSelect={(v) => handleChange("furniture", v)}
                    className="w-full md:space-x-2"
                    boxClassName="h-12 md:h-10 w-full"
                    textClassName="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">
                    Pet Policy
                  </label>
                  <SelectionBox
                    options={petPolicyOption.slice(1).reverse()}
                    selectedValue={formData.petPolicy}
                    onSelect={(v) => handleChange("petPolicy", v)}
                    className="w-full md:space-x-2"
                    boxClassName="h-12 md:h-10 w-full"
                    textClassName="text-xs"
                  />
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────
                Condo 전용: Interior Condition
            ───────────────────────────────────────────── */}
            {isCondo && (
              <div className="col-span-1 md:col-span-1">
                <label className="block text-xs font-medium text-zinc-500 mb-1">
                  Interior Condition
                </label>
                <SelectionBox
                  options={interioredOption}
                  selectedValue={formData.interiored}
                  onSelect={(v) => handleChange("interiored", v)}
                  className="w-full md:space-x-2"
                  textClassName="text-xs"
                  boxClassName="h-12 md:h-10 w-full"
                />
              </div>
            )}

            {/* ─────────────────────────────────────────────
                공통: Area + Commission
                Condo 추가: Floor, Year of Completion
            ───────────────────────────────────────────── */}
            <div className="col-span-2 md:col-span-1 grid grid-cols-2 md:grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">
                  Area (m²) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                  placeholder="Area (m²)"
                  className="w-full border border-gray-300 rounded-md"
                />
              </div>

              {isCondo && (
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">
                    Floor
                  </label>
                  <Input
                    type="text"
                    name="floor"
                    value={formData.floor}
                    onChange={(e) => handleChange(e.target.name, e.target.value)}
                    placeholder="Floor of building"
                    className="w-full border border-gray-300 rounded-md"
                  />
                </div>
              )}

              {isCondo && (
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">
                    Year of Completion
                  </label>
                  <Input
                    type="text"
                    name="yearCompletion"
                    value={formData.yearCompletion}
                    onChange={(e) => handleChange(e.target.name, e.target.value)}
                    placeholder="Year of Completion"
                    className="w-full border border-gray-300 rounded-md"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">
                  Commission
                </label>
                <Input
                  type="text"
                  name="outstandingPayment"
                  value={formData.outstandingPayment}
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                  placeholder="Commission"
                  className="w-full border border-gray-300 rounded-md text-right"
                />
              </div>
            </div>

            {/* ─────────────────────────────────────────────
                유형별 확장 필드 블록
            ───────────────────────────────────────────── */}
            {unitType === "office" && (
              <div className="col-span-2 md:col-span-1 border-t pt-6 md:pt-4">
                <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-4">
                  Office Details
                </p>
                <OfficeFields formData={formData} onChange={handleChange} />
              </div>
            )}
            {unitType === "commercial" && (
              <div className="col-span-2 md:col-span-1 border-t pt-6 md:pt-4">
                <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-4">
                  Commercial Details
                </p>
                <CommercialFields formData={formData} onChange={handleChange} />
              </div>
            )}
            {unitType === "warehouse" && (
              <div className="col-span-2 md:col-span-1 border-t pt-6 md:pt-4">
                <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-4">
                  Warehouse Details
                </p>
                <WarehouseFields formData={formData} onChange={handleChange} />
              </div>
            )}
            {unitType === "lot" && (
              <div className="col-span-2 md:col-span-1 border-t pt-6 md:pt-4">
                <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-4">
                  Lot Details
                </p>
                <LotFields formData={formData} onChange={handleChange} />
              </div>
            )}
            {unitType === "building" && (
              <div className="col-span-2 md:col-span-1 border-t pt-6 md:pt-4">
                <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-4">
                  Building Details
                </p>
                <BuildingFields formData={formData} onChange={handleChange} />
              </div>
            )}

            {/* ─────────────────────────────────────────────
                Condo 전용: Amenities
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

          <div className="w-full flex justify-end pt-4">
            <SubmitButton
              isSubmitting={isSubmitting}
              onClick={handleNext}
              label="Save & Continue"
            />
          </div>
        </section>
      )}
    </div>
  );
}
