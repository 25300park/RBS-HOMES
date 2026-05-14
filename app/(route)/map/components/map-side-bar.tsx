"use client";

import { useEffect, useState } from "react";
import { useMapStore } from "@/store/use-map-store";
import { useModalStore } from "@/store/use-modal-store";
import SideUnitCard from "./side-unit-card";
import { useRouter } from "next/navigation";
import FilterButton from "@/components/ui/filter-btn";
import FilterResetButton from "@/components/ui/filter-reset-btn";
import { useObserver } from "@/hooks/use-observer";
import { useLoading } from "@/hooks/use-loading";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { LodaingUi } from "@/components/ui/loading-ui";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getFeaturedUnits } from "../../(dashboard)/action";
import { generatePropertySlug } from "@/lib/utils";


export interface MapSideBarProps {
 type?: "rent" | "sale";
}

const MapSideBar = ({ type }: MapSideBarProps) => {
 const router = useRouter();
 const { openModal } = useModalStore();
 const {
   visibleUnits,
   isSidebarOpen,
   toggleSidebar,
   setMapCenterAndZoom,
   setHoverUnitId,
   isLoading: mapLoading,
 } = useMapStore();
 const isMobile = useMediaQuery("(max-width: 640px)");
 const { isLoading, startLoading, stopLoading } = useLoading();
 const [loadedUnits, setLoadedUnits] = useState<any[]>([]);
 const [featuredUnits, setFeaturedUnits] = useState<any[]>([]);
 const [page, setPage] = useState(1);
 const pageSize = 20;
 const hasMore = loadedUnits.length < visibleUnits.length;
 const [sortOrder, setSortOrder] = useState<"low" | "high">("low");

 // Featured Units 로드
 useEffect(() => {
   getFeaturedUnits().then(units => {
     setFeaturedUnits(units);
   });
 }, []);

 const loadMoreUnits = () => {
   startLoading();
   const sortedUnits = sortUnits(visibleUnits);
   const nextPageUnits = sortedUnits.slice(
     (page - 1) * pageSize,
     page * pageSize
   );
   setTimeout(() => {
     setLoadedUnits((prev) => [...prev, ...nextPageUnits]);
     setPage((prev) => prev + 1);
     stopLoading();
   }, 1000);
 };

 const sortUnits = (units: any[]) => {
   return units.sort((a, b) => {
     if (sortOrder === "low") {
       return a.price - b.price;
     } else {
       return b.price - a.price;
     }
   });
 };

 const { lastElementRef } = useObserver(loadMoreUnits, hasMore, isLoading);

 useEffect(() => {
   const sortedUnits = sortUnits(visibleUnits);
   setLoadedUnits(sortedUnits.slice(0, pageSize));
   setPage(2);
 }, [visibleUnits, sortOrder]);

 const handleUnitClick = (unit: any) => {
  const slug = generatePropertySlug(unit)
  const url = `/properties/${slug}`
  if (isMobile) {
    router.push(url);
  } else {
    window.open(url, "_blank");
  }
 };

 const renderUnitCard = (card: any, index: number, isFeatured: boolean = false) => (
   <SideUnitCard
     onMouseEnter={() => setHoverUnitId(card.id)}
     onMouseLeave={() => setHoverUnitId(null)}
     onClick={() => handleUnitClick(card)}
     key={isFeatured ? `featured-${card.id}` : index}
     title={card.title}
     price={Number(card.price)}
     sellType={card.sellType}
     area={card.area}
     location={`${card.address2 as string},${
       card.address3 as string
     },${card.address4 as string}`}
     imageUrl={card.images ? (typeof card.images === 'string' ? JSON.parse(card.images)[0] : card.images[0]) : ''}
     postedDate={"2 days ago"}
     isVip={isFeatured}
     bed={card.bed as number}
     bath={card.bath as number}
     featured={isFeatured ? card.featured : undefined}
   />
 );

 return (
   <aside
     className={`fixed top-40 right-0 h-full bg-white border-l transition-all duration-300 md:hidden ${
       isSidebarOpen ? "w-[400px] sm:w-full" : "w-0"
     }`}
   >
     <div
       className={`relative h-[calc(100%-160px)] overflow-y-scroll ${
         isSidebarOpen ? "block" : "hidden"
       }`}
     >
       {mapLoading ? (
         <div className="p-4"><LodaingUi /></div>
       ) : (
         <>
           <div className="p-4 w-full text-center text-sm border-b">
             All Search Results <span className="font-bold">{visibleUnits.length}</span> units
           </div>
           
           {/* Featured Units */}
           {featuredUnits.length > 0 && (
             <div className="grid grid-cols-1">
               {featuredUnits.map((card) => renderUnitCard(card, 0, true))}
             </div>
           )}

           {/* Regular Units */}
           <div className="grid grid-cols-1">
             {loadedUnits.map((card, index) => renderUnitCard(card, index))}
           </div>

           <div ref={lastElementRef} />
           
           {isLoading && (
             <div className="flex justify-center p-4">
               <div className="loader" />
               <span>Loading more units...</span>
             </div>
           )}
         </>
       )}
     </div>

     <div>
       {isSidebarOpen ? (
         <button
           onClick={() => toggleSidebar(!isSidebarOpen)}
           className="absolute top-[26px] -left-12 bg-white border rounded-md p-2 shadow-lg transform -translate-y-1/2"
         >
           <IoIosArrowForward size={24} />
         </button>
       ) : (
         <button
           onClick={() => toggleSidebar(!isSidebarOpen)}
           className="absolute top-[8px] w-40 -left-44 bg-white p-2 rounded-md border flex items-center gap-4 shadow-lg"
         >
           <IoIosArrowBack size={24} />
           <p>Show list</p>
         </button>
       )}
     </div>
   </aside>
 );
};

export default MapSideBar;