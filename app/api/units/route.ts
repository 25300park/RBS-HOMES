import { NextResponse } from 'next/server';
import { getUnitsWithAdmin } from '@/app/(route)/unit/action';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  // searchParams로부터 필터링 조건 추출
  const filterParams: Record<string, string> = {};

  ['type','sellType','bed', 'bath', 'parking', 'city', 'priceMin', 'priceMax', 'areaMin', 'areaMax', 'furniture', 'pet', 'search'].forEach((key) => {
    const value = searchParams.get(key);
    if (value && value !== "none" && value !== "All Cities") {
      filterParams[key] = value;
    }
  });
  // 필터링 조건 전달
  const data = await getUnitsWithAdmin(page, limit, filterParams);

  return NextResponse.json(data);
}
