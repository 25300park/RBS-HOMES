import { getUnitList } from "@/lib/action";
import Map from "./components/map";
import MapSideBar from "./components/map-side-bar";

export interface MapHomeProps {
  searchParams: any;
}

const MapHome = async ({ searchParams }: MapHomeProps) => {
  const { units } = await getUnitList(searchParams);

  return (
    <div>
      <div className="flex h-[calc(100vh-5rem)] border-t">
        {/* 사이드바 */}
          <MapSideBar />

        {/* 맵 */}
        <div className="w-full h-full">
          <Map units={units} />
        </div>
      </div>
    </div>
  );
};

export default MapHome;
