import { Suspense } from 'react';
import { getUnitList } from "@/lib/action";
import { MapComponent } from "../components/map-component";
import { notFound } from "next/navigation";
import MobileMapSideBar from "@/app/(route)/map/components/mobile-map-side-bar";
import SideBarWrap from "../components/side-bar-wrap";
import Loading from './loading';
import FilterButton from "@/components/ui/filter-btn";
import MobileTypeSwitcher from "@/components/ui/mobile-type-switcher";

export interface MapHomeProps {
  searchParams: any;
  params: any;
}

const generateSearchKey = (params: MapHomeProps["searchParams"]) => {
  return Object.entries(params || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([key, value]) =>
        `${key}=${Array.isArray(value) ? value.join(",") : value}`
    )
    .join("&");
};

const MapHome = async ({ searchParams, params }: MapHomeProps) => {
  
  const newSearchParams = await searchParams;
  const searchKey = generateSearchKey(newSearchParams);
  // 데이터 가져오기
  const { units, error } = await getUnitList(newSearchParams).catch(
    (error) => ({
      units: [],
      error: error,
    })
  );
  if (error) {
    console.error("Error fetching units:", error);
    //에러처리
  }

  return (
    <div>
      {/* 거래유형 전환 바 — 모바일 전용 (hidden md:flex) */}
      <Suspense fallback={null}>
        <MobileTypeSwitcher
          paramKey="activeTypes"
          values={{ rent: "rent", sale: "sale", preSale: "preSale" }}
        />
      </Suspense>

      <div className="flex h-[calc(100vh-10rem)] md:h-screen relative md:static top-20">
        
        <Suspense fallback={<Loading />}>
          <div className="w-full h-full">
            <MapComponent 
              // key={`map-${searchKey}`}
              units={units}
              searchKey={searchKey}
            />
          </div>
          <SideBarWrap />
        </Suspense>
        
        <span className="hidden md:block fixed top-[90px] left-2">
            <FilterButton />
        </span>
        
      </div>
    </div>
  );
};

export default MapHome;
