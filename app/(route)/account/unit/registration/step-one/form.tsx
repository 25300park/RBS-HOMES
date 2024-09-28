"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { stepOneSchema } from "@/types/schema";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import AddressSearch from "../../../components/address-search";
import { cities, sellTypeOption, typeOption } from "@/lib/config/unit-options";
import Spinner from "@/components/ui/spinner";
import { SubmitButton } from "@/components/ui/submit-btn";
import SelectionBox from "@/components/ui/select-box";
import { useToast } from "@/hooks/use-toast";

export default function StepOneForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    ownerName: "",
    location: "",
    price: "",
    saleType: "rent",
    unitType: "condo",
    ownerEmail: "",
    ownerMobile: "",
    addressSelf: "", // 유저가 입력한 추가 주소 정보
  });
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [isSubmitting, setIsSubmitting] = useState(false); // 제출 로딩 상태

  useEffect(() => {
    // 로컬 스토리지 데이터 불러오기
    const savedData = loadFromLocalStorage("step1");
    if (savedData) {
      setFormData((prev) => ({
        ...prev,
        ...savedData,
      }));
    }
    setIsLoading(false); // 데이터 로딩 완료 후 UI 업데이트
  }, []);

  const handleChange = (name: string, value: string) => {
    if (name === "price") {
      const rawValue = value.replace(/[^0-9]/g, "");
      if (!isNaN(Number(rawValue))) {
        const formattedValue = Number(rawValue).toLocaleString();
        setFormData({ ...formData, price: formattedValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNext = () => {
    const result = stepOneSchema.safeParse({
      ...formData,
      price: parseFloat(formData.price.replace(/,/g, "")),
    });

    if (!result.success) {
      // setErrors(result.error.issues.map((issue) => issue.message));
      toast({
        title: "Incomplete Step",
        description: (
          <div>
            {result.error.issues.map((issue, index) => (
              <p key={index} className="text-lg text-red-500 font-semibold">
                - {issue.message}
                <br />
              </p>
            ))}
          </div>
        ),
      });
    } else {
      setIsSubmitting(true); // 제출 중 상태로 변경
      saveToLocalStorage("step1", formData);

      // 1초 지연 후에 다음 페이지로 이동 (모의 로딩 시간)
      setTimeout(() => {
        router.push("/account/unit/registration/step-two");
      }, 1000);
    }
  };

  return (
    <div
      className={`p-6 bg-white  ${
        isLoading ? "border-none shadow-none" : "border"
      } rounded-lg shadow-md max-w-[1140px] mx-auto`}
    >
      {/* {errors.length > 0 && (
        <div className="text-red-500 mb-4">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )} */}

      {/* 로딩 상태일 때 */}
      {isLoading ? (
        <div className="flex justify-center w-full  items-center h-[500px]">
          <Spinner />
        </div>
      ) : (
        <div>
          {/* Address Search */}
          <div className="md:col-span-2">
            <section className="grid grid-cols-2 md:grid-cols-2 gap-6 gap-y-4">
              {/* Title */}
              <div className="col-span-2">
                <label className="block text-xs mb-1 font-medium text-zinc-500">
                  Title (required)
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title || ""}
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                  placeholder="Enter a title for the unit"
                  className="w-full border border-gray-300 rounded-md"
                />
              </div>

              {/* Owner's Name */}
              <div>
                <label className="block text-xs mb-1 font-medium text-zinc-500">
                  Owner Name
                </label>
                <Input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName || ""}
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                  placeholder="Enter owner's name"
                  className="w-full border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex gap-4">
                {/* Price */}
                <div className="w-full">
                  <label className="block text-xs mb-1 font-medium text-zinc-500">
                    Price (required)
                  </label>
                  <Input
                    type="text"
                    name="price"
                    value={formData.price || ""}
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                    placeholder="Enter price"
                    className="w-full border border-gray-300 rounded-md text-right"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
                {/* Sell Type */}
                <div className="">
                  <label className="block text-xs mb-1 font-medium text-zinc-500">
                    Sell Type
                  </label>
                  <SelectionBox
                    options={sellTypeOption.slice(1)} // 아이콘이 없는 옵션을 전달
                    selectedValue={formData.saleType}
                    onSelect={(value) => handleChange("saleType", value)} // 통합된 핸들러 사용
                    className="w-full space-x-0 flex gap-2"
                    boxClassName="h-11"
                  />
                </div>
              </div>
              <div className="flex col-span-2 gap-6">
                <div className="w-full">
                  <div className="w-full mb-4">
                    <label className="block text-xs mb-1 font-medium text-zinc-500">
                      Owner Contact No.
                    </label>
                    <Input
                      type="text"
                      name="ownerMobile"
                      value={formData.ownerMobile || ""}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                      placeholder="Enter owner's contact number"
                      className="w-full border border-gray-300 rounded-md"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-xs mb-1 font-medium text-zinc-500">
                      Owner E-mail
                    </label>
                    <Input
                      type="text"
                      name="ownerEmail"
                      value={formData.ownerEmail || ""}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                      placeholder="Enter owner's e-mail"
                      className="w-full border border-gray-300 rounded-md"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </div>
                </div>
                {/* Property Type */}
                <div className="w-full h-full flex flex-col justify-end">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Property Type
                  </label>
                  <SelectionBox
                    options={typeOption.slice(1)} // 아이콘이 있는 옵션을 전달
                    selectedValue={formData.unitType}
                    onSelect={(value) => handleChange("unitType", value)} // 통합된 핸들러 사용
                    className="space-x-0 flex justify-between"
                    boxClassName=""
                  />
                </div>
              </div>
            </section>
            <label className="block text-xs mb-1 font-medium text-zinc-500 mt-12">
              Location
            </label>
            <AddressSearch formData={formData} setFormData={setFormData} />
          </div>

          <div className="w-full flex justify-end">
            <SubmitButton
              isSubmitting={isSubmitting}
              onClick={handleNext}
              label="Save & Continue"
            />
          </div>
        </div>
      )}
    </div>
  );
}
