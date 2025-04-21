"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { FaTrash } from "react-icons/fa";
import { MdCloudUpload } from "react-icons/md";
import { useToast } from "@/hooks/use-toast";
import { useModalStore } from "@/store/use-modal-store";
import { useImageCompression } from "@/hooks/use-image-compression";
import {
  formatFileSize,
  isValidImageType,
  createImagePreview,
} from "@/lib/utils";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/utils";
import { SubmitButton } from "@/components/ui/submit-btn";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Spinner from "@/components/ui/spinner";

interface ImageData {
  file: File;
  preview: string;
  name: string;
  size: number;
  url?: string;
  progress?: number;
  showProgress: boolean;
}

interface FormData {
  images: ImageData[];
  note: string;
}

export default function StepThreeForm() {
  const router = useRouter();
  const { openModal } = useModalStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { compressImages, isCompressing } = useImageCompression();
const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    images: [],
    note: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedData = loadFromLocalStorage("step3");
    if (savedData) {
      const { note, images } = savedData;
      setFormData((prev) => ({
        ...prev,
        note: note || "",
        images:
          images?.map((img: any) => ({ ...img, showProgress: false })) || [],
      }));
    }
    setIsLoading(false);
  }, []);
  const uploadToS3 = async (files: File[], indices: number[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    return new Promise<string[]>((resolve, reject) => {
      console.log(123123123123)
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/image-upload/unit");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setFormData((prev) => ({
            ...prev,
            images: prev.images.map((img, i) =>
              indices.includes(i)
                ? { ...img, progress, showProgress: true }
                : img
            ),
          }));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.uploadedUrls);
        } else {
          reject("Upload failed");
        }
      };

      xhr.onerror = () => reject("Upload failed");
      xhr.send(formData);
    });
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const currentFileNames = formData.images.map((img) => img.name);
    const uniqueFiles = acceptedFiles.filter(
      (file) => isValidImageType(file) && !currentFileNames.includes(file.name)
    );
  
    if (uniqueFiles.length === 0) return;
  
    try {
      setUploadingFiles(true);
      const compressedFiles = await compressImages(uniqueFiles);
  
      // 임시 상태 저장
      const prevFormData = { ...formData };
      
      const newImages = compressedFiles.map((file) => ({
        file,
        preview: createImagePreview(file),
        name: file.name,
        size: file.size,
        progress: 0,
        showProgress: true,
      }));
  
      const startIndex = formData.images.length;
      const newImageIndices = Array.from(
        { length: newImages.length },
        (_, i) => startIndex + i
      );
  
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
  
      try {
        const urls = await uploadToS3(compressedFiles, newImageIndices);
        
        setFormData((prev) => ({
          ...prev,
          images: prev.images.map((img, index) => {
            const urlIndex = newImageIndices.indexOf(index);
            return urlIndex !== -1
              ? { ...img, url: urls[urlIndex], progress: 100 }
              : img;
          }),
        }));
  
        // 프로그레스바 숨기기 전 지연
        setTimeout(() => {
          setFormData((prev) => ({
            ...prev,
            images: prev.images.map((img, index) =>
              newImageIndices.includes(index)
                ? { ...img, showProgress: false }
                : img
            ),
          }));
        }, 500);
  
      } catch (error) {
        // 업로드 실패 시 이전 상태로 롤백
        setFormData(prevFormData);
        toast({
          title: "Upload failed",
          description: "Files could not be uploaded. Please try again.",
          variant: "destructive"
        });
        return;
      }
  
    } catch (error) {
      toast({
        title: "Image processing failed",
        description: "Please try again with different images.",
        variant: "destructive"
      });
    } finally {
      // 프로그레스바가 사라진 후에 uploadingFiles 상태 변경
      setTimeout(() => {
        setUploadingFiles(false);
      }, 600);  // 프로그레스바 애니메이션(500ms)보다 살짝 더 긴 시간
    }
  };
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSetMainImage = (index: number) => {
    setFormData((prev) => {
      const updatedImages = [...prev.images];
      const mainImage = updatedImages.splice(index, 1)[0];
      updatedImages.unshift(mainImage);
      return { ...prev, images: updatedImages };
    });
  };

  const handleNext = () => {
    if (formData.images.length < 1) {
      toast({
        title: "Image Required",
        description: "Please upload at least one image",
        variant: "destructive",
      });
      return;
    }

    const dataToSave = {
      note: formData.note,
      images: formData.images.map(({ name, size, preview, url }) => ({
        name,
        size,
        preview,
        url,
      })),
    };
    saveToLocalStorage("step3", dataToSave);

    setIsSubmitting(true);
    setTimeout(() => {
      router.push("/account/unit/registration/review");
    }, 1000);
  };

  return (
    <div
      className={`p-6 mb-10 md:mb-0 md:p-4 bg-white md:border-none md:shadow-none ${
        isLoading ? "border-none shadow-none" : "border"
      } rounded-lg shadow-md max-w-[1140px] mx-auto`}
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-[500px] md:h-[300px]">
          <Spinner />
        </div>
      ) : (
        <>
          <section className="flex md:flex-col gap-4 h-[500px] md:h-auto">
            {/* 드래그 앤 드롭 영역 */}
            <div
              {...getRootProps()}
              className="border-dashed border-2 border-gray-300 rounded-md p-6 md:p-4 
                text-center w-full items-center justify-center h-full md:h-[180px] 
                flex flex-col gap-3 cursor-pointer"
            >
              <MdCloudUpload className="text-6xl md:text-4xl text-orange-300" />
              <input {...getInputProps()} />
              <p className="text-2xl md:text-lg">Browse or take a photo</p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="p-6 md:p-4 bg-orange-400 hover:bg-orange-500"
              >
                Select Images
              </Button>
            </div>

            {/* 이미지 리스트 영역 */}
            {formData.images.length > 0 && (
              <div className="w-full use-scroll pb-2">
                <div
                  className="overflow-y-scroll h-full md:h-[320px] scrollbar-thumb-gray-400 
                  scrollbar-track-gray-100 pr-4 md:pr-2 use-scroll show-scrollbar p-4 md:p-2 rounded-md"
                >
                  <ul>
                    {formData.images.map((image, index) => (
                      <li
                        key={index}
                        className={`flex relative items-center justify-between py-2 ${
                          index !== formData.images.length - 1
                            ? "border-b border-zinc-200"
                            : ""
                        }`}
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          <img
                            src={image.url ? image.url : image.preview}
                            alt="preview"
                            className="w-16 h-16 md:w-14 md:h-14 object-cover rounded-md mr-4 cursor-pointer"
                            onClick={() =>
                              openModal(
                                "preview",
                                image.url ? image.url : image.preview
                              )
                            }
                          />

                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm md:text-xs text-zinc-500 truncate">
                              {image.name}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {formatFileSize(image.size)}
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

                        {image.showProgress && (
                          <div className="w-5/6 h-1 bg-gray-300 mt-2 rounded-full absolute bottom-1 right-0">
                            <div
                              className="h-full bg-orange-300 rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${image.progress}%` }}
                            />
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>

          {/* Notes Section */}
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-zinc-500">
            Description
            </label>
            <Textarea
              name="note"
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              placeholder="Explain the advantages of a unit to the client"
              className="mb-2 p-2 border w-full h-36 md:h-24"
            />
          </div>

          {/* Submit Button */}
          <div className="w-full flex justify-end md:mt-4">
            <SubmitButton
              isSubmitting={isSubmitting}
              disabled={uploadingFiles || formData.images.length === 0}
              onClick={handleNext}
              label="Save & Continue"
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
