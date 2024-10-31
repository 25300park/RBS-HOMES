"use client";

import ImageGallery from "@/components/ui/image-gallery";
import MobileImageGallery from "@/components/ui/mob-image-gallery";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useEffect, useState } from "react";

export interface GalleryConverterProps {
  images: any;
}

const GalleryConverter = ({
  images,
}: GalleryConverterProps): React.ReactNode => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // 컴포넌트 마운트 확인
  useEffect(() => {
    setMounted(true);
    // 약간의 지연을 주어 hydration 완료를 보장
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);

  // 초기 렌더링 전에는 아무것도 보여주지 않음
  if (!mounted || isLoading) {
    return (
      <div 
        className="w-full bg-gray-100 animate-pulse" 
        style={{ 
          aspectRatio: "4/3",
          maxHeight: "600px"
        }} 
      />
    );
  }

  return (
    <div>
      {isMobile ? (
        <MobileImageGallery images={images} />
      ) : (
        <ImageGallery images={images} />
      )}
    </div>
  );
};

export default GalleryConverter;