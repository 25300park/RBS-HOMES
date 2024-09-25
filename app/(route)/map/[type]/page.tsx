import { getUnitList } from "@/lib/action";
import MapSideBar from "../components/map-side-bar";
import { MapComponent } from "../components/map-component";

export interface MapHomeProps {
  searchParams: any;
  params: any;
}

const MapHome = async ({ searchParams, params }: MapHomeProps) => {
  const { type } = params;
  const { units } = await getUnitList(searchParams, type);

  return (
    <div>
      <div className="flex h-[calc(100vh-5rem)] border-t">
        {/* 맵 */}
        <div className="w-full h-full">
          <MapComponent units={units} />
        </div>
        {/* 사이드바 */}
        <MapSideBar type={type} />
      </div>
    </div>
  );
};

export default MapHome;
