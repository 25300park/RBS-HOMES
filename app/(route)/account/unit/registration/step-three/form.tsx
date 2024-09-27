"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { FaTrash, FaEye } from "react-icons/fa";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/utils";
import { SubmitButton } from "@/components/ui/submit-btn";
import Spinner from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MdCloudUpload } from "react-icons/md";
import { useToast } from "@/hooks/use-toast";
import { useModalStore } from "@/store/use-modal-store";

export default function StepThreeForm() {
  const router = useRouter();
  const { openModal } = useModalStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    images: [] as File[], // 이미지 파일을 관리하는 배열
    mainImageIndex: 0, // 메인 이미지 인덱스
    note: "", // 텍스트 에디터에서 저장할 노트
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // 제출 상태 관리
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 관리
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedData = loadFromLocalStorage("step3");
    if (savedData) {
      const images = savedData.images.map((imageData: File) => imageData);
  
      setFormData((prev) => ({
        ...prev,
        images,
      }));
  
      // Blob을 사용하여 이미지 미리보기 생성
      const previews = images.map((file: any) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
    setIsLoading(false); // 로딩 완료 후 상태 업데이트
  }, []);
  
  
  const formatFileSize = (size: number) => {
    // 파일 크기를 KB 또는 MB로 변환
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB";
    return (size / (1024 * 1024)).toFixed(2) + " MB";
  };

  const onDrop = (acceptedFiles: File[]) => {
    // 허용된 파일 확장자
    const validFileTypes = ["image/png", "image/jpeg", "image/jpg"];

    const invalidFiles = acceptedFiles.filter(
      (file) =>
        !validFileTypes.includes(file.type) || file.size > 2 * 1024 * 1024
    );

    // 조건에 맞지 않는 파일에 대해 알림
    if (invalidFiles.length > 0) {
      invalidFiles.forEach((file) => {
        if (!validFileTypes.includes(file.type)) {
          toast({
            title: "File type not supported",
            variant: "default",
            description: `${file.name} is not a valid file type. Only PNG and JPG files are allowed.`,
          });
        } else if (file.size > 2 * 1024 * 1024) {
          toast({
            title: "File size exceeds",
            variant: "default",
            description: `${file.name} exceeds the 2MB size limit.`,
          });
        }
      });
      return; // 유효하지 않은 파일이 있을 때 처리를 중단
    }

    // 유효한 파일들만 처리
    const validImages = acceptedFiles.filter(
      (file) =>
        validFileTypes.includes(file.type) && file.size <= 2 * 1024 * 1024
    );

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validImages],
    }));

    const previews = validImages.map((file) => URL.createObjectURL(file));
    setImagePreviews((prevPreviews) => [...prevPreviews, ...previews]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] }, // 드래그 가능한 이미지 타입 제한
    multiple: true,
  });

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

  // 다음 단계로 이동
  const handleNext = () => {
    setIsSubmitting(true); // 제출 중 상태로 변경
    saveToLocalStorage("step3", formData);
    setTimeout(() => {
      router.push("/account/unit/registration/review");
    }, 1000);
  };

  return (
    <div
      className={`p-6 bg-white  ${
        isLoading ? "border-none shadow-none" : "border"
      } rounded-lg shadow-md max-w-[1140px] mx-auto`}
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-[500px]">
          <Spinner />
        </div>
      ) : (
        <>
          {errors.length > 0 && (
            <div className="text-red-500 mb-4">
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}

          {/* Drag & Drop 영역 */}
          <section className="flex gap-4 h-[500px]">
            <div
              {...getRootProps()}
              className="border-dashed border-2 border-gray-300 rounded-md p-6 text-center w-full items-center justify-center h-full flex flex-col gap-3 cursor-pointer"
            >
              <MdCloudUpload className="text-6xl text-orange-300" />
              <input {...getInputProps()} />
              <p className="text-2xl">Drag and Drop images here</p>
              <p className="text-xl text-zinc-500">or</p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="p-6 bg-orange-400 hover:bg-orange-500"
              >
                Browse Images
              </Button>
            </div>

            {/* 이미지 미리보기 및 관리 UI */}
            {imagePreviews.length > 0 && (
              <div className="w-full use-scroll pb-2">
                <div className="overflow-y-scroll h-full scrollbar-thumb-gray-400 scrollbar-track-gray-100 pr-4 use-scroll p-4 rounded-md">
                  <ul className="">
                    {imagePreviews.map((preview, index) => (
                      <li
                        key={index}
                        className={`flex items-center justify-between py-2 ${
                          index !== imagePreviews.length - 1
                            ? "border-b border-zinc-200"
                            : ""
                        }`}
                      >
                        <div className="flex items-center">
                          <img
                            src={preview}
                            alt="preview"
                            className="w-16 h-16 object-cover rounded-md mr-4 cursor-pointer"
                            onClick={() =>
                              openModal("preview", {
                                imagePreview: preview,
                                imageName: formData.images[index].name,
                                imageSize: formatFileSize(
                                  formData.images[index].size
                                ),
                                imageType: formData.images[index].type,
                              })
                            }
                          />

                          <div className="flex flex-col">
                            <span>{formData.images[index].name}</span>
                            <span className="text-gray-500 text-xs">
                              {formatFileSize(formData.images[index].size)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            className="text-orange-500 hover:text-orange-500"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>

          {/* Rich Text Editor (노트) */}
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-zinc-500">
              Notes
            </label>
            <Textarea
              name="note"
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              placeholder="Additional notes or information"
              className="mb-2 p-2 border w-full h-36"
            />
          </div>

          <div className="w-full flex justify-end">
            <SubmitButton
              isSubmitting={isSubmitting}
              onClick={handleNext}
              label="Next Step"
            />
          </div>
        </>
      )}
    </div>
  );
}

{
  /* 이미지 미리보기 및 메인 설정 */
}
{
  /* {imagePreviews.length > 0 && (
            <ThumbSliderForRegister
              imageUrls={imagePreviews}
              onRemoveImage={handleRemoveImage}
              onSetMainImage={handleSetMainImage}
              mainIndex={formData.mainImageIndex}
            />
          )} */
}
{
  /* <Button
                          variant="ghost"
                          className="text-blue-500"
                          onClick={() => handleSetMainImage(index)}
                        >
                          <FaEye />
                        </Button> */
}

// 메인 이미지 설정 핸들러
// const handleSetMainImage = (index: number) => {
//   const updatedImages = [...formData.images];
//   const mainImage = updatedImages.splice(index, 1)[0];
//   updatedImages.unshift(mainImage);

//   const updatedPreviews = [...imagePreviews];
//   const mainPreview = updatedPreviews.splice(index, 1)[0];
//   updatedPreviews.unshift(mainPreview);

//   setFormData((prev) => ({
//     ...prev,
//     images: updatedImages,
//     mainImageIndex: 0,
//   }));
//   setImagePreviews(updatedPreviews);
// };

{
  /* <Button className="mt-3 py-6 relative float-end px-4 bg-orange-400 hover:bg-orange-500" onClick={() => openModal("preview", { imagePreviews })}>
                  <FaEye className="mr-4 text-xl" />
                  Show Preview
                </Button> */
}
