"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ThumbSliderForRegister from "../../../components/thumb-slider-register";
import { Textarea } from "@/components/ui/textarea";

export default function StepThreeForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    images: [] as File[], // 이미지 파일을 관리하는 배열
    mainImageIndex: 0, // 메인 이미지 인덱스
    note: "", // 텍스트 에디터에서 저장할 노트
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const savedData = loadFromLocalStorage("step3");
    if (savedData) {
      setFormData(savedData);
      if (savedData.images) {
        setImagePreviews(
          savedData.images.map((image: File) => URL.createObjectURL(image))
        );
      }
    }
  }, []);

  // 이미지 업로드 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedImages = Array.from(e.target.files);

      const validImages = selectedImages.filter(
        (file) => file.size <= 2 * 1024 * 1024
      );

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...validImages],
      }));

      const previews = validImages.map((image) => URL.createObjectURL(image));
      setImagePreviews((prevPreviews) => [...prevPreviews, ...previews]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = (index: number) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);

    const updatedPreviews = [...imagePreviews];
    updatedPreviews.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      images: updatedImages,
    }));
    setImagePreviews(updatedPreviews);
  };

  // 메인 이미지 설정 핸들러
  const handleSetMainImage = (index: number) => {
    const updatedImages = [...formData.images];
    const mainImage = updatedImages.splice(index, 1)[0];
    updatedImages.unshift(mainImage);

    const updatedPreviews = [...imagePreviews];
    const mainPreview = updatedPreviews.splice(index, 1)[0];
    updatedPreviews.unshift(mainPreview);

    setFormData((prev) => ({
      ...prev,
      images: updatedImages,
      mainImageIndex: 0,
    }));
    setImagePreviews(updatedPreviews);
  };

  // 다음 단계로 이동
  const handleNext = () => {
    saveToLocalStorage("step3", formData);
    router.push("/unit/add?step=4");
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl mb-4">Step 3: Upload Images and Notes</h2>

      {errors.length > 0 && (
        <div className="text-red-500 mb-4">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}

      {/* 이미지 업로드 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Upload Images
        </label>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="mt-2"
        />
      </div>

      {/* 이미지 미리보기 및 메인 설정 */}
      {imagePreviews.length > 0 && (
        <ThumbSliderForRegister
          imageUrls={imagePreviews}
          onRemoveImage={handleRemoveImage}
          onSetMainImage={handleSetMainImage}
          mainIndex={formData.mainImageIndex}
        />
      )}

      {/* Rich Text Editor (노트) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <Textarea
        name="note"
        value={formData.note}
        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
        placeholder="Additional notes or information"
        className="mb-2 p-2 border w-full"
      />
      </div>

      {/* 이미지 파일 갯수 표시 */}
      {formData.images.length > 0 && (
        <div className="text-gray-500 mt-2">
          {`${formData.images.length} file(s) selected`}
        </div>
      )}

      <Button
        className="bg-blue-500 text-white p-2 rounded mt-4"
        onClick={handleNext}
      >
        Next Step
      </Button>
    </div>
  );
}
