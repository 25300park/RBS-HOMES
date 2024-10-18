// pages/index.tsx
import MainList from "./components/main-list-section";
import BannerGroup from "./components/banner-group";
import FilterButton from "@/components/ui/filter-btn";
import { getMainList } from "./action"; 

export default async function DashBoard({ searchParams }: { searchParams: any }) {
  // const { units, total } = await getMainList(1, 10, searchParams);

  return (
    <div>
      <BannerGroup />
      <div className="mt-2">
        <FilterButton />
        <MainList   />
      </div>
    </div>
  );
}
