"use client";

import React, { useEffect, useState } from "react";
import { loadFromLocalStorage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const ReviewForm = () => {
  const router = useRouter();

  // State to hold data from local storage
  const [stepOneData, setStepOneData] = useState<any>(null);
  const [stepTwoData, setStepTwoData] = useState<any>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    // Load data from Step 1 and Step 2 from localStorage
    const step1 = loadFromLocalStorage("step1");
    const step2 = loadFromLocalStorage("step2");

    if (step1) {
      setStepOneData(step1);
    }
    if (step2) {
      setStepTwoData(step2);

      // If images exist in Step 2 data, generate previews
      if (step2?.images) {
        const previews = step2.images.map((file: File) =>
          URL.createObjectURL(file)
        );
        setImagePreviews(previews);
      }
    }
  }, []);

  // Navigate to edit the corresponding step
  const handleEditStep = (step: number) => {
    router.push(`/account/unit/registration/step-${step}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6">Review Your Submission</h2>

      {/* Step One Review */}
      {stepOneData && (
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Step 1: Unit Details</h3>
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
            <strong>Location:</strong> {stepOneData.location}
          </p>
          {stepOneData.addressSelf && (
            <p>
              <strong>Additional Address Info:</strong> {stepOneData.addressSelf}
            </p>
          )}
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => handleEditStep(1)}
          >
            Edit Step 1
          </Button>
        </section>
      )}

      {/* Step Two Review */}
      {stepTwoData && (
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Step 2: Unit Features</h3>
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
            <strong>Outstanding Payment:</strong> ₱{stepTwoData.outstandingPayment}
          </p>
          {stepTwoData.amenity && stepTwoData.amenity.length > 0 && (
            <p>
              <strong>Amenities:</strong> {stepTwoData.amenity.join(", ")}
            </p>
          )}
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => handleEditStep(2)}
          >
            Edit Step 2
          </Button>
        </section>
      )}

      {/* Final Submission Button */}
      <div className="w-full flex justify-end">
        <Button className="bg-green-500 text-white" onClick={() => {}}>
          Finalize Submission
        </Button>
      </div>
    </div>
  );
};

export default ReviewForm;
