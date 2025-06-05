import { NextResponse } from 'next/server';

// 메모리 캐시 (간단한 구현)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30분 캐시

// 캐시 키 생성 함수
const generateCacheKey = (lat: string, lng: string, radius: string) => {
  // 위치를 반올림하여 근처 위치들이 같은 캐시를 사용하도록 함
  const roundedLat = Math.round(parseFloat(lat) * 1000) / 1000; // 소수점 3자리까지
  const roundedLng = Math.round(parseFloat(lng) * 1000) / 1000;
  return `nearby_${roundedLat}_${roundedLng}_${radius}`;
};

// 캐시에서 데이터 가져오기
const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// 캐시에 데이터 저장
const setCachedData = (key: string, data: any) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });

  // 캐시 크기 제한 (메모리 관리)
  if (cache.size > 100) {
    const oldestKey: any = cache.keys().next().value;
    cache.delete(oldestKey);
  }
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");
  const radius = searchParams.get("radius") || "1000";
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_KEY;

  if (!latitude || !longitude) {
    return NextResponse.json({ error: "Missing latitude or longitude" }, { status: 400 });
  }

  // 캐시 키 생성
  const cacheKey = generateCacheKey(latitude, longitude, radius);
  
  // 캐시된 데이터 확인
  const cachedResult = getCachedData(cacheKey);
  if (cachedResult) {
    console.log('Cache hit for key:', cacheKey);
    return NextResponse.json(cachedResult);
  }

  console.log('Cache miss for key:', cacheKey);

  const types = ["restaurant", "hospital", "pharmacy", "school", "park", "museum"];

  try {
    const fetchPromises = types.map(async (type) => {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type}: ${response.statusText}`);
      }
      
      return response.json();
    });

    const results = await Promise.all(fetchPromises);

    const categorizedResults = types.reduce<Record<string, any[]>>((acc, type, index) => {
      // API 응답에서 results 배열만 추출하고, 에러가 있으면 빈 배열로 처리
      acc[type] = results[index]?.results || [];
      return acc;
    }, {}); 

    // 결과를 캐시에 저장
    setCachedData(cacheKey, categorizedResults);

    return NextResponse.json(categorizedResults);
  } catch (error) {
    console.error("Error fetching nearby places:", error);
    return NextResponse.json({ error: "Failed to fetch nearby places" }, { status: 500 });
  }
}

// 캐시 정리를 위한 선택적 함수 (cron job 등에서 사용 가능)
export async function DELETE() {
  cache.clear();
  return NextResponse.json({ message: "Cache cleared" });
}