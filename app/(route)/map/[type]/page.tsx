import { getUnitList } from "@/lib/action";
import MapSideBar from "../components/map-side-bar";
import { MapComponent } from "../components/map-component";
import { notFound } from "next/navigation";
export interface MapHomeProps {
  searchParams: any;
  params: any;
}
const MapHome = async ({ searchParams, params }: MapHomeProps) => {
  const { type } = params;
  if (type !== "rent" && type !== "sale") {
    notFound();
  }
  const { units } = await getUnitList(searchParams, type);
  return (
    <div>
      <div className="flex h-[calc(100vh-5rem)] border-t">
        {/* 맵 */}
        <div className="w-full h-full">
          <MapComponent units={units} type={type} key={units} />
        </div>
        {/* 사이드바 */}
        <MapSideBar />
      </div>
    </div>
  );
};

export default MapHome;
