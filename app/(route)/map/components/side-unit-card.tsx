"use client";

import Image from "next/image";
import FavoriteButton from "@/components/favorite-button";
import React, { forwardRef, useState } from "react";

// 기본 이미지 경로 상수 정의
const DEFAULT_IMAGE = "/assets/images/cities/BGC.png";

export interface SideUnitCardProps {
  onClick?: (event: any) => void;
  onMouseLeave?: (event: any) => void;
  onMouseEnter?: (event: any) => void;
  title: string;
  price: number;
  area: number;
  location: string;
  imageUrl?: string; // imageUrl을 선택적으로 변경
  postedDate: string;
  isVip?: boolean;
  sellType: string;
  bed: number;
  bath: number;
  style?: React.CSSProperties;
  featured?: any;
}

const SideUnitCard = forwardRef<HTMLElement, SideUnitCardProps>(
  (
    {
      title,
      price,
      area,
      location,
      imageUrl,
      postedDate,
      isVip = false,
      bed = 1,
      bath = 1,
      sellType,
      featured,
      onClick,
      onMouseEnter,
      onMouseLeave,
      style,
    },
    ref
  ) => {
    // 이미지 오류 상태 관리
    const [imgError, setImgError] = useState(false);
    
    // 이미지 URL 결정 - 없거나 오류 시 기본 이미지 사용
    const finalImageUrl = imgError || !imageUrl ? DEFAULT_IMAGE : imageUrl;

    return (
      <article
        ref={ref}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="w-full bg-white overflow-hidden relative cursor-pointer group transition-all duration-300 flex gap-2 p-4 border-b hover:bg-zinc-100"
        style={style}
      >
        {featured && (
          <div className="bg-orange-400 text-white px-2 py-1 text-sm absolute top-2 left-2 z-10">
            {featured.label || "Featured"}
          </div>
        )}
        <div className="relative h-[112px] w-[144px]">
          <Image
            src={finalImageUrl}
            alt={title || "Property"}
            sizes="(max-width: 768px) 100vw"
            fill
            className="object-cover transition-all duration-300 rounded-md"
            onError={() => setImgError(true)}
            priority={false}
          />
        </div>

        <div className="w-1/2 h-full flex flex-col justify-between">
          <h3 className="text-lg font-semibold truncate">{title || "No Title"}</h3>
          <div className="text-gray-600 text-sm mb-2 ... truncate">
            {location || "Location not available"}
          </div>

          <div className="flex items-center">
            <span className="text-lg mr-2">
              ₱{" "}
              {(price || 0).toLocaleString("en-US", {
                currency: "USD",
              })}
            </span>
          </div>

          <div className="flex justify-between items-center text-zinc-400 text-sm">
            <div className="flex justify-between gap-4">
              <div className="flex gap-1 items-center">
                <Image
                  src="/assets/icons/bed.png"
                  width={16}
                  height={16}
                  alt="bedroom"
                />
                <p>{bed}</p>
              </div>
              <div className="flex gap-1 items-center">
                <Image
                  src="/assets/icons/bed-1.png"
                  width={16}
                  height={16}
                  alt="bathroom"
                />
                <p>{bath}</p>
              </div>
              <div className="flex gap-1 items-center">
                <Image
                  src="/assets/icons/sqm.png"
                  width={16}
                  height={16}
                  alt="area"
                />
                <p>{area || 0}m²</p>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }
);

SideUnitCard.displayName = "SideUnitCard";

export default SideUnitCard;