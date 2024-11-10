import { useState } from 'react';
import imageCompression from 'browser-image-compression';

interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight?: number;
  initialQuality?: number;
  useWebWorker?: boolean;
  alwaysKeepResolution?: boolean;
  preserveExif?: boolean;
}

const defaultOptions: CompressionOptions = {
  maxSizeMB: 2,
  maxWidthOrHeight: 1920,
  initialQuality: 0.8,
  useWebWorker: true,
  alwaysKeepResolution: true,
  preserveExif: true,
};

export const useImageCompression = (customOptions?: Partial<CompressionOptions>) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const options = { ...defaultOptions, ...customOptions };

  const compressImage = async (file: File) => {
    try {
      setIsCompressing(true);
      
      if (file.size <= options.maxSizeMB * 1024 * 1024) {
        return file;
      }

      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      return file;
    } finally {
      setIsCompressing(false);
    }
  };

  const compressImages = async (files: File[]) => {
    try {
      setIsCompressing(true);
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          if (file.size > options.maxSizeMB * 1024 * 1024) {
            return await compressImage(file);
          }
          return file;
        })
      );
      return compressedFiles;
    } catch (error) {
      console.error('Error compressing images:', error);
      return files;
    } finally {
      setIsCompressing(false);
    }
  };

  return {
    compressImage,
    compressImages,
    isCompressing
  };
};