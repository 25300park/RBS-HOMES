import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const saveToLocalStorage = (key: string, data: any) => {
  if (typeof window !== "undefined") {
    const dataToStore = {
      ...data,
      // 파일이 존재할 경우 파일 메타데이터만 저장
      images: data.images
        ? data.images.map((file: File) => ({
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
          }))
        : [],
    };
    localStorage.setItem(key, JSON.stringify(dataToStore));
  }
};

export const loadFromLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    const storedData = localStorage.getItem(key);
    if (!storedData) return null;
    const data = JSON.parse(storedData);

    // 파일 메타데이터를 Blob 형태로 복원
    if (data.images) {
      data.images = data.images.map(
        (imageData: { name: string; type: string; size: number; lastModified: number }) =>
          new File([], imageData.name, {
            type: imageData.type,
            lastModified: imageData.lastModified,
          })
      );
    }

    return data;
  }
};