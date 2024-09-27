import UnitListPagination from "@/app/(route)/unit/components/unit-list-pagination";
import { getUnitListById } from "./action";
import { MapComponent } from "@/app/(route)/map/components/map-component";

export interface MyUnitListProps {
  searchParams: any;
}

const MyUnitList = async ({ searchParams }: MyUnitListProps) => {
  const unitList = await getUnitListById(searchParams);
  return (
    <div>
      <div className="w-full h-full">
        <MapComponent units={unitList} owner />
      </div>
    </div>
  );
};

export default MyUnitList;
