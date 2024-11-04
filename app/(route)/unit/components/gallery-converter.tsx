"use client";

import ImageGallery from "@/components/ui/image-gallery";
import MobileImageGallery from "@/components/ui/mob-image-gallery";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useEffect, useState } from "react";

export interface GalleryConverterProps {
  images: any;
  isFavorited: boolean;
  unitId: number;
}

const GalleryConverter = ({
  images,
  isFavorited,
  unitId,
}: GalleryConverterProps): React.ReactNode => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);

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
        <MobileImageGallery images={images} isFavorited={isFavorited} unitId={unitId}/>
      ) : (
        <ImageGallery images={images} />
      )}
    </div>
  );
};

export default GalleryConverter;