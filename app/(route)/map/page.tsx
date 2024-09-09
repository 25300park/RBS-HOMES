import { getUnitList } from "@/lib/action";
import Map from "./components/map";
import MapSideBar from "./components/map-side-bar";

export interface MapHomeProps {
  searchParams: any;
}

const MapHome = async ({ searchParams }: MapHomeProps) => {
  const { units } = await getUnitList(searchParams);
  console.log(units)
  return (
    <div className="flex">
      <MapSideBar />
      <Map units={units} />
    </div>
  );
};

export default MapHome;
