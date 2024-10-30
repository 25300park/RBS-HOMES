"use client";

import Image from "next/image";
import FavoriteButton from "@/components/favorite-button";
import React, { forwardRef } from "react";

export interface SideUnitCardProps {
  onClick?: (event: any) => void;
  onMouseLeave?: (event: any) => void;
  onMouseEnter?: (event: any) => void;
  title: string;
  price: number;
  area: number;
  location: string;
  imageUrl: string;
  postedDate: string;
  isVip?: boolean;
  sellType: string;
  bed: number;
  bath: number;
  style?: React.CSSProperties;
}

const SideUnitCard = forwardRef<HTMLElement, SideUnitCardProps>(({
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
  onClick,
  onMouseEnter,
  onMouseLeave,
  style,
}, ref) => {
  return (
    <article
      ref={ref}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="w-full bg-white overflow-hidden relative cursor-pointer group transition-all duration-300 flex gap-2 p-4 border-b hover:bg-zinc-100"
      style={style}
    >
      <div className="relative h-[112px] w-[144px]">
        <Image
          src={imageUrl}
          alt={title}
          sizes="(max-width: 768px) 100vw"
          fill
          className="object-cover transition-all duration-300 rounded-md"
        />
      </div>

      <div className="w-1/2 h-full flex flex-col justify-between">
        <h3 className="text-lg font-semibold truncate">{title}</h3>
        <div className="text-gray-600 text-sm mb-2 ... truncate">
          {location}
        </div>

        <div className="flex items-center">
          <span className="text-lg mr-2">
            ${" "}
            {price?.toLocaleString("en-US", {
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
              <p>{area}m²</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
});

SideUnitCard.displayName = "SideUnitCard";

export default SideUnitCard;