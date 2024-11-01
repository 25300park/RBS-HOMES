"use client";

import ListCard from "@/components/ui/list-card";
import useHandleUnitClick from "@/hooks/use-handle-unit-click";

export interface FavoriteListProps {
  data: any;
}


const FavoriteList = ({ data }: FavoriteListProps): React.ReactNode => {
  const handleUnitClick = useHandleUnitClick();
  console.log(data)
  return (
    <div className="grid grid-cols-6 4xl:grid-cols-5 3xl:grid-cols-4 xs:grid-cols-1 2lg:grid-cols-3 tlg:grid-cols-2 gap-6 gap-y-10 p-12 md:p-4">
      {data.map((unit: any, index: number) => (
        <ListCard
          key={unit.id}
          unitId={unit.id}
          title={unit.title}
          price={unit.price}
          area={unit.area}
          location={unit.fullAdress}
          imageUrl={unit.images ? unit.images[0] : ""}
          postedDate={unit.postedDate}
          bed={unit.bed}
          bath={unit.bath}
          sellType={unit.sellType}
          isUrgent={false}
          isFavorited={unit.isFavorited}
          onClick={() => handleUnitClick(unit.id)}
        />
      ))}
    </div>
  );
};

export default FavoriteList;
