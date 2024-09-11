export interface CityImgCardProps {
  city: any; 
  onClick: (e:any) => void;
  isActive: boolean;
}

const CityImgCard = ({city, onClick, isActive}: CityImgCardProps): React.ReactNode => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-center relative h-24 rounded-lg overflow-hidden focus:outline-none cursor-pointer group ${
        isActive ? "ring-4 ring-[#0CB8C5]" : ""
      }`}
    >
      <img
        src={city.image}
        alt={city.name}
        className={`${isActive ? "scale-105" : "scale-100"} absolute inset-0 object-cover w-full h-full  group-hover:scale-105 transition-all duration-300`}
      />
      <span className="z-10 text-white font-semibold text-md mb-4 h-full flex items-end">
        {city.name}
      </span>
      <div className={`${isActive ? "hidden" : ""} absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80 group-hover:opacity-0 transition-all duration-300`}></div>
    </div>
  );
};

export default CityImgCard;
