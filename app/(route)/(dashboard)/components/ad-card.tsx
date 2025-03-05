import React from "react";
import Link from "next/link";

interface AdCardProps {
  desktopImageUrl: string;
  mobileImageUrl: string;
  link: string;
}

const AdCard: React.FC<AdCardProps> = ({ desktopImageUrl, mobileImageUrl, link }) => {
  return (
    <div className="relative cursor-pointer transition-all duration-300 bg-white rounded-md col-span-2 xs:col-span-1">
      <Link href={link} target="_blank" rel="noopener noreferrer">
        <div className="relative w-full pt-[60%] xs:pt-[97%] rounded-md overflow-hidden">
          <img
            src={desktopImageUrl}
            alt="Advertisement"
            className="absolute top-0 left-0 w-full h-full object-cover transition-all duration-300 xs:hidden"
          />
          
          <img
            src={mobileImageUrl}
            alt="Advertisement"
            className="absolute top-0 left-0 w-full h-full object-cover transition-all duration-300 hidden xs:block"
          />
          
          <span className="absolute bottom-2 right-2 text-xs bg-black bg-opacity-60 text-white px-2 py-1 rounded">
            Sponsored
          </span>
        </div>
      </Link>
    </div>
  );
};

export default AdCard;