"use client";

import FavoriteButton from "@/components/favorite-button";
import { useState } from "react";
import { AvatarFallback, Avatar, AvatarImage } from "@/components/ui/avatar";
import { FaRegUser } from "react-icons/fa";

interface UnitCardProps {
  unit: {
    id: number;
    title: string;
    price: number | null;
    area: number;
    bed: number | null;
    bath: number | null;
    images: string[];
    fullAddress: string | null; // ✅ null 허용 (DB에 null 값 존재)
    note?: string | null;
    admin: {
      name: string | null;
      company: string | null;
      image: string | null;
    };
  };
}

const UnitCard: React.FC<UnitCardProps> = ({ unit }) => {
  const { title, price, area, bed, bath, images, admin, fullAddress, note } =
    unit;
  const [isFavorite, setIsFavorite] = useState(false);

  // admin null 안전처리
  const adminName    = admin?.name    || '';
  const adminCompany = admin?.company || 'No company';
  const adminImage   = admin?.image   || '';

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="bg-white  overflow-hidden border shadow-sm rounded-sm cursor-pointer">
      <div className="relative h-64">
        <img
          src={"/assets/images/cardtest.png"}
          alt={title}
          className={`absolute top-0 left-0 w-full h-full object-cover`}
        />
      </div>
      <div className="">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-2 ">{title}</h2>
          <div>{fullAddress ?? '—'}</div> {/* ✅ null 안전처리 */}
          <div className="text-zinc-400 font-extralight text-sm">{note}</div>
          <div className="flex justify-between md:block mt-4">
            <div className=" font-bold text-2xl mb-1">
              {/* text-[#0CB8C5] */}₱ {price?.toLocaleString()}
            </div>
            <div className="text-gray-500 text-sm flex gap-6">
              <div className="flex items-center gap-2">
                <img
                  src="/assets/icons/bed.png"
                  width={16}
                  height={16}
                  alt="bed"
                />
                <p className="">{bed} Bedrooms</p>
              </div>
              <div className="flex items-center gap-2">
                <img
                  src="/assets/icons/bed-1.png"
                  width={16}
                  height={16}
                  alt="bath"
                />
                <p>{bath} Bath</p>
              </div>
              <div className="flex items-center gap-2">
                <img
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
        <div className="flex items-center justify-between border-t px-4 py-3">
          <div className="flex items-center gap-2">
            <Avatar className="w-12 h-12">
              <AvatarImage src={adminImage} />
              <AvatarFallback>
                <FaRegUser className="text-2xl" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p>{adminName}</p>
              <p className="text-gray-500 text-xs">
                {adminCompany}
              </p>
            </div>
          </div>
          <div className="border w-8 h-8 flex items-center justify-center shadow-sm rounded-sm">
            {/* <FavoriteButton isFavorite={isFavorite} onToggle={toggleFavorite} /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitCard;
