import React, { forwardRef, useState } from "react";
import Image from "next/image";
import FavoriteButton from "../favorite-button";

interface ListCardProps {
  unitId: number;
  title: string;
  price: number;
  area: number;
  location: string;
  imageUrl: any;
  postedDate: string;
  isUrgent?: boolean;
  sellType: string;
  bed: number;
  bath: number;
  isFavorited: boolean;
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
      isFavorited = false,
    },
    ref
  ) => {

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

        {/* Image */}
        <div className="relative w-full pt-[97%] rounded-md overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="absolute top-0 left-0 w-full h-full object-cover transition-all duration-300 "
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
                <Image
                  src="/assets/icons/bed.png"
                  width={16}
                  height={16}
                  alt="bedroom"
                />
                <span>{bed}</span>
              </div>
              <div className="flex items-center gap-1">
                <Image
                  src="/assets/icons/bath.png"
                  width={16}
                  height={16}
                  alt="bathroom"
                />
                <span>{bath}</span>
              </div>
              <div className="flex items-center gap-1">
                <Image
                  src="/assets/icons/sqm.png"
                  width={16}
                  height={16}
                  alt="area"
                />
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
