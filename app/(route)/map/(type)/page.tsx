import { getUnitList } from "@/lib/action";
import MapSideBar from "../components/map-side-bar";
import { MapComponent } from "../components/map-component";
import { notFound } from "next/navigation";
import MobileMapSideBar from "@/app/(route)/map/components/mobile-map-side-bar";

export interface MapHomeProps {
  searchParams: any;
  params: any;
}
const MapHome = async ({ searchParams, params }: MapHomeProps) => {

  const { units } = await getUnitList(searchParams);
  return (
    <div>
      <div className="flex h-[calc(100vh-10rem)] md:h-screen relative md:static top-20">
        {/* 맵 */}
        <div className="w-full h-full">
          <MapComponent units={units}  key={units} />
        </div>
        <MobileMapSideBar />
        <MapSideBar />
      </div>
    </div>
  );
};

export default MapHome;
