"use client";

import { useEffect, useState, useRef } from "react";
import { useMapStore } from "@/store/use-map-store";
import SideUnitCard from "../../map/components/side-unit-card";
import { useRouter } from "next/navigation";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { LodaingUi } from "@/components/ui/loading-ui";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Delete, Pencil, Trash } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteUnit } from "../(auth)/unit/my-list/action";
import { useToast } from "@/hooks/use-toast";

// 유닛 상태 enum 정의
enum UnitStatus {
  Ongoing = 1,
  Completed = 2,
  Contracted = 3,
  UnderNegotiation = 4,
}

interface Unit {
  id: number;
  title: string;
  price: number;
  sellType: string;
  area: number;
  address2: string;
  address3: string;
  address4: string;
  images: string[];
  bed: number;
  bath: number;
  status: UnitStatus;
  fullAdress: string;
}

export interface MyListSideProps {
  type?: "rent" | "sale";
}

const MyListSide = ({ type }: MyListSideProps) => {
  const router = useRouter();
  const {
    visibleUnits,
    isSidebarOpen,
    toggleSidebar,
    setHoverUnitId,
    isLoading: mapLoading,
  } = useMapStore();

  const isMobile = useMediaQuery("(max-width: 640px)");
  const [isLoading, setIsLoading] = useState(false);
  const [loadedUnits, setLoadedUnits] = useState<Unit[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const hasMore = loadedUnits.length < visibleUnits.length;
  const observer = useRef<IntersectionObserver | null>(null);
  const lastUnitElementRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  // Intersection Observer 설정
  useEffect(() => {
    if (isLoading) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreUnits();
      }
    });

    if (lastUnitElementRef.current) {
      observer.current.observe(lastUnitElementRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [isLoading, hasMore]);

  // 페이지 단위로 데이터 로드
  const loadMoreUnits = () => {
    setIsLoading(true);
    const nextPageUnits = visibleUnits.slice(
      (page - 1) * pageSize,
      page * pageSize
    );
    setTimeout(() => {
      setLoadedUnits((prev) => [...prev, ...nextPageUnits]);
      setPage((prev) => prev + 1);
      setIsLoading(false);
    }, 1000);
  };

  // visibleUnits가 변경될 때마다 초기화
  useEffect(() => {
    setLoadedUnits(visibleUnits.slice(0, pageSize));
    setPage(2);
  }, [visibleUnits]);

  const handleUnitClick = (unitId: number) => {
    if (isMobile) {
      router.push("/unit/detail/" + unitId);
    } else {
      window.open("/unit/detail/" + unitId, "_blank");
    }
  };

  // 유닛 상태 변경 함수
  const handleStatusChange = (unitId: number, newStatus: UnitStatus) => {
    setLoadedUnits((prevUnits) =>
      prevUnits.map((unit) =>
        unit.id === unitId ? { ...unit, status: newStatus } : unit
      )
    );
  };

  const handleEdit = (unitId: number) => {
    router.push(`/account/unit/edit/${unitId}`);
  };

  const handleDelete = (unitId: number) => {};

  const getStatusLabel = (status: UnitStatus): string => {
    switch (status) {
      case UnitStatus.Ongoing:
        return "Ongoing";
      case UnitStatus.Completed:
        return "Completed";
      case UnitStatus.Contracted:
        return "Contracted";
      case UnitStatus.UnderNegotiation:
        return "Under Negotiation";
      default:
        return "Unknown";
    }
  };

  return (
    <aside
      className={`fixed md:hidden top-[80px] right-0 h-[calc(100vh-88px)] bg-white border-l transition-all duration-300 ${
        isSidebarOpen ? "w-[700px] sm:w-full" : "w-0"
      }`}
    >
      <div
        className={`relative h-full overflow-y-auto ${
          isSidebarOpen ? "block" : "hidden"
        }`}
      >
        {mapLoading ? (
          <div className="p-4">
            <LodaingUi />
          </div>
        ) : (
          <>
            <div className="p-4 w-full text-center text-sm border-b sticky top-0 bg-white z-20">
              All Search Results{" "}
              <span className="font-bold">{visibleUnits.length}</span> units
            </div>
            <div className="grid grid-cols-1">
              {loadedUnits.map((unit: Unit, index: number) => (
                <div
                  key={index}
                  className="relative"
                  ref={
                    index === loadedUnits.length - 1 ? lastUnitElementRef : null
                  }
                >
                  <SideUnitCard
                    onMouseEnter={() => setHoverUnitId(unit.id)}
                    onMouseLeave={() => setHoverUnitId(null)}
                    onClick={() => handleUnitClick(unit.id)}
                    title={unit.title}
                    price={Number(unit.price)}
                    sellType={unit.sellType}
                    area={unit.area}
                    location={`${unit.fullAdress}`}
                    imageUrl={unit.images[0]}
                    postedDate={"2 days ago"}
                    isVip={true}
                    bed={unit.bed}
                    bath={unit.bath}
                  />
                  <div className="absolute top-2 right-2 flex  gap-2 z-10 ">
                    {/* <select
                      value={unit.status}
                      onChange={(e) => handleStatusChange(unit.id, Number(e.target.value) as UnitStatus)}
                      className="bg-white border rounded px-2 py-1 text-sm w-full"
                    >
                      {Object.values(UnitStatus)
                        .filter(value => typeof value === 'number')
                        .map((status) => (
                          <option key={status} value={status}>
                            {getStatusLabel(status as UnitStatus)}
                          </option>
                        ))}
                    </select> */}
                    <ConfirmDialog
                      title="Delete Unit"
                      description="Are you sure you want to delete this unit?"
                      confirmText="Delete"
                      onConfirm={async () => {
                        try {
                          const result = await deleteUnit(unit.id);

                          toast({
                            title: result.status === 200 ? "Success" : "Error",
                            description: result.message,
                            variant:
                              result.status === 200 ? "default" : "destructive",
                          });

                          if (result.status === 200) {
                            router.refresh();
                          }
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to delete unit",
                            variant: "destructive",
                          });
                        }
                      }}
                      triggerVariant="ghost"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center gap-1"
                      >
                        <Trash className="h-3 w-3" />
                        Delete
                      </Button>
                    </ConfirmDialog>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center gap-1"
                      onClick={() => handleEdit(unit.id)}
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {isLoading && (
              <div className="flex justify-center p-4">
                <div className="loader" />
                <span>Loading more units...</span>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};

export default MyListSide;
