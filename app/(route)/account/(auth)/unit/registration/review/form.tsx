"use client";

import React, { useEffect, useState } from "react";
import { loadFromLocalStorage, clearRegistrationSteps } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ThumbSlider from "@/components/ui/thumb-slider";
import Spinner from "@/components/ui/spinner"; // 로딩 스피너 추가
import { useRouter } from "next/navigation";
import { SubmitButton } from "@/components/ui/submit-btn";
import { registerUnit } from "./action";
import { useToast } from "@/hooks/use-toast";

const ReviewForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  // State to hold data from local storage
  const [stepOneData, setStepOneData] = useState<any>(null);
  const [stepTwoData, setStepTwoData] = useState<any>(null);
  const [stepThreeData, setStepThreeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>();

  useEffect(() => {
    // 로컬 스토리지에서 데이터 불러오기
    const step1 = loadFromLocalStorage("step1");
    const step2 = loadFromLocalStorage("step2");
    const step3 = loadFromLocalStorage("step3");

    // 데이터가 있으면 상태 업데이트
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

  const handleEditStep = (step: string) => {
    router.push(`/account/unit/registration/step-${step}`);
  };

  // 제출 핸들러
  const handleFinalizeSubmission = async () => {
    setIsSubmitting(true);

    try {
      // 500ms의 딜레이를 추가
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 서버에 폼 데이터 제출
      const result = await registerUnit(formData);

      // 제출이 성공적으로 완료되었을 경우
      if (result && result.message) {
        // Toast로 결과 메시지 표시
        toast({
          title: "Registration Complete",
          description: result.message,
        });

        // 로컬 스토리지에서 step1, step2, step3 삭제
        clearRegistrationSteps();

        // 페이지 리다이렉트
        router.push("/account/unit/my-list");
      } else {
        // 오류가 있을 경우 에러 토스트 표시
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      // 에러 핸들링 및 토스트 메시지 출력
      toast({
        title: "Submission Failed",
        description: "An error occurred while submitting the form.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`p-6 bg-white  ${
        isLoading ? "border-none shadow-none" : "border"
      } rounded-lg shadow-md max-w-[1140px] mx-auto`}
    >
      {/* 로딩 상태일 때 스피너 표시 */}
      {isLoading ? (
        <div className="flex justify-center items-center h-[300px]">
          <Spinner />
        </div>
      ) : (
        <div>
          {/* Step Three Review */}
          {stepThreeData && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-1">Step 3: Images</h3>
              <ThumbSlider
                imageUrls={stepThreeData.images.map((image: any) => image.url)}
              />
            </div>
          )}
          <div className="flex">
            {/* Step One Review */}
            {stepOneData && (
              <section className="">
                <div className="flex">
                  <h3 className="text-xl font-semibold ">Step 1: Unit Info</h3>
                  <Button
                    variant="outline"
                    onClick={() => handleEditStep("one")}
                  >
                    Edit Step 1
                  </Button>
                </div>

                <p>
                  <strong>Title:</strong> {stepOneData.title}
                </p>
                <p>
                  <strong>Owner Name:</strong> {stepOneData.ownerName}
                </p>
                <p>
                  <strong>Price:</strong> ₱{stepOneData.price}
                </p>
                <p>
                  <strong>Property Type:</strong> {stepOneData.unitType}
                </p>
                <p>
                  <strong>Sell Type:</strong> {stepOneData.saleType}
                </p>
                <p>
                  <strong>Full Address:</strong> {stepOneData.fullAddress}
                </p>
                {stepOneData.addressSelf && (
                  <p>
                    <strong>Additional Address Info:</strong>{" "}
                    {stepOneData.addressSelf}
                  </p>
                )}
              </section>
            )}

            {/* Step Two Review */}
            {stepTwoData && (
              <section className="">
                <div className="flex items-center">
                  <h3 className="text-xl font-semibold ">
                    Step 2: Unit Details
                  </h3>
                  <Button
                    variant="outline"
                    onClick={() => handleEditStep("two")}
                  >
                    Edit Step 2
                  </Button>
                </div>
                <p>
                  <strong>Area:</strong> {stepTwoData.area} m²
                </p>
                <p>
                  <strong>Bedrooms:</strong> {stepTwoData.bed}
                </p>
                <p>
                  <strong>Bathrooms:</strong> {stepTwoData.bath}
                </p>
                <p>
                  <strong>Parking Spaces:</strong> {stepTwoData.parking}
                </p>
                <p>
                  <strong>Floor:</strong> {stepTwoData.floor}
                </p>
                <p>
                  <strong>Furniture Status:</strong> {stepTwoData.furniture}
                </p>
                <p>
                  <strong>Pet Policy:</strong> {stepTwoData.petPolicy}
                </p>
                <p>
                  <strong>Outstanding Payment:</strong> ₱
                  {stepTwoData.outstandingPayment}
                </p>
                {stepTwoData.amenity && stepTwoData.amenity.length > 0 && (
                  <p>
                    <strong>Amenities:</strong> {stepTwoData.amenity.join(", ")}
                  </p>
                )}
              </section>
            )}
          </div>
          {/* 최종 제출 버튼 */}
          <div className="w-full flex justify-end">
            <SubmitButton
              isSubmitting={isSubmitting}
              onClick={handleFinalizeSubmission}
              label="Complete Registration"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewForm;
