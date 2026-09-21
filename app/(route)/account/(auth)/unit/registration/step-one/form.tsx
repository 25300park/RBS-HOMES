"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    if (!formData.title.trim()) {
      toast({
        title: "Required Field Missing",
        description: "Please enter a title for the property.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.price.trim() || parseFloat(formData.price.replace(/,/g, "")) < 1) {
      toast({
        title: "Invalid Price",
        description: "Price must be at least 1.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.saleType) {
      toast({
        title: "Required Field Missing",
        description: "Please select a sell type.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.unitType) {
      toast({
        title: "Required Field Missing",
        description: "Please select a property type.",
        variant: "destructive",
      });
      return;
    }

    const preparedData = {
      ...formData,
      title: formData.title.trim(),
      price: formData.price.trim(),
      location: formData.location || "Metro Manila, Philippines",
      latitude: formData.latitude || 14.5547,
      longitude: formData.longitude || 121.0244,
      fullAddress: formData.location || "Metro Manila, Philippines",
    };

    setIsSubmitting(true);
    saveToLocalStorage("step1", preparedData);

    setTimeout(() => {
      router.push("/account/unit/registration/step-two");
    }, 400);
  };

  return (
    <div
      className={`p-6 sm:p-8 mb-10 md:mb-0 bg-white ${
        isLoading ? "border-none shadow-none" : "border border-zinc-200/80 shadow-sm"
      } rounded-2xl max-w-4xl mx-auto`}
    >
      {isLoading ? (
        <div className="flex justify-center w-full items-center h-[500px]">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-6">
          {/* AI entry banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3.5 bg-blue-50/80 border border-blue-200/80 rounded-xl">
            <p className="text-xs sm:text-sm text-blue-800 font-semibold tracking-tight">
              ✨ Paste your property description to let AI autofill details
            </p>
            <Link
              href="/account/unit/registration/ai-entry"
              className="shrink-0 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap"
            >
              Autofill with AI →
            </Link>
          </div>

          <section className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs mb-1.5 font-bold text-zinc-700">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="title"
                value={formData.title || ""}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
                placeholder="e.g. Modern 2BR Condo with Balcony in BGC"
                className="w-full border border-zinc-200 rounded-xl h-11 px-3.5 text-sm focus:border-blue-500 placeholder:text-zinc-400"
              />
            </div>

            {/* Price & Sell Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start">
              {/* Price */}
              <div>
                <label className="block text-xs mb-1.5 font-bold text-zinc-700">
                  Price (₱) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="price"
                  value={formData.price || ""}
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                  placeholder="e.g. 45,000"
                  className="w-full border border-zinc-200 rounded-xl h-11 px-3.5 text-sm text-right focus:border-blue-500 font-semibold placeholder:text-zinc-400 placeholder:font-normal"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>

              {/* Sell Type */}
              <div>
                <label className="block text-xs mb-1.5 font-bold text-zinc-700">
                  Sell Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 w-full">
                  {sellTypeOption.slice(1).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSellTypeSelect(opt.value)}
                      className={`h-11 px-2 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-all border flex items-center justify-center text-center truncate active:scale-95 ${
                        formData.saleType === opt.value
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "border-zinc-200 hover:border-blue-300 bg-white text-zinc-700"
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Property Type Selection */}
            <div>
              <label className="block text-xs mb-1.5 font-bold text-zinc-700">
                Property Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full">
                {typeOption.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleChange("unitType", opt.value)}
                    className={`h-11 px-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-all border flex items-center justify-center text-center truncate active:scale-95 ${
                      formData.unitType === opt.value
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "border-zinc-200 hover:border-blue-300 bg-white text-zinc-700"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location & Address Search */}
            <div className="pt-2">
              <label className="block text-xs mb-1.5 font-bold text-zinc-700">
                Location & Address <span className="text-red-500">*</span>
              </label>
              <AddressSearch
                formData={formData}
                setFormData={setFormData}
                className="w-full"
              />
            </div>
          </section>

          <div className="flex justify-end pt-6 border-t border-zinc-100">
            <SubmitButton
              isSubmitting={isSubmitting}
              onClick={handleNext}
              label="Next: Property Details →"
              disabled={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
}