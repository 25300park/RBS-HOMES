"use client";

import ImageGallery from "@/components/ui/image-gallery";
import MobileImageGallery from "@/components/ui/mob-image-gallery";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useMemo } from "react";

export interface GalleryConverterProps {
  images: any;
}

const GalleryConverter = ({
  images,
}: GalleryConverterProps): React.ReactNode => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const ImageGalleryConvert = useMemo(
    () =>
      isMobile ? (
        <MobileImageGallery images={images} />
      ) : (
        <ImageGallery images={images} />
      ),
    [isMobile]
  );

  return <div>{ImageGalleryConvert}</div>;
};

export default GalleryConverter;
