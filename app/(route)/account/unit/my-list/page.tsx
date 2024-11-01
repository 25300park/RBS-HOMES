import UnitListPagination from "@/app/(route)/unit/components/unit-list-pagination";
import { getUnitListByOwner } from "./action";
import { MapComponent } from "@/app/(route)/map/components/map-component";
import MapSideBar from "@/app/(route)/map/components/map-side-bar";
import MobileMapSideBar from "@/app/(route)/map/components/mobile-map-side-bar";

export interface MyUnitListProps {
  searchParams: any;
}

const generateSearchKey = (params: MyUnitListProps["searchParams"]) => {
  return Object.entries(params || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([key, value]) =>
        `${key}=${Array.isArray(value) ? value.join(",") : value}`
    )
    .join("&");
};


const MyUnitList = async ({ searchParams }: MyUnitListProps) => {
  const newSearchParams = await searchParams;
  const searchKey = generateSearchKey(newSearchParams);
  const unitList = await getUnitListByOwner(searchParams);

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
