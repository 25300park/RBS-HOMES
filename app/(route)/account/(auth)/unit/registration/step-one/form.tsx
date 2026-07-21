"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { stepOneSchema } from "@/types/schema";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import AddressSearch from "../../../../components/address-search";
import { cities, sellTypeOption, typeOption } from "@/lib/config/unit-options";
import Spinner from "@/components/ui/spinner";
import { SubmitButton } from "@/components/ui/submit-btn";
import SelectionBox from "@/components/ui/select-box";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function StepOneForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    ownerName: "",
    location: "",
    price: "",
    latitude: 0,
    longitude: 0,
    saleType: "rent",
    unitType: "condo",
    ownerEmail: "",
    ownerMobile: "",
    addressSelf: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedData = loadFromLocalStorage("step1");
    if (savedData) {
      setFormData((prev) => ({
        ...prev,
        ...savedData,
      }));
    }
    setIsLoading(false);
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

  // 판매 유형 선택 처리 핸들러
  const handleSellTypeSelect = (value: string) => {
    // presale 선택 시 권한 체크
    if (value === "presale") {
      // 사용자 레벨 확인 (session에서 가져옴)
      const userLevel = session?.user?.level as number;
      const hasPreSalePermission = [0,20,30,40].includes(userLevel);
      
      if (!hasPreSalePermission) {
        // 권한 없음 토스트 메시지 표시
        toast({
          title: "Permission Denied",
          description: "You don't have permission to use Pre-sale feature. Please contact the administrator.",
          variant: "destructive"
        });
        return; // 처리 중단
      }
    }
    
    // 권한 있거나 다른 옵션 선택 시 정상 처리
    handleChange("saleType", value);
  };

  const handleNext = () => {
    const result = stepOneSchema.safeParse({
      ...formData,
      price: parseFloat(formData.price.replace(/,/g, "")),
    });

    if (!result.success) {
      toast({
        title: "Incomplete Step",
        description: (
          <div>
            {result.error.issues.map((issue, index) => (
              <p key={index} className="text-md text-red-500 font-semibold">
                - {issue.message}
                <br />
              </p>
            ))}
          </div>
        ),
      });
    } else {
      setIsSubmitting(true);
      saveToLocalStorage("step1", formData);

      setTimeout(() => {
        router.push("/account/unit/registration/step-two");
      }, 1000);
    }
  };

  return (
    <div
      className={`p-6 md:p-4 mb-10 md:mb-0 bg-white ${
        isLoading ? "border-none shadow-none" : "border"
      } rounded-lg shadow-md max-w-[1140px] mx-auto md:shadow-none md:border-none`}
    >
      {isLoading ? (
        <div className="flex justify-center w-full items-center h-[500px]">
          <Spinner />
        </div>
      ) : (
        <div>
          {/* AI entry banner */}
          <div className="flex items-center justify-between gap-4 mb-6 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              매물 설명을 붙여넣기만 하면 AI가 자동으로 채워드려요
            </p>
            <Link
              href="/account/unit/registration/ai-entry"
              className="flex-shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              AI로 빠르게 작성하기 →
            </Link>
          </div>

          <section className="grid grid-cols-2 md:grid-cols-1 gap-6 md:gap-4">
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
            <div className="md:hidden block">
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

            {/* Price and Sell Type Container */}
            <div className="flex gap-4 w-full md:flex-col md:gap-0 md:col-span-2 relative">
              {/* Price */}
              <div className="w-full">
                <label className="block text-xs mb-1 font-medium text-zinc-500">
                  Price (required)
                </label>
                <Input
                  type="text"
                  name="price"
                  value={formData.price || ""}
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                  placeholder="Enter price"
                  className="w-full border border-gray-300 rounded-md text-right"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
              {/* Sell Type */}
              <div className="md:mt-4 ">
                <label className="block text-xs mb-1 font-medium text-zinc-500">
                  Sell Type
                </label>
                <SelectionBox
                  options={sellTypeOption.slice(1)}
                  selectedValue={formData.saleType}
                  onSelect={handleSellTypeSelect} // 수정된 핸들러 사용
                  className="w-full space-x-0 flex gap-2"
                  boxClassName="h-11 md:text-sm md:w-full"
                />
                <p className="text-xs text-right absolute right-0 w-full mt-1 text-zinc-500">
                  Your information will be entered on the [
                  {formData.saleType === "rent"
                    ? "RENT"
                    : formData.saleType === "sale"
                    ? "BUY"
                    : "PRE SALE"}
                  ] page.
                </p>
              </div>
            </div>

            {/* Owner Contact and Property Type Container */}
            <div className="flex col-span-2 gap-6 md:flex-col">
              {/* Owner Contact Information */}
              <div className="md:col-span-2 hidden md:block">
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
              <div className="w-full space-y-4">
                <div>
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
                <div>
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
                  />
                </div>
              </div>
              {/* Property Type */}
              <div className="w-full h-full flex flex-col justify-end md:h-auto">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Property Type
                </label>
                <SelectionBox
                  options={typeOption.slice(1)}
                  selectedValue={formData.unitType}
                  onSelect={(value) => handleChange("unitType", value)}
                  className="space-x-0 flex justify-between md:grid md:grid-cols-3 md:gap-4"
                  boxClassName="md:text-sm  md:h-fit md:py-2 md:px-0"
                />
              </div>
            </div>
          </section>

          {/* Location */}
          <div className="mt-12 md:mt-8">
            <label className="block text-xs mb-1 font-medium text-zinc-500">
              Location
            </label>
            <AddressSearch formData={formData} setFormData={setFormData} />
          </div>

          {/* Submit Button */}
          <div className="w-full flex justify-end mt-4">
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