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
  onClick?: (event: Event) => void;
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
  sellType,
  onClick,
}: PropertyCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="w-[280px] relative cursor-pointer group  transition-all duration-300 bg-white rounded-md">
      {/* VIP Badge */}
      {/* {isVip && (
        <span
          className={`absolute top-2 left-2 px-4 ${
            sellType === "Rent" ? "bg-[#010272]" : "bg-orange-500"
          } text-white text-xs   py-1 rounded z-20`}
        >
          {sellType.toUpperCase()}
        </span>
      )} */}

      {/* Image */}
      <div className="relative h-48 rounded-md overflow-hidden">
        <div className="bg-[#f4f4f4e0] absolute right-2 top-2 z-20 text-xs p-1 rounded px-4 py-1 text-center ">
          {postedDate}
        </div>
        <img
          src={imageUrl}
          alt={title}
          // group-hover:scale-110
          className="transition-all duration-300 rounded-md w-full h-full object-cover group-hover:scale-105"
        />
        {/* <div className="absolute bottom-0 bg-green-500 right-0">1</div> */}
      </div>

      {/* Content */}
      <div className="p-4  w-[250px] bg-white rounded shadow-md mx-auto relative -top-6 ">
        <h3 className="text-md truncate">{title}</h3>
        <div className="text-gray-400 text-xs mb-2 ... truncate">
          {location}
        </div>

        <div className="flex items-center my-2">
          <span className="text-md font-semibold w-full mr-2">
          ₱{" "}
            {price?.toLocaleString("en-US", {
              // style: "currency",
              currency: "USD",
            })}
            <span className="ml-2 text-sm font-medium text-gray-500">by {sellType}</span>
          </span>
        </div>

        <div className="flex justify-between items-center text-zinc-400 text-sm">
          <div className="flex justify-between gap-4 text-xs items-center">
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
                src="/assets/icons/bath.png"
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

          {/* Favorite Button */}
          <FavoriteButton isFavorite={isFavorite} onToggle={toggleFavorite} />
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
