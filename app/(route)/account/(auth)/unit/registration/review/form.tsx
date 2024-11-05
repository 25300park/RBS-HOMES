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

const ReviewForm = () => {
  const router = useRouter();
  const { toast } = useToast();
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

  const handleEditStep = (step: string) => {
    router.push(`/account/unit/registration/step-${step}`);
  };

  const handleFinalizeSubmission = async () => {
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const result = await registerUnit(formData);

      if (result && result.message) {
        toast({
          title: "Registration Complete",
          description: result.message,
        });

        clearRegistrationSteps();
        router.push("/account/unit/my-list");
      } else {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "An error occurred while submitting the form.",
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
                      <PropertyInfo label="Sale Type" value={stepOneData.saleType} />
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

          {/* Submit Button */}
          <div className="w-full flex justify-end pt-2">
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