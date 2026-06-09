import React, { forwardRef, useState } from "react";
import Image from "next/image";
import FavoriteButton from "../favorite-button";

interface ListCardProps {
  unitId: number;
  title: string;
  price: number;
  area: number;
  location: string;
  imageUrl: string;
  postedDate: string;
  isUrgent?: boolean;
  sellType: string;
  bed: number;
  bath: number;
  isFavorited: boolean;
  priority?: boolean; // ✅ 추가: 첫 N개 카드에 priority 적용 (LCP 개선)
  featured?: {
    label: string;
    description: string | null;
  };
  onClick?: (event: React.MouseEvent) => void;
}

const ListCard = forwardRef<HTMLDivElement, ListCardProps>(
  (
    {
      unitId,
      title,
      price,
      area,
      location,
      imageUrl,
      isUrgent = false,
      bed = 1,
      bath = 1,
      onClick,
      featured,
      isFavorited = false,
      priority = false, // ✅ 기본값 false (lazy load)
    },
    ref
  ) => {
    const fallbackImage = "/assets/images/cities/BGC.png";
    const [imgSrc, setImgSrc] = useState(imageUrl || fallbackImage);

    return (
      <div
        ref={ref}
        className="relative cursor-pointer group transition-all duration-300 bg-white rounded-md"
        onClick={onClick}
      >
        {/* Urgent Badge */}
        {isUrgent && (
          <span className="absolute top-2 left-2 px-4 bg-orange-500 text-white text-xs py-1 rounded z-20">
            Urgent Sale
          </span>
        )}
        {/* Featured Badge */}
        {featured && (
          <div className="bg-orange-400 text-white px-2 py-1 text-sm absolute top-2 left-2 z-10">
            {featured.label || "Featured"}
          </div>
        )}
        {/* Main Image */}
        <div className="relative w-full pt-[97%] rounded-md overflow-hidden">
          <Image
            src={imgSrc}
            alt={title}
            fill
            className="object-cover transition-all duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
            // ✅ priority=true면 즉시 로드(LCP 개선), false면 lazy load
            priority={priority}
            loading={priority ? undefined : "lazy"}
            onError={() => setImgSrc(fallbackImage)}
          />
          <FavoriteButton
            initialIsFavorited={isFavorited}
            unitId={unitId}
            className="absolute top-2 right-2 z-20"
          />
        </div>
        {/* Content */}
        <div className="p-1 pt-2 bg-white rounded-b-md">
          <h3 className="font-semibold text-md truncate group-hover:text-primary">
            {title}
          </h3>
          <p className="text-gray-600 text-sm truncate">{location}</p>
          <div className="flex items-center my-2 text-primary font-bold">
            ₱ {price.toLocaleString()}
          </div>
          <div className="flex justify-between items-center text-gray-500 text-sm">
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <Image src="/assets/icons/bed.png" width={16} height={16} alt="bedroom" />
                <span>{bed}</span>
              </div>
              <div className="flex items-center gap-1">
                <Image src="/assets/icons/bath.png" width={16} height={16} alt="bathroom" />
                <span>{bath}</span>
              </div>
              <div className="flex items-center gap-1">
                <Image src="/assets/icons/sqm.png" width={16} height={16} alt="area" />
                <span>{area}m²</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ListCard.displayName = "ListCard";
export default ListCard;
