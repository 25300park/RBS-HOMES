import UnitListPagination from "@/app/(route)/unit/components/unit-list-pagination";
import { getUnitListById } from "./action";
import { MapComponent } from "@/app/(route)/map/components/map-component";
import MapSideBar from "@/app/(route)/map/components/map-side-bar";
import MobileMapSideBar from "@/app/(route)/map/components/mobile-map-side-bar";

export interface MyUnitListProps {
  searchParams: any;
}

const MyUnitList = async ({ searchParams }: MyUnitListProps) => {
  const unitList = await getUnitListById(searchParams);
  return (
    <div>
      <div className="flex h-[calc(100vh-5rem)] border-t">
        <div className="w-full h-full">
          <MapComponent units={unitList} owner key={"owner"} searchKey={""}/>
        </div>
        
        <MobileMapSideBar />
        <MapSideBar />
      </div>
    </div>
  );
};

export default MyUnitList;
