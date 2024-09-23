"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { stepTwoSchema } from "@/types/schema";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/ui/tag-input";

export default function StepTwoForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    area: "",
    floor: "",
    bed: "",
    bath: "",
    parking: "",
    furniture: "",
    interiored: "",
    petPolicy: "",
    yearCompletion: "",
    outstandingPayment: "",
    amenity: [] as string[], // 'string[]'으로 타입 지정
  });
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const savedData = loadFromLocalStorage("step2");
    if (savedData) {
      setFormData((prev) => ({
        ...prev,
        ...savedData,
      }));
    }
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    // Validate form data
    const result = stepTwoSchema.safeParse({
      ...formData,
      area: parseInt(formData.area), // Ensure area is a number
      floor: parseInt(formData.floor || "0"), // Optional field
      bed: parseInt(formData.bed || "0"), // Optional field
      bath: parseInt(formData.bath || "0"), // Optional field
      parking: parseInt(formData.parking || "0"), // Optional field
      outstandingPayment: parseFloat(formData.outstandingPayment || "0.00"),
    });

    if (!result.success) {
      // If validation fails, display errors
      setErrors(result.error.issues.map((issue) => issue.message));
    } else {
      // Save to local storage and go to next step
      saveToLocalStorage("step2", formData);
      router.push("/account/unit/registration/step-three");
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl mb-4">Step 2: Unit Details</h2>

      {errors.length > 0 && (
        <div className="text-red-500 mb-4">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {/* Area (평방미터) */}
        <Input
          type="number"
          name="area"
          value={formData.area}
          onChange={handleChange}
          placeholder="Area (m²)"
          className="mb-2 p-2 border w-full"
        />
        
        {/* 층수 */}
        <Input
          type="number"
          name="floor"
          value={formData.floor}
          onChange={handleChange}
          placeholder="Floor"
          className="mb-2 p-2 border w-full"
        />
        
        {/* 침실 수 */}
        <Input
          type="number"
          name="bed"
          value={formData.bed}
          onChange={handleChange}
          placeholder="Number of Bedrooms"
          className="mb-2 p-2 border w-full"
        />

        {/* 욕실 수 */}
        <Input
          type="number"
          name="bath"
          value={formData.bath}
          onChange={handleChange}
          placeholder="Number of Bathrooms"
          className="mb-2 p-2 border w-full"
        />
        
        {/* 주차 공간 수 */}
        <Input
          type="number"
          name="parking"
          value={formData.parking}
          onChange={handleChange}
          placeholder="Parking Spaces"
          className="mb-2 p-2 border w-full"
        />
        
        {/* 가구 정보 */}
        <Input
          type="text"
          name="furniture"
          value={formData.furniture}
          onChange={handleChange}
          placeholder="Furniture Information"
          className="mb-2 p-2 border w-full"
        />
        
        {/* 내부 인테리어 상태 */}
        <Input
          type="text"
          name="interiored"
          value={formData.interiored}
          onChange={handleChange}
          placeholder="Interior Condition"
          className="mb-2 p-2 border w-full"
        />

        {/* 애완동물 정책 */}
        <Input
          type="text"
          name="petPolicy"
          value={formData.petPolicy}
          onChange={handleChange}
          placeholder="Pet Policy"
          className="mb-2 p-2 border w-full"
        />

        {/* 편의시설 (어매니티) 태그 입력 */}
        <TagInput
          label="Amenities"
          value={formData.amenity}
          onChange={(value) => setFormData({ ...formData, amenity: value })}
        />

        {/* 완공 연도 */}
        <Input
          type="text"
          name="yearCompletion"
          value={formData.yearCompletion}
          onChange={handleChange}
          placeholder="Year of Completion"
          className="mb-2 p-2 border w-full"
        />
        
        {/* 미납 금액 */}
        <Input
          type="text"
          name="outstandingPayment"
          value={formData.outstandingPayment}
          onChange={handleChange}
          placeholder="Outstanding Payment"
          className="mb-2 p-2 border w-full"
        />
      </div>

      <Button className="bg-blue-500 text-white p-2 rounded mt-4" onClick={handleNext}>
        Next Step
      </Button>
    </div>
  );
}
