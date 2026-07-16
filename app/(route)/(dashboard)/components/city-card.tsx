import Image from "next/image";

export interface CityCardProps {
  name: string;
  listings: string;
  imageUrl: string;
  description?: string;
};

const CityCard = ({ name, listings, imageUrl, description }: CityCardProps) => (
  <div className="relative overflow-hidden rounded-lg shadow-lg h-full min-h-[210px]">
    <Image src={imageUrl} alt={name} fill className="object-cover" />
    
    {/* 그라데이션 배경 */}
    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-95"></div>
    
    <div className="absolute inset-0 flex flex-col justify-end p-4">
      <h3 className="text-white text-xl font-semibold">{name}</h3>
      <p className="text-white">{`${listings} Properties`}</p>
      {description && <p className="text-white text-sm">{description}</p>} {/* 설명 표시 */}
    </div>
  </div>
);

export default CityCard;
