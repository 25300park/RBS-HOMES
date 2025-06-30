"use client";

import { useState, useEffect } from "react";
import ListCard from "@/components/ui/list-card";
import { Skeleton } from "@/components/ui/skeleton";
import useHandleUnitClick from "@/hooks/use-handle-unit-click";
import { MapPin, Clock, ArrowRight } from "lucide-react";

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

interface FeaturedPropertiesResponse {
  popularBonifacioUnits: Unit[];
  recentUnits: Unit[];
}

const FeaturedPropertiesSection = () => {
  const [data, setData] = useState<FeaturedPropertiesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const handleUnitClick = useHandleUnitClick();

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/units/best?type=both&limit=6');
        
        if (!response.ok) {
          throw new Error('Failed to fetch featured properties');
        }
        
        const result = await response.json();
        setData(result);
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
    <div className="grid grid-cols-6 lg:grid-cols-3 md:grid-cols-1 gap-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} />
      ))}
    </div>
  );

  const renderPropertySection = (
    title: string,
    subtitle: string,
    icon: React.ReactNode,
    units: Unit[],
    viewAllLink?: string
  ) => (
    <div className="mb-12">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
            <p className="text-gray-600">{subtitle}</p>
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
      <div className="grid grid-cols-6 lg:grid-cols-3 md:grid-cols-1 gap-3">
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
        {/* 메인 섹션 타이틀
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
            {/* 인기지역 스켈레톤 */}
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div>
                  <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              {renderSkeletonCards()}
            </div>

            {/* 최근매물 스켈레톤 */}
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div>
                  <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              {renderSkeletonCards()}
            </div>
          </>
        ) : (
          data && (
            <>
              {/* 인기지역 (Bonifacio/BGC) 매물 */}
              {data.popularBonifacioUnits.length > 0 && renderPropertySection(
                "Popular in Bonifacio",
                "Premium properties in BGC and Bonifacio Global City",
                <MapPin className="w-6 h-6 text-orange-500" />,
                data.popularBonifacioUnits,
                "/map?search=Bonifacio Global City, Taguig City, Metro Manila, Philippines"
              )}

              {/* 최근 등록 매물 */}
              {data.recentUnits.length > 0 && renderPropertySection(
                "Recently Listed",
                "Latest properties added to our platform",
                <Clock className="w-6 h-6 text-orange-500" />,
                data.recentUnits,
                "/map"
              )}
            </>
          )
        )}

        {/* 데이터가 없을 때 */}
        {!isLoading && data && 
         data.popularBonifacioUnits.length === 0 && 
         data.recentUnits.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No featured properties available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedPropertiesSection;