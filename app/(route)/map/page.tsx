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
      <div className="flex h-[calc(100vh-6rem)] border-t">
        {/* 사이드바 */}
        <div className=" h-full overflow-y-scroll border-r w-[50%] min-w-[630px]">
          <MapSideBar />
        </div>

        {/* 맵 */}
        <div className="w-full h-full">
          <Map units={units} />
        </div>
      </div>
      <div className="h-96">123</div>
    </div>
  );
};

export default MapHome;
