"use client";

import { useState, useEffect } from "react";
import ListCard from "@/components/ui/list-card";
import { Skeleton } from "@/components/ui/skeleton";
import useHandleUnitClick from "@/hooks/use-handle-unit-click";
import { 
  MapPin, 
  Clock, 
  ArrowRight, 
  Building2, 
  Landmark,
  Home,
  Plane,
  TreePine,
  Camera,
  Building
} from "lucide-react";

interface Unit {
  id: number;
  title: string;
  price: number;
  address3: string;
  outstandingPayment: number;
  area: number;
  images: any;
  postedDate: string;
  sellType: string;
  bed: number;
  bath: number;
  fullAdress: string;
  isFavorited: boolean;
}

interface AreaInfo {
  name: string;
  keywords: string[];
  displayName: string;
}

interface FeaturedPropertiesResponse {
  recentUnits?: Unit[];
  bonifacioUnits?: Unit[];
  makatiUnits?: Unit[];
  mandaluyongUnits?: Unit[];
  muntinlupaUnits?: Unit[];
  pasayUnits?: Unit[];
  quezonUnits?: Unit[];
  paranaqueUnits?: Unit[];
  areaInfo?: { [key: string]: AreaInfo };
}

// 지역별 아이콘 매핑
const AREA_ICONS = {
  bonifacio: <Building2 className="w-6 h-6 text-orange-500" />,
  makati: <Building2 className="w-6 h-6 text-orange-500" />,
  mandaluyong: <Building2 className="w-6 h-6 text-orange-500" />,
  muntinlupa: <Building2 className="w-6 h-6 text-orange-500" />,
  pasay: <Building2 className="w-6 h-6 text-orange-500" />,
  quezon: <Building2 className="w-6 h-6 text-orange-500" />,
  paranaque: <Building2 className="w-6 h-6 text-orange-500" />,
  recent: <Clock className="w-6 h-6 text-orange-500" />
};

// 지역별 설명 매핑
const AREA_DESCRIPTIONS = {
  bonifacio: "Premium properties in BGC and Bonifacio Global City",
  makati: "Prime CBD location with business district convenience",
  mandaluyong: "Modern developments in Ortigas and Mandaluyong area",
  muntinlupa: "Family-friendly communities in Alabang and Muntinlupa",
  pasay: "Strategic location near airport and entertainment district",
  quezon: "Diverse neighborhoods in the largest city of Metro Manila",
  paranaque: "Coastal living with city accessibility",
  recent: "Latest properties added to our platform"
};

// 지역별 검색 링크 매핑
const AREA_SEARCH_LINKS = {
  bonifacio: "/map?search=Bonifacio",
  makati: "/map?search=Makati",
  mandaluyong: "/map?search=Mandaluyong",
  muntinlupa: "/map?search=Muntinlupa",
  pasay: "/map?search=Pasay",
  quezon: "/map?search=Quezon",
  paranaque: "/map?search=Paranaque",
  recent: "/map"
};

const FeaturedPropertiesSection = () => {
  const [data, setData] = useState<FeaturedPropertiesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleSections, setVisibleSections] = useState<string[]>([]);
  const handleUnitClick = useHandleUnitClick();

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setIsLoading(true);
        // 모든 지역의 매물을 가져옴
        const response = await fetch('/api/units/best?type=all&limit=4');
        
        if (!response.ok) {
          throw new Error('Failed to fetch featured properties');
        }
        
        const result = await response.json();
        setData(result);

        // 데이터가 있는 섹션들 확인
        const sections = Object.keys(result).filter(key => 
          key.endsWith('Units') && result[key]?.length > 0
        );
        setVisibleSections(sections);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Failed to fetch featured properties:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  const renderSkeletonCards = () => (
    <div className="grid grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-gray-200 rounded-lg h-64 animate-pulse" />
      ))}
    </div>
  );

  const renderPropertySection = (
    sectionKey: string,
    title: string,
    subtitle: string,
    icon: React.ReactNode,
    units: Unit[],
    viewAllLink?: string
  ) => (
    <div key={sectionKey} className="mb-12">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
            {/* <p className="text-gray-600">{subtitle}</p> */}
          </div>
        </div>
        
        {viewAllLink && (
          <button 
            onClick={() => window.location.href = viewAllLink}
            className="flex items-center space-x-2 text-orange-500 hover:text-orange-600 font-medium transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 매물 카드 그리드 */}
      <div className="grid grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-3">
        {units.slice(0, 6).map((unit) => (
          <ListCard
            key={unit.id}
            unitId={unit.id}
            title={unit.title}
            price={unit.price}
            area={unit.area}
            location={unit.fullAdress}
            imageUrl={unit.images ? JSON.parse(unit.images)[0] : ""}
            postedDate={unit.postedDate}
            bed={unit.bed}
            bath={unit.bath}
            sellType={unit.sellType}
            isFavorited={unit.isFavorited}
            onClick={() => handleUnitClick(unit.id)}
          />
        ))}
      </div>
    </div>
  );

  // 섹션 순서 정의 (recent를 마지막에)
  const getSectionOrder = () => {
    const areaOrder = ['bonifacio', 'makati', 'mandaluyong', 'muntinlupa', 'pasay', 'quezon', 'paranaque'];
    const orderedSections: string[] = [];
    
    // 지역별 섹션들을 순서대로 추가
    areaOrder.forEach(area => {
      const sectionKey = `${area}Units`;
      if (visibleSections.includes(sectionKey)) {
        orderedSections.push(sectionKey);
      }
    });
    
    // 최근 매물을 마지막에 추가
    if (visibleSections.includes('recentUnits')) {
      orderedSections.push('recentUnits');
    }
    
    return orderedSections;
  };

  if (error) {
    return (
      <div className="bg-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-red-600 p-8 bg-red-50 rounded-lg">
            <p className="text-lg font-medium">Failed to load featured properties</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 메인 섹션 타이틀 (필요시 주석 해제)
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Featured Properties
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the best properties in prime locations and explore our latest listings
          </p>
        </div> */}

        {isLoading ? (
          <>
            {/* 여러 섹션 스켈레톤 */}
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="mb-12">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div>
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                {renderSkeletonCards()}
              </div>
            ))}
          </>
        ) : (
          data && (
            <>
              {getSectionOrder().map((sectionKey) => {
                const units = data[sectionKey as keyof FeaturedPropertiesResponse] as Unit[];
                if (!units || units.length === 0) return null;

                // 섹션 키에서 지역명 추출
                const areaKey = sectionKey.replace('Units', '');
                const areaInfo = data.areaInfo?.[areaKey];
                
                const title = areaKey === 'recent' 
                  ? 'Recently Listed'
                  : areaInfo?.displayName || `Popular in ${areaKey}`;
                
                const description = AREA_DESCRIPTIONS[areaKey as keyof typeof AREA_DESCRIPTIONS] || 
                  `Properties in ${areaKey}`;
                
                const icon = AREA_ICONS[areaKey as keyof typeof AREA_ICONS] || 
                  <MapPin className="w-6 h-6 text-orange-500" />;
                
                const searchLink = AREA_SEARCH_LINKS[areaKey as keyof typeof AREA_SEARCH_LINKS];

                return renderPropertySection(
                  sectionKey,
                  title,
                  description,
                  icon,
                  units,
                  searchLink
                );
              })}
            </>
          )
        )}

        {/* 데이터가 없을 때 */}
        {!isLoading && data && visibleSections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No featured properties available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedPropertiesSection;