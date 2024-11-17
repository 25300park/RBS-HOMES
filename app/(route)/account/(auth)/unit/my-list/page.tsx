import { getUnitListByOwner } from "./action";
import { MapComponent } from "@/app/(route)/map/components/map-component";
import MyListSide from "../../../components/my-list-sidebar";
import MyListMobSideBar from "../../../components/my-list-mob-sidbar";

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
      <div className="flex h-[calc(100vh-210px)] border-t">
        <div className="w-[calc(100vw-700px)] h-[calc(100vh-210px)]">
          <MapComponent units={unitList} owner key={"owner"} searchKey={""} />
        </div>
        <MyListMobSideBar />
        <MyListSide />
      </div>
    </div>
  );
};

export default MyUnitList;
