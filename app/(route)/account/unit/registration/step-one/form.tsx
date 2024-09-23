"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { stepOneSchema } from "@/types/schema";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import AddressSearch from "../../../components/address-search";

export default function StepOneForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    ownerName: "",
    location: "",
    description: "",
    price: "",
    saleType: "",
    unitType: "",
    addressSelf: "", // 유저가 입력한 추가 주소 정보
  });
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const savedData = loadFromLocalStorage("step1");
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
    const result = stepOneSchema.safeParse({
      ...formData,
      price: parseFloat(formData.price.toString()), // Ensure price is a number
    });

    if (!result.success) {
      // If validation fails, display errors
      setErrors(result.error.issues.map((issue) => issue.message));
    } else {
      // Save to local storage and go to next step
      saveToLocalStorage("step1", formData);
      router.push("/account/unit/registration/step-two");
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl mb-4">Step 1: Basic Info</h2>

      {errors.length > 0 && (
        <div className="text-red-500 mb-4">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}

      {/* Address Search and Input Fields */}
      <AddressSearch formData={formData} setFormData={setFormData} />

      <Input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Title"
        className="mb-2 p-2 border w-full"
      />
      <Input
        type="text"
        name="ownerName"
        value={formData.ownerName}
        onChange={handleChange}
        placeholder="Owner's Name"
        className="mb-2 p-2 border w-full"
      />

      <Textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        className="mb-2 p-2 border w-full"
      />
      <Input
        type="text"
        name="price"
        value={formData.price}
        onChange={handleChange}
        placeholder="Price"
        className="mb-2 p-2 border w-full"
      />
      <Input
        type="text"
        name="saleType"
        value={formData.saleType}
        onChange={handleChange}
        placeholder="Sale Type"
        className="mb-2 p-2 border w-full"
      />
      <Input
        type="text"
        name="unitType"
        value={formData.unitType}
        onChange={handleChange}
        placeholder="Unit Type"
        className="mb-2 p-2 border w-full"
      />

      <button
        className="bg-blue-500 text-white p-2 rounded mt-4"
        onClick={handleNext}
      >
        Next Step
      </button>
    </div>
  );
}
