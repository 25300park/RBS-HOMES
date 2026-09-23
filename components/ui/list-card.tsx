import React, { forwardRef, useState } from "react";
import Image from "next/image";
import FavoriteButton from "../favorite-button";

interface ListCardProps {
  unitId: number;
  title: string;
  price: number | string; // number = 기존처럼 ₱ + toLocaleString 자동 포맷, string = 이미 포맷된 값 그대로 표시
  area: number | string; // number = 기존처럼 뒤에 m² 붙임, string = "45 sqm"처럼 이미 단위 포함된 값 그대로 표시
  location: string;
  imageUrl: string;
  postedDate?: string;
  isUrgent?: boolean;
  sellType?: string;
  bed: number;
  bath: number;
  isFavorited: boolean;
  priority?: boolean; // ✅ 추가: 첫 N개 카드에 priority 적용 (LCP 개선)
  featured?: {
    label: string;
    description: string | null;
  };
  tag?: string; // 홈페이지 스타일 동적 상태 배지 (예: "For Rent")
  tagColor?: string; // tag와 함께 사용하는 배지 배경/텍스트 클래스 (예: "bg-[#10b981] text-white")
  period?: string; // 가격 옆 접미사 (예: "/ Month")
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
      tag,
      tagColor,
      period,
      isFavorited = false,
      priority = false, // ✅ 기본값 false (lazy load)
    },
    ref
  ) => {
    const fallbackImage = "/assets/images/cities/BGC.png";
    const [imgSrc, setImgSrc] = useState(imageUrl || fallbackImage);

    const [areaValue, areaUnit] =
      typeof area === "number"
        ? [String(area), "m²"]
        : (() => {
            const [value, ...unitParts] = area.split(" ");
            return [value, unitParts.join(" ")];
          })();

    return (
      <div
        ref={ref}
        className="relative cursor-pointer group transition-all duration-300 bg-white rounded-md"
        onClick={onClick}
      >
        {/* Status Badge — tag/tagColor(동적) 우선, 없으면 기존 Urgent/Featured 순서 유지 */}
        {tag && tagColor ? (
          <div className={`absolute top-2 left-2 ${tagColor} text-[11px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md z-10`}>
            {tag}
          </div>
        ) : isUrgent ? (
          <span className="absolute top-2 left-2 px-4 bg-orange-500 text-white text-xs py-1 rounded z-20">
            Urgent Sale
          </span>
        ) : (
          featured && (
            <div className="bg-orange-400 text-white px-2 py-1 text-sm absolute top-2 left-2 z-10">
              {featured.label || "Featured"}
            </div>
          )
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
          <h3 className="text-xs sm:text-sm font-semibold truncate group-hover:text-primary">
            {title}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm truncate">{location}</p>
          <div className="flex items-center gap-1 my-2 text-primary font-bold text-xl lg:text-lg sm:text-sm truncate">
            {typeof price === "number" ? `₱ ${price.toLocaleString()}` : price}
            {period && (
              <span className="text-[11px] sm:text-[10px] text-zinc-400 font-semibold">{period}</span>
            )}
          </div>
          {/* Specs Bar — sr-only 라벨 + truncate + overflow-hidden 안전장치 (기본 동작) */}
          <div className="flex flex-nowrap items-center justify-between gap-1 xs:gap-0.5 text-gray-500 text-xs sm:text-[10px] font-semibold overflow-hidden">
            <div className="flex items-center gap-1 sm:gap-0.5 whitespace-nowrap min-w-0">
              <Image src="/assets/icons/bed.png" width={16} height={16} alt="bedroom" className="2lg:w-3.5 2lg:h-3.5 xs:w-3 xs:h-3 shrink-0" />
              <span className="truncate">
                {bed}
                <span className="not-sr-only xs:sr-only"> Beds</span>
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-0.5 whitespace-nowrap min-w-0">
              <Image src="/assets/icons/bath.png" width={16} height={16} alt="bathroom" className="2lg:w-3.5 2lg:h-3.5 xs:w-3 xs:h-3 shrink-0" />
              <span className="truncate">
                {bath}
                <span className="not-sr-only xs:sr-only"> Bath</span>
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-0.5 whitespace-nowrap min-w-0">
              <Image src="/assets/icons/sqm.png" width={16} height={16} alt="area" className="2lg:w-3.5 2lg:h-3.5 xs:w-3 xs:h-3 shrink-0" />
              <span className="truncate">
                {areaValue}
                <span className="not-sr-only xs:sr-only"> {areaUnit}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ListCard.displayName = "ListCard";
export default ListCard;
