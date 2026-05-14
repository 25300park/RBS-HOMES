"use client";

import { useEffect, useState, useRef } from "react";
import { useMapStore } from "@/store/use-map-store";
import SideUnitCard from "../../map/components/side-unit-card";
import { useRouter, useSearchParams } from "next/navigation";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { LodaingUi } from "@/components/ui/loading-ui";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Delete, Pencil, Trash, Search, Filter, X } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteUnit } from "../(auth)/unit/my-list/action";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { generatePropertySlug } from "@/lib/utils";

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
  fullAddress: string;
  type: string;
  furniture: string;
  petPolicy: string;
}

export interface MyListSideProps {
  type?: "rent" | "sale";
}

interface FilterState {
  search: string;
  city: string;
  bed: string;
  bath: string;
  priceMin: string;
  priceMax: string;
  areaMin: string;
  areaMax: string;
  furniture: string;
  pet: string;
  activeTypes: string[];
}

const MyListSide = ({ type }: MyListSideProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 20;
  
  // 필터 상태
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    city: "All Cities",
    bed: "none",
    bath: "none",
    priceMin: "",
    priceMax: "",
    areaMin: "",
    areaMax: "",
    furniture: "none",
    pet: "none",
    activeTypes: ["rent", "sale", "presale"]
  });

  const hasMore = loadedUnits.length < filteredUnits.length;
  const observer = useRef<IntersectionObserver | null>(null);
  const lastUnitElementRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  // URL 파라미터에서 필터 초기화
  useEffect(() => {
    const urlFilters: FilterState = {
      search: searchParams.get('search') || "",
      city: searchParams.get('city') || "All Cities",
      bed: searchParams.get('bed') || "none",
      bath: searchParams.get('bath') || "none",
      priceMin: searchParams.get('priceMin') || "",
      priceMax: searchParams.get('priceMax') || "",
      areaMin: searchParams.get('areaMin') || "",
      areaMax: searchParams.get('areaMax') || "",
      furniture: searchParams.get('furniture') || "none",
      pet: searchParams.get('pet') || "none",
      activeTypes: searchParams.get('activeTypes')?.split(',') || ["rent", "sale", "presale"]
    };
    setFilters(urlFilters);
  }, [searchParams]);

  // 클라이언트 사이드 필터링
  const applyFilters = (units: Unit[]) => {
    return units.filter((unit) => {
      // 검색 필터
      if (filters.search && !unit.title.toLowerCase().includes(filters.search.toLowerCase()) && 
          !unit.address3.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // 도시 필터
      if (filters.city !== "All Cities" && unit.address2 !== filters.city) {
        return false;
      }

      // 침실 필터
      if (filters.bed !== "none" && unit.bed < parseInt(filters.bed)) {
        return false;
      }

      // 욕실 필터
      if (filters.bath !== "none" && unit.bath < parseInt(filters.bath)) {
        return false;
      }

      // 가격 필터
      if (filters.priceMin && unit.price < parseFloat(filters.priceMin)) {
        return false;
      }
      if (filters.priceMax && unit.price > parseFloat(filters.priceMax)) {
        return false;
      }

      // 면적 필터
      if (filters.areaMin && unit.area < parseFloat(filters.areaMin)) {
        return false;
      }
      if (filters.areaMax && unit.area > parseFloat(filters.areaMax)) {
        return false;
      }

      // 가구 필터
      if (filters.furniture !== "none" && unit.furniture !== filters.furniture) {
        return false;
      }

      // 펫 정책 필터
      if (filters.pet !== "none" && unit.petPolicy !== filters.pet) {
        return false;
      }

      // 유형 필터
      if (filters.activeTypes.length > 0 && !filters.activeTypes.includes(unit.sellType)) {
        return false;
      }

      return true;
    });
  };

  // visibleUnits 변경 시 필터링 적용
  useEffect(() => {
    const filtered = applyFilters(visibleUnits);
    setFilteredUnits(filtered);
    setLoadedUnits(filtered.slice(0, pageSize));
    setPage(2);
  }, [visibleUnits, filters]);

  // URL 업데이트
  const updateURL = (newFilters: FilterState) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "none" && value !== "All Cities") {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, value.toString());
        }
      }
    });
    
    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newURL);
  };

  // 필터 변경 핸들러
  const handleFilterChange = (key: keyof FilterState, value: string | string[]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  // 체크박스 핸들러
  const handleCheckboxChange = (sellType: string, checked: boolean) => {
    const newTypes = checked
      ? [...filters.activeTypes, sellType]
      : filters.activeTypes.filter(t => t !== sellType);
    handleFilterChange('activeTypes', newTypes);
  };

  // 필터 초기화
  const resetFilters = () => {
    const defaultFilters: FilterState = {
      search: "",
      city: "All Cities",
      bed: "none",
      bath: "none",
      priceMin: "",
      priceMax: "",
      areaMin: "",
      areaMax: "",
      furniture: "none",
      pet: "none",
      activeTypes: ["rent", "sale"]
    };
    setFilters(defaultFilters);
    updateURL(defaultFilters);
  };

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
    const nextPageUnits = filteredUnits.slice(
      (page - 1) * pageSize,
      page * pageSize
    );
    setTimeout(() => {
      setLoadedUnits((prev) => [...prev, ...nextPageUnits]);
      setPage((prev) => prev + 1);
      setIsLoading(false);
    }, 500);
  };

  // ✅ 교체
  const handleUnitClick = (unit: Unit) => {
    const slug = generatePropertySlug(unit)
    const url = `/properties/${slug}`
    if (isMobile) {
      router.push(url);
    } else {
      window.open(url, "_blank");
    }
  };

  const handleEdit = (unitId: number) => {
    router.push(`/account/unit/edit/${unitId}`);
  };

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
            {/* 헤더 및 검색 */}
            <div className="p-4 w-full border-b sticky top-0 bg-white z-20">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-center">
                  All Search Results{" "}
                  <span className="font-bold">{filteredUnits.length}</span> units
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1"
                >
                  <Filter className="h-3 w-3" />
                  Filters
                </Button>
              </div>
              
              {/* 검색 바 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title or location..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 필터 패널 */}
            {showFilters && (
              <div className="m-4 mb-0 border rounded-lg bg-white">
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Filters</h3>
                    <button 
                      onClick={resetFilters}
                      className="text-sm text-orange-600 hover:text-orange-800"
                    >
                      Reset All
                    </button>
                  </div>

                  {/* 유형 선택 */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Property Type</label>
                    <div className="flex gap-4">
                      {["rent", "sale"].map((sellType) => (
                        <label key={sellType} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.activeTypes.includes(sellType)}
                            onChange={(e) => handleCheckboxChange(sellType, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm capitalize">{sellType}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 침실/욕실 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Bedrooms</label>
                      <select 
                        value={filters.bed} 
                        onChange={(e) => handleFilterChange('bed', e.target.value)}
                        className="w-full p-2 border rounded-md bg-white"
                      >
                        <option value="none">Any</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Bathrooms</label>
                      <select 
                        value={filters.bath} 
                        onChange={(e) => handleFilterChange('bath', e.target.value)}
                        className="w-full p-2 border rounded-md bg-white"
                      >
                        <option value="none">Any</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                      </select>
                    </div>
                  </div>

                  {/* 가격 범위 */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Min price"
                        type="number"
                        value={filters.priceMin}
                        onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                      />
                      <Input
                        placeholder="Max price"
                        type="number"
                        value={filters.priceMax}
                        onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* 면적 범위 */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Area Range (sqft)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Min area"
                        type="number"
                        value={filters.areaMin}
                        onChange={(e) => handleFilterChange('areaMin', e.target.value)}
                      />
                      <Input
                        placeholder="Max area"
                        type="number"
                        value={filters.areaMax}
                        onChange={(e) => handleFilterChange('areaMax', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* 가구/펫 정책 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Furniture</label>
                      <select 
                        value={filters.furniture} 
                        onChange={(e) => handleFilterChange('furniture', e.target.value)}
                        className="w-full p-2 border rounded-md bg-white"
                      >
                        <option value="none">Any</option>
                        <option value="furnished">Furnished</option>
                        <option value="unfurnished">Unfurnished</option>
                        <option value="semi-furnished">Semi-furnished</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Pet Policy</label>
                      <select 
                        value={filters.pet} 
                        onChange={(e) => handleFilterChange('pet', e.target.value)}
                        className="w-full p-2 border rounded-md bg-white"
                      >
                        <option value="none">Any</option>
                        <option value="allowed">Allowed</option>
                        <option value="not-allowed">Not Allowed</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 유닛 리스트 */}
            <div className="grid grid-cols-1">
              {loadedUnits.map((unit: Unit, index: number) => (
                <div
                  key={`${unit.id}-${index}`}
                  className="relative"
                  ref={
                    index === loadedUnits.length - 1 ? lastUnitElementRef : null
                  }
                >
                  <SideUnitCard
                    onMouseEnter={() => setHoverUnitId(unit.id)}
                    onMouseLeave={() => setHoverUnitId(null)}
                    onClick={() => handleUnitClick(unit)}
                    title={unit.title}
                    price={Number(unit.price)}
                    sellType={unit.sellType}
                    area={unit.area}
                    location={`${unit.fullAddress}`}
                    imageUrl={unit.images[0]}
                    postedDate={"2 days ago"}
                    isVip={true}
                    bed={unit.bed}
                    bath={unit.bath}
                  />
                  <div className="absolute top-2 right-2 flex gap-2 z-10">
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

            {/* 로딩 인디케이터 */}
            {isLoading && (
              <div className="flex justify-center p-4">
                <div className="loader" />
                <span>Loading more units...</span>
              </div>
            )}

            {/* 결과 없음 메시지 */}
            {!isLoading && filteredUnits.length === 0 && (
              <div className="text-center p-8 text-gray-500">
                <p>No units found matching your criteria.</p>
                <button 
                  onClick={resetFilters} 
                  className="mt-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};

export default MyListSide;