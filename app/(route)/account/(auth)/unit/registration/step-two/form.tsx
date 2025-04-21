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
  floorOption,
} from "@/lib/config/unit-options";
import SelectionBox from "@/components/ui/select-box";
import { SubmitButton } from "@/components/ui/submit-btn";
import { useToast } from "@/hooks/use-toast";

export default function StepTwoForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    area: "",
    floor: "",
    bed: "0",
    bath: "1",
    parking: "0",
    furniture: "unfurnished", // 가구 상태 기본값 설정
    interiored: "Interiored",
    petPolicy: "Not allowed", // 애완동물 정책 기본값 설정
    yearCompletion: "",
    outstandingPayment: "",
    amenity: [] as string[], // 'string[]'으로 타입 지정
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const savedData = loadFromLocalStorage("step2");
    if (savedData) {
      setFormData((prev) => ({
        ...prev,
        ...savedData,
      }));
    }
    setIsLoading(false); // 데이터 로딩 완료 후 UI 업데이트
  }, []);

  const handleChange = (name: string, value: string) => {
    if (name === "outstandingPayment") {
      const rawValue = value.replace(/[^0-9]/g, "");
      if (!isNaN(Number(rawValue))) {
        const formattedValue = Number(rawValue).toLocaleString();
        setFormData({ ...formData, outstandingPayment: formattedValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNext = () => {
    const result = stepTwoSchema.safeParse({
      ...formData,
      area: parseInt(formData.area),
      floor: parseInt(formData.floor || ""),
      bed: parseInt(formData.bed || "0"),
      bath: parseInt(formData.bath || "0"),
      parking: parseInt(formData.parking || "0"),
      outstandingPayment: parseFloat(formData.outstandingPayment || "0"),
    });

    if (!result.success) {
      toast({
        title: "Incomplete Step",
        variant: "destructive",
        description: (
          <div>
            {result.error.issues.map((issue, index) => (
              <p key={index} className="text-lg  font-semibold">
                {issue.path[0]}- {issue.message}
                <br />
              </p>
            ))}
          </div>
        ),
      });
    } else {
      setIsSubmitting(true);
      saveToLocalStorage("step2", formData);

      // 모의 로딩 시간 추가
      setTimeout(() => {
        router.push("/account/unit/registration/step-three");
      }, 1000);
    }
  };

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
            {/* Bed, Bath, Parking Section */}
            <div className="col-span-2 md:col-span-1 grid grid-cols-3 md:grid-cols-1 gap-4">
              {/* 침실 수 */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">
                  Bedrooms
                </label>
                <SelectionBox
                  options={bedOption}
                  selectedValue={formData.bed}
                  onSelect={(value) => handleChange("bed", value)}
                  className="w-full space-x-2"
                  boxClassName="h-12 w-12 md:h-10 md:w-10"
                  textClassName="text-xs"
                />
              </div>

              {/* 욕실 수 */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">
                  Bathrooms
                </label>
                <SelectionBox
                  options={bathOption}
                  selectedValue={formData.bath}
                  onSelect={(value) => handleChange("bath", value)}
                  className="w-full space-x-2"
                  boxClassName="h-12 w-12 md:h-10 md:w-10"
                  textClassName="text-xs"
                />
              </div>

              {/* 주차 공간 수 */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">
                  Parking Spaces
                </label>
                <SelectionBox
                  options={parkingOption}
                  selectedValue={formData.parking}
                  onSelect={(value) => handleChange("parking", value)}
                  className="w-full space-x-2"
                  boxClassName="h-12 w-12 md:h-10 md:w-10"
                  textClassName="text-xs"
                />
              </div>
            </div>

            {/* Furniture & Pet Policy Section */}
            <div className="col-span-2 md:col-span-1 grid grid-cols-2 md:grid-cols-1 gap-4">
              {/* 가구 상태 */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">
                  Furniture Status
                </label>
                <SelectionBox
                  options={furnitureOptions.slice(1).reverse()}
                  selectedValue={formData.furniture}
                  onSelect={(value) => handleChange("furniture", value)}
                  className="w-full md:space-x-2"
                  boxClassName="h-12 md:h-10 w-full"
                  textClassName="text-xs"
                />
              </div>

              {/* 애완동물 정책 */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">
                  Pet Policy
                </label>
                <SelectionBox
                  options={petPolicyOption.slice(1).reverse()}
                  selectedValue={formData.petPolicy}
                  onSelect={(value) => handleChange("petPolicy", value)}
                  className="w-full md:space-x-2"
                  boxClassName="h-12 md:h-10 w-full"
                  textClassName="text-xs"
                />
              </div>
            </div>

            {/* Interior Condition */}
            <div className="col-span-1 md:col-span-1">
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Interior Condition
              </label>
              <SelectionBox
                options={interioredOption}
                selectedValue={formData.interiored}
                onSelect={(value) => handleChange("interiored", value)}
                className="w-full md:space-x-2"
                textClassName="text-xs"
                boxClassName="h-12 md:h-10 w-full"
              />
            </div>

            {/* Basic Info Section */}
            <div className="col-span-2 md:col-span-1 grid grid-cols-2 md:grid-cols-1 gap-4">
              {/* 면적 */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">
                  Area (m²)
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

              {/* 층수 */}
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

              {/* 완공 연도 */}
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

              {/* 커미션 */}
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

            {/* Amenities */}
            <div className="col-span-2 md:col-span-1">
              <TagInput
                label="Amenities List"
                value={formData.amenity}
                onChange={(value) =>
                  setFormData({ ...formData, amenity: value })
                }
              />
            </div>
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
