"use client";

import Image from "next/image";
import FavoriteButton from "@/components/favorite-button";
import { useState } from "react";

export interface SideUnitCardProps {
  onClick?: (event: any) => void;
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

const SideUnitCard = ({
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
}: SideUnitCardProps): React.ReactNode => {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  return (
    <article
      onClick={onClick}
      className="w-full max-w-sm bg-white  overflow-hidden relative cursor-pointer group  transition-all duration-300 "
    >
      {/* VIP Badge */}
      {isVip && (
        <span
          className={`absolute top-2 left-2 ${
            sellType === "Rent" ? " bg-yellow-400" : "bg-green-400"
          } text-white text-xs font-bold px-2 py-1 rounded z-20`}
        >
          {sellType}
        </span>
      )}
      <span className="absolute top-2 right-2 z-20">
        <FavoriteButton isFavorite={isFavorite} onToggle={toggleFavorite} />
      </span>

      {/* Image */}
      <div className="relative w-full h-64 rounded-xl">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover  transition-all duration-300 rounded-xl"
        />
        <div className="absolute bottom-0 bg-green-500 right-0">1</div>
      </div>

      {/* Content */}
      <div className=" py-2">
        <h3 className="text-lg font-semibold truncate">{title}</h3>
        <div className="text-gray-600 text-sm mb-2 ... truncate">
          {location}
        </div>

        <div className="flex items-center">
          <span className=" text-lg  mr-2">
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
        </div>
      </div>
    </article>
  );
};

export default SideUnitCard;
