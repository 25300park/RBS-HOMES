"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { FaTrash } from "react-icons/fa";
import { SubmitButton } from "@/components/ui/submit-btn";
import Spinner from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MdCloudUpload } from "react-icons/md";
import { useToast } from "@/hooks/use-toast";
import { useModalStore } from "@/store/use-modal-store";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/utils";

export default function StepThreeForm() {
  const router = useRouter();
  const { openModal } = useModalStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    images: [] as {
      file: File;
      preview: string;
      name: string;
      size: number;
      url?: string;
      progress?: number;
      showProgress: boolean;
    }[],
    note: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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

  const formatFileSize = (size: number) => {
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB";
    return (size / (1024 * 1024)).toFixed(2) + " MB";
  };

  const uploadToS3 = async (files: File[], indices: number[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    return new Promise<string[]>((resolve, reject) => {
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
          resolve(response.uploadedUrls); // URL을 반환
        } else {
          reject("Upload failed");
        }
      };

      xhr.onerror = () => reject("Upload failed");
      xhr.send(formData);
    });
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const validFileTypes = ["image/png", "image/jpeg", "image/jpg"];
    const currentFileNames = formData.images.map((img) => img.name);
    const uniqueFiles = acceptedFiles.filter(
      (file) =>
        validFileTypes.includes(file.type) &&
        file.size <= 2 * 1024 * 1024 &&
        !currentFileNames.includes(file.name)
    );

    if (uniqueFiles.length < acceptedFiles.length) {
      toast({
        title: "Duplicate or invalid files",
        description:
          "Some files were either duplicates or exceeded size/type limits.",
      });
    }

    const newImages = uniqueFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
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

    // 우선 이미지를 업데이트하여 미리보기를 표시
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));

    try {
      // 업로드를 진행하고 URL을 반환
      const urls = await uploadToS3(uniqueFiles, newImageIndices);

      // 업로드가 완료된 후에 이미지 업데이트
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img, index) => {
          const urlIndex = newImageIndices.indexOf(index);
          return urlIndex !== -1
            ? {
                ...img,
                url: urls[urlIndex], // 정확히 매칭되는 URL로 대체
                progress: 100,
              }
            : img;
        }),
      }));

      // Progress 바 숨기기
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
      toast({
        title: "Error",
        description: "Uploading files failed",
      });
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
      updatedImages.unshift(mainImage); // 메인 이미지를 배열의 0번째로 이동
      return { ...prev, images: updatedImages };
    });
  };

  const handleNext = () => {
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
      className={`p-6 bg-white ${
        isLoading ? "border-none shadow-none" : "border"
      } rounded-lg shadow-md max-w-[1140px] mx-auto`}
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-[500px]">
          <Spinner />
        </div>
      ) : (
        <>
          <section className="flex gap-4 h-[500px]">
            <div
              {...getRootProps()}
              className="border-dashed border-2 border-gray-300 rounded-md p-6 text-center w-full items-center justify-center h-full flex flex-col gap-3 cursor-pointer"
            >
              <MdCloudUpload className="text-6xl text-orange-300" />
              <input {...getInputProps()} />
              <p className="text-2xl">Drag and Drop images here</p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="p-6 bg-orange-400 hover:bg-orange-500"
              >
                Browse Images
              </Button>
            </div>

            {formData.images.length > 0 && (
              <div className="w-full use-scroll pb-2">
                <div className="overflow-y-scroll h-full scrollbar-thumb-gray-400 scrollbar-track-gray-100 pr-4 use-scroll p-4 rounded-md">
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
                        <div className="flex items-center">
                          <img
                            src={image.url ? image.url : image.preview}
                            alt="preview"
                            className="w-16 h-16 object-cover rounded-md mr-4 cursor-pointer"
                            onClick={() =>
                              openModal(
                                "preview",
                                image.url ? image.url : image.preview
                              )
                            }
                          />

                          <div className="flex flex-col">
                            <span className="text-sm text-zinc-500">
                              {image.name}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {formatFileSize(image.size)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {index === 0 ? (
                            <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs font-semibold">
                              Main
                            </span>
                          ) : (
                            <span
                              className=" hover:underline px-2 py-1 rounded text-xs cursor-pointer"
                              onClick={() => handleSetMainImage(index)}
                            >
                              Set as Main
                            </span>
                          )}

                          <Button
                            variant="ghost"
                            className="text-orange-500 hover:text-orange-500"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <FaTrash />
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
