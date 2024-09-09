"use client";

import Image from "next/image";
import { useState } from "react";
import FavoriteButton from "../favorite-button";

export interface PropertyCardProps {
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
}

const PropertyCard = ({
  title,
  price,
  area,
  location,
  imageUrl,
  postedDate,
  isVip = false,
  bed = 1,
  bath = 1,
  sellType
}: PropertyCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="w-full max-w-sm bg-white rounded-lg shadow-md overflow-hidden relative cursor-pointer group hover:shadow-lg transition-all duration-300 border">
      {/* VIP Badge */}
      {isVip && (
        <span className={`absolute top-2 left-2 ${sellType === "Rent" ? " bg-yellow-400" : "bg-green-400" } text-white text-xs font-bold px-2 py-1 rounded z-20`}>
          {sellType}
        </span>
      )}

      {/* Image */}
      <div className="relative h-48">
        <div className="bg-white absolute right-0 top-0 z-20 text-xs p-1 rounded-bl-lg w-24 text-center border border-t-0 border-r-0">
          {postedDate}
        </div>
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover group-hover:scale-110 transition-all duration-300"
        />
        <div className="absolute bottom-0 bg-green-500 right-0">1</div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold truncate">{title}</h3>
        <div className="text-gray-600 text-sm mb-2 ... truncate">
          {location}
        </div>

        <div className="flex items-center my-2">
          <span className="text-red-600 text-lg font-bold mr-2">
            ${" "}
            {price?.toLocaleString("en-US", {
              // style: "currency",
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
              <p >{bath}</p>
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

          {/* Favorite Button */}
          <FavoriteButton isFavorite={isFavorite} onToggle={toggleFavorite} />
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
