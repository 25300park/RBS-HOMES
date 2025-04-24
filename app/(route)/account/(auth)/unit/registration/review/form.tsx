"use client";

import React, { useEffect, useState } from "react";
import { loadFromLocalStorage, clearRegistrationSteps } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { SubmitButton } from "@/components/ui/submit-btn";
import { registerUnit } from "./action";
import { useToast } from "@/hooks/use-toast";
import GalleryConverter from "@/app/(route)/unit/components/gallery-converter";
import { useSession } from "next-auth/react";

const ReviewForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [stepOneData, setStepOneData] = useState<any>(null);
  const [stepTwoData, setStepTwoData] = useState<any>(null);
  const [stepThreeData, setStepThreeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>();

  useEffect(() => {
    const step1 = loadFromLocalStorage("step1");
    const step2 = loadFromLocalStorage("step2");
    const step3 = loadFromLocalStorage("step3");

    if (step1) setStepOneData(step1);
    if (step2) setStepTwoData(step2);
    if (step3) setStepThreeData(step3);

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (stepOneData && stepTwoData && stepThreeData) {
      setFormData({
        ...stepOneData,
        ...stepTwoData,
        images: stepThreeData?.images.map((img: any) => img.url) || [],
        note: stepThreeData?.note || "",
      });
    }
  }, [stepOneData, stepTwoData, stepThreeData]);

  // 프리세일 권한 체크 (클라이언트 측)
  const checkPreSalePermission = () => {
    if (stepOneData?.saleType === "presale") {
      const userLevel = session?.user?.level as number;
      return [0,20, 30, 40].includes(userLevel);
    }
    
    // 프리세일이 아니면 항상 true 반환
    return true;
  };

  const handleEditStep = (step: string) => {
    router.push(`/account/unit/registration/step-${step}`);
  };

  const handleFinalizeSubmission = async () => {
    // 제출 전 클라이언트 측에서 한번 더 프리세일 권한 체크
    if (!checkPreSalePermission()) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to register a pre-sale property. Please contact the administrator.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const result = await registerUnit(formData);

      if (result.success) {
        toast({
          title: "Registration Complete",
          description: result.message,
        });

        clearRegistrationSteps();
        router.push("/account/unit/my-list");
      } else {
        // 서버에서 반환된 에러 메시지 표시
        toast({
          title: result.permissionDenied ? "Permission Denied" : "Registration Failed",
          description: result.message,
          variant: "destructive",
        });
        
        // 권한 문제로 인한 실패인 경우 처리 (예: 스텝 1로 돌아가기)
        if (result.permissionDenied) {
          handleEditStep("one");
        }
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "An error occurred while submitting the form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const PropertyInfo = ({ label, value }: { label: string; value: string | number }) => (
    <div>
      <span className="text-sm text-gray-600">{label}:</span>{" "}
      <span className="font-medium">{value}</span>
    </div>
  );

  return (
    <div
      className={`p-4 md:border-none md:shadow-none bg-white mb-20 md:mb-0 ${
        isLoading ? "border-none shadow-none" : "border"
      } rounded-lg shadow-md max-w-[1140px] mx-auto`}
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-[300px]">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-2 md:space-y-2">
          {/* Images Preview */}
          {stepThreeData && (
            <div className="bg-white ">
              <div className="p-6 md:p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Property Images</h3>
                  <Button
                    variant="outline"
                    onClick={() => handleEditStep("three")}
                    className="text-sm"
                  >
                    Edit Images
                  </Button>
                </div>
                <GalleryConverter
                  images={stepThreeData.images.map((image: any) => image.url)}
                  isFavorited={false}
                  unitId={0}
                  isPreview
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-1 gap-6">
            {/* Basic Information */}
            {stepOneData && (
              <div className="bg-white ">
                <div className="p-6 md:p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <Button
                      variant="outline"
                      onClick={() => handleEditStep("one")}
                      className="text-sm"
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="text-xl font-bold text-gray-900">
                      {stepOneData.title}
                    </div>
                    <div className="space-y-2">
                      <PropertyInfo label="Owner" value={stepOneData.ownerName} />
                      <PropertyInfo label="Price" value={`₱${stepOneData.price}`} />
                      <PropertyInfo label="Property Type" value={stepOneData.unitType} />
                      <PropertyInfo 
                        label="Sale Type" 
                        value={
                          stepOneData.saleType === "rent" 
                            ? "Rent" 
                            : stepOneData.saleType === "sale" 
                            ? "Buy" 
                            : "Pre Sale"
                        } 
                      />
                      <PropertyInfo label="Address" value={stepOneData.fullAddress} />
                      {stepOneData.addressSelf && (
                        <div className="text-sm text-gray-500 mt-1">
                          Additional Info: {stepOneData.addressSelf}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Property Details */}
            {stepTwoData && (
              <div className="bg-white ">
                <div className="p-6 md:p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Property Details</h3>
                    <Button
                      variant="outline"
                      onClick={() => handleEditStep("two")}
                      className="text-sm"
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <PropertyInfo label="Area" value={`${stepTwoData.area} m²`} />
                    <PropertyInfo label="Bedrooms" value={stepTwoData.bed} />
                    <PropertyInfo label="Bathrooms" value={stepTwoData.bath} />
                    <PropertyInfo label="Parking Spaces" value={stepTwoData.parking} />
                    <PropertyInfo label="Floor" value={stepTwoData.floor} />
                    <PropertyInfo label="Furniture Status" value={stepTwoData.furniture} />
                    <PropertyInfo label="Pet Policy" value={stepTwoData.petPolicy} />
                    {stepTwoData.amenity && stepTwoData.amenity.length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm text-gray-600 mb-2">Amenities</div>
                        <div className="flex flex-wrap gap-2">
                          {stepTwoData.amenity.map((amenity: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-orange-50 text-orange-600 rounded text-sm"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 프리세일 권한 경고 (필요시 표시) */}
          {stepOneData?.saleType === "presale" && !checkPreSalePermission() && (
            <div className="p-4 mt-4 bg-red-50 text-red-700 rounded-md">
              <p className="font-medium">Permission Alert:</p>
              <p>You don't have permission to register a pre-sale property. The submission will be rejected.</p>
              <p className="mt-2">Please go back to Step 1 to change the sale type or contact the administrator for permission.</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="w-full flex justify-end pt-2">
            <SubmitButton
              isSubmitting={isSubmitting}
              onClick={handleFinalizeSubmission}
              label="Complete Registration"
              // 프리세일 권한이 없는 경우에도 버튼은 활성화하되, 클릭 시 에러 메시지를 표시합니다
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewForm;