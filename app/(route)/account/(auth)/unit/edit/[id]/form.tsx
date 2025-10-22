"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { SubmitButton } from "@/components/ui/submit-btn";
import { useToast } from "@/hooks/use-toast";
import GalleryConverter from "@/app/(route)/unit/components/gallery-converter";
import { updateUnit, getUnitById } from "./action";
import SelectionBox from "@/components/ui/select-box";
import { ChevronLeft } from "lucide-react";
import { TagInput } from "@/components/ui/tag-input";
import { useDropzone } from "react-dropzone";
import { FaTrash } from "react-icons/fa";
import { MdCloudUpload } from "react-icons/md";
import { useImageCompression } from "@/hooks/use-image-compression";
import {
  furnitureOptions,
  petPolicyOption,
  bedOption,
  bathOption,
  parkingOption,
  interioredOption,
  sellTypeOption,
  typeOption,
  unitStatusOptions,
} from "@/lib/config/unit-options";
import { useModalStore } from "@/store/use-modal-store";
import { Textarea } from "@/components/ui/textarea";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

interface EditFormProps {
  unitId: string;
}
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const QUILL_MODULES = {
  toolbar: [
    ["bold", "italic", "underline"],
    [{ size: ["small", false, "large", "huge"] }],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
  ],
};

const EditForm = ({ unitId }: EditFormProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [unitData, setUnitData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "basic" | "details" | "images"
  >("basic");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { compressImages, isCompressing } = useImageCompression();
  const { openModal } = useModalStore();

  const handleRemoveImage = (index: number) => {
    setUnitData((prev: { images: any[] }) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleSetMainImage = (index: number) => {
    setUnitData((prev: { images: any }) => {
      const updatedImages = [...prev.images];
      const mainImage = updatedImages.splice(index, 1)[0];
      updatedImages.unshift(mainImage);
      return { ...prev, images: updatedImages };
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      try {
        const compressedFiles = await compressImages(acceptedFiles);
        const urls = await uploadToS3(compressedFiles);

        setUnitData((prev: { images: any }) => ({
          ...prev,
          images: [...prev.images, ...urls],
        }));
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    },
    accept: { "image/*": [] },
    multiple: true,
  });

  const uploadToS3 = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch("/api/image-upload/unit", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      return data.uploadedUrls;
    } catch (error) {
      throw new Error("Upload failed");
    }
  };
  useEffect(() => {
    const fetchUnitData = async () => {
      try {
        const data = await getUnitById(unitId);
        if (data) {
          setUnitData(data);
        } else {
          toast({
            title: "Error",
            description: "Failed to load unit data",
            variant: "destructive",
          });
          router.push("/account/unit/my-list");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load unit data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (unitId) {
      fetchUnitData();
    }
  }, [unitId, router, toast]);

  const handleChange = (field: string, value: any) => {
    if (field === "price" || field === "outstandingPayment") {
      const rawValue = value.replace(/[^0-9]/g, "");
      if (!isNaN(Number(rawValue))) {
        const formattedValue = Math.floor(Number(rawValue)).toLocaleString();
        setUnitData({ ...unitData, [field]: formattedValue });
      }
    } else {
      setUnitData({ ...unitData, [field]: value });
    }
  };

  const handleUpdateSubmission = async () => {
    setIsSubmitting(true);

    try {
      const result = await updateUnit(unitId, unitData);

      if (result && result.success) {
        toast({
          title: "Update Complete",
          description: "Unit information has been updated successfully.",
        });
        router.push("/account/unit/my-list");
      } else {
        toast({
          title: "Error",
          description: "Failed to update unit information.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "An error occurred while updating the unit.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push("/");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-6 md:px-4 md:py-0 md:border-none md:shadow-none bg-white mb-20 md:mb-0 border rounded-lg shadow-md max-w-[1140px] mx-auto">
      <div className="hidden md:block mb-12 -mt-3">
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent"
          onClick={handleBack}
        >
          <ChevronLeft className="h-6 w-6 mr-2" />
        </Button>
      </div>
      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <Button
          className="border-none shadow-none rounded-none rounded-t-md "
          variant={activeSection === "basic" ? "default" : "ghost"}
          onClick={() => setActiveSection("basic")}
        >
          Basic Info
        </Button>
        <Button
          className="border-none shadow-none rounded-none rounded-t-md "
          variant={activeSection === "details" ? "default" : "ghost"}
          onClick={() => setActiveSection("details")}
        >
          Details
        </Button>
        <Button
          className="border-none shadow-none rounded-none rounded-t-md "
          variant={activeSection === "images" ? "default" : "ghost"}
          onClick={() => setActiveSection("images")}
        >
          Images
        </Button>
      </div>

      {/* Basic Information Section */}
      {activeSection === "basic" && unitData && (
        <section className="grid grid-cols-2 md:grid-cols-1 gap-6">
          {/* status */}
          <div className="col-span-2 border-b pb-10">
            <label className="block text-xs mb-1 font-medium text-zinc-500">
              Unit Status
            </label>
            <SelectionBox
              options={unitStatusOptions}
              selectedValue={unitData.status.toString()}
              onSelect={(value) => handleChange("status", parseInt(value))}
              className="w-full space-x-0 flex gap-2"
              boxClassName="h-11 w-full"
            />
          </div>
          {/* Address (Read-only) */}
          <div className="col-span-2">
            <label className="block text-xs mb-1 font-medium text-zinc-500">
              Address (Cannot be modified)
            </label>

            <div className="bg-gray-100 p-2 rounded-md">
              {unitData.fullAddress}
            </div>
          </div>
          {/* Title */}
          <div className="col-span-2">
            <label className="block text-xs mb-1 font-medium text-zinc-500">
              Title
            </label>
            <Input
              type="text"
              value={unitData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full"
            />
          </div>
          {/* Description (Note) Section */}
          <div className="col-span-2">
            <label className="block text-xs mb-2 font-medium text-zinc-700">
              Description
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden h-64 md:h-64">
              <ReactQuill
                theme="snow"
                value={unitData.note || ""}
                onChange={(value) => handleChange("note", value)}
                modules={QUILL_MODULES}
                placeholder="Explain the advantages of this property"
                className="h-full bg-white"
              />
            </div>
          </div>
          {/* Price and Sale Type */}
          <div className="flex gap-4 w-full md:flex-col col-span-1">
            <div className="w-full">
              <label className="block text-xs mb-1 font-medium text-zinc-500">
                Price
              </label>
              <Input
                type="text"
                value={unitData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                className="w-full text-right"
              />
            </div>
            <div>
              <label className="block text-xs mb-1 font-medium text-zinc-500">
                Sale Type
              </label>
              <SelectionBox
                options={sellTypeOption.slice(1)}
                selectedValue={unitData.saleType}
                onSelect={(value) => handleChange("saleType", value)}
                className="w-full space-x-0 flex gap-2"
                boxClassName="h-11 md:text-sm md:w-full"
              />
            </div>
          </div>

          {/* Commission */}
          <div>
            <label className="block text-xs mb-1 font-medium text-zinc-500">
              Commission
            </label>
            <Input
              type="text"
              value={unitData.outstandingPayment || ""}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/[^0-9]/g, "");
                if (!isNaN(Number(rawValue))) {
                  const formattedValue = Number(rawValue).toLocaleString();
                  handleChange("outstandingPayment", formattedValue);
                }
              }}
              className="w-full text-right"
              placeholder="Enter commission amount"
            />
          </div>

          {/* Owner Information */}
          <div className="col-span-2 grid grid-cols-2 gap-4 md:grid-cols-1">
            <div>
              <label className="block text-xs mb-1 font-medium text-zinc-500">
                Owner Name
              </label>
              <Input
                type="text"
                value={unitData.ownerName}
                onChange={(e) => handleChange("ownerName", e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs mb-1 font-medium text-zinc-500">
                Owner Mobile
              </label>
              <Input
                type="text"
                value={unitData.ownerMobile || ""}
                onChange={(e) => handleChange("ownerMobile", e.target.value)}
                className="w-full"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
            <div>
              <label className="block text-xs mb-1 font-medium text-zinc-500">
                Owner Email
              </label>
              <Input
                type="email"
                value={unitData.ownerEmail || ""}
                onChange={(e) => handleChange("ownerEmail", e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs mb-1 font-medium text-zinc-500">
                Property Type
              </label>
              <SelectionBox
                options={typeOption.slice(1)}
                selectedValue={unitData.unitType}
                onSelect={(value) => handleChange("unitType", value)}
                className="w-full md:space-x-0 md:gap-1"
              />
            </div>
          </div>
        </section>
      )}

      {/* Details Section */}
      {activeSection === "details" && unitData && (
        <section className="space-y-6">
          {/* Bed, Bath, Parking */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Bedrooms
              </label>
              <SelectionBox
                options={bedOption}
                selectedValue={unitData.bed.toString()}
                onSelect={(value) => handleChange("bed", value)}
                boxClassName="h-12 w-12 md:h-10 md:w-10"
                className="w-full space-x-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Bathrooms
              </label>
              <SelectionBox
                options={bathOption}
                selectedValue={unitData.bath.toString()}
                onSelect={(value) => handleChange("bath", value)}
                boxClassName="h-12 w-12 md:h-10 md:w-10"
                className="w-full space-x-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Parking
              </label>
              <SelectionBox
                options={parkingOption}
                selectedValue={unitData.parking.toString()}
                onSelect={(value) => handleChange("parking", value)}
                boxClassName="h-12 w-12 md:h-10 md:w-10"
                className="w-full space-x-2"
              />
            </div>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Area (m²)
              </label>
              <Input
                type="number"
                value={unitData.area}
                onChange={(e) => handleChange("area", e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Floor
              </label>
              <Input
                type="number"
                value={unitData.floor}
                onChange={(e) => handleChange("floor", e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Furniture and Pet Policy */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Furniture Status
              </label>
              <SelectionBox
                options={furnitureOptions.slice(1)}
                selectedValue={unitData.furniture}
                onSelect={(value) => handleChange("furniture", value)}
                className="w-full"
                boxClassName="h-12 md:h-10 w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Pet Policy
              </label>
              <SelectionBox
                options={petPolicyOption.slice(1)}
                selectedValue={unitData.petPolicy}
                onSelect={(value) => handleChange("petPolicy", value)}
                className="w-full"
                boxClassName="h-12 md:h-10 w-full"
              />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <TagInput
              label="Amenities"
              value={unitData.amenity || []}
              onChange={(value) => handleChange("amenity", value)}
            />
          </div>
        </section>
      )}

      {/* Images Section */}
      {activeSection === "images" && unitData?.images && (
        <div className="bg-white space-y-6">
          <h3 className="text-lg font-semibold mb-4">Property Images</h3>

          {/* Upload Section */}
          <div
            {...getRootProps()}
            className="border-dashed border-2 border-gray-300 rounded-md p-6 md:p-4 
      text-center w-full items-center justify-center h-[200px] md:h-[180px] 
      flex flex-col gap-3 cursor-pointer"
          >
            <input {...getInputProps()} ref={fileInputRef} />
            <MdCloudUpload className="text-6xl md:text-4xl text-orange-300" />
            <p className="text-2xl md:text-lg">Browse or take a photo</p>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="p-6 md:p-4 bg-orange-400 hover:bg-orange-500"
            >
              Add More Images
            </Button>
          </div>

          {/* Images List */}
          {unitData.images.length > 0 && (
            <div className="w-full use-scroll pb-2">
              <div
                className="overflow-y-scroll max-h-[500px] md:h-[320px] scrollbar-thumb-gray-400 
          scrollbar-track-gray-100 pr-4 md:pr-2 use-scroll show-scrollbar p-4 md:p-2 rounded-md"
              >
                <ul>
                  {unitData.images.map((image: string, index: number) => (
                    <li
                      key={index}
                      className={`flex relative items-center justify-between py-2 ${
                        index !== unitData.images.length - 1
                          ? "border-b border-zinc-200"
                          : ""
                      }`}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <img
                          src={image}
                          alt={`preview ${index}`}
                          className="w-16 h-16 md:w-14 md:h-14 object-cover rounded-md mr-4 cursor-pointer"
                          onClick={() => openModal("preview", image)}
                        />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm md:text-xs text-zinc-500">
                            Image {index + 1}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-2">
                        {index === 0 ? (
                          <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                            Main
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            className="text-xs p-1 md:p-0 hover:bg-orange-50"
                            onClick={() => handleSetMainImage(index)}
                          >
                            Set Main
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          className="text-orange-500 hover:text-orange-500 p-1"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <FaTrash className="md:text-sm" />
                        </Button>
                      </div>

                      {/* Upload Progress Bar */}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <div className="w-full flex justify-end pt-6">
        <SubmitButton
          isSubmitting={isSubmitting}
          onClick={handleUpdateSubmission}
          label="Save Changes"
        />
      </div>
    </div>
  );
};

export default EditForm;
