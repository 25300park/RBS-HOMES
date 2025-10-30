import { NextResponse } from 'next/server';

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간 

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });

  if (cache.size > 100) {
    const oldestKey: any = cache.keys().next().value;
    cache.delete(oldestKey);
  }
};

export async function GET(req: Request) {
  const placeId = process.env.GOOGLE_PLACE_ID;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_KEY;

  if (!placeId) {
    return NextResponse.json(
      { error: 'GOOGLE_PLACE_ID 환경변수 누락' },
      { status: 500 }
    );
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GOOGLE_PLACES_API_KEY 환경변수 누락' },
      { status: 500 }
    );
  }

  const cacheKey = `reviews_${placeId}`;
  
  // 캐시 확인
  const cachedResult = getCachedData(cacheKey);
  if (cachedResult) {
    return NextResponse.json(cachedResult);
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,formatted_address,formatted_phone_number,website,opening_hours&key=${apiKey}&language=ko`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`API 에러: ${data.status} - ${data.error_message}`);
    }

    const result = data.result;

    // 리뷰 데이터 정리
    const reviewsData = {
      name: result.name,
      rating: result.rating || 0,
      userRatingsTotal: result.user_ratings_total || 0,
      address: result.formatted_address,
      phone: result.formatted_phone_number,
      website: result.website,
      openingHours: result.opening_hours?.weekday_text || [],
      reviews: (result.reviews || []).map((review: any) => ({
        authorName: review.author_name,
        authorUrl: review.author_url,
        profilePhotoUrl: review.profile_photo_url,
        rating: review.rating,
        text: review.text,
        time: review.time,
        relativeTime: review.relative_time_description,
      })),
    };

    // 캐시에 저장
    setCachedData(cacheKey, reviewsData);

    return NextResponse.json(reviewsData);
  } catch (error) {
    console.error('리뷰 조회 에러:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '리뷰 조회 실패' },
      { status: 500 }
    );
  }
}