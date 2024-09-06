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
}

const PropertyCard = ({
  title,
  price,
  area,
  location,
  imageUrl,
  postedDate,
  isVip = false,
}: PropertyCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="w-full max-w-sm bg-white rounded-lg shadow-md overflow-hidden relative cursor-pointer group hover:shadow-lg transition-all duration-300">
      {/* VIP Badge */}
      {isVip && (
        <span className="absolute top-2 left-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded">
          VIP
        </span>
      )}

      {/* Image */}
      <div className="relative h-48">
        <Image src={imageUrl} alt={title} fill className="object-cover group-hover:scale-110 transition-all duration-300" />
        <div className="absolute bottom-0 bg-green-500 right-0">1</div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold truncate">{title}</h3>

        <div className="flex items-center my-2">
          <span className="text-red-600 text-lg font-bold mr-2">{price} $</span>
          <span className="text-gray-500 text-sm">{area} m²</span>
        </div>

        <div className="text-gray-600 text-sm mb-2">{location}</div>

        <div className="flex justify-between items-center text-gray-500 text-sm">
          <span> {postedDate} </span>

          {/* Favorite Button */}
          <FavoriteButton isFavorite={isFavorite} onToggle={toggleFavorite} />
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
